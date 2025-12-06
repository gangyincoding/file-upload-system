import File from '../models/file.model.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 上传单个文件
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const { description = '' } = req.body;

    // 保存文件信息到数据库
    const fileData = await File.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      user_id: req.user.id,
      description
    });

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: fileData
    });
  } catch (error) {
    console.error('文件上传错误:', error);

    // 如果数据库保存失败，删除已上传的文件
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('删除文件失败:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
};

// 上传多个文件
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const { description = '' } = req.body;
    const uploadedFiles = [];

    // 保存所有文件信息到数据库
    for (const file of req.files) {
      const fileData = await File.create({
        filename: file.filename,
        original_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        user_id: req.user.id,
        description
      });
      uploadedFiles.push(fileData);
    }

    res.status(201).json({
      success: true,
      message: `成功上传 ${uploadedFiles.length} 个文件`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('批量文件上传错误:', error);

    // 如果数据库保存失败，删除已上传的文件
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('删除文件失败:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
};

// 获取文件列表
export const getFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let result;

    // 管理员可以查看所有文件，普通用户只能查看自己的文件
    if (req.user.role === 'admin') {
      result = await File.findAll(page, limit, search);
    } else {
      result = await File.findByUserId(req.user.id, page, limit, search);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取文件列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取文件列表失败',
      error: error.message
    });
  }
};

// 获取单个文件信息
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 检查权限：用户只能查看自己的文件，管理员可以查看所有文件
    if (req.user.role !== 'admin' && file.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限访问此文件'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('获取文件信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取文件信息失败',
      error: error.message
    });
  }
};

// 下载文件
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 检查权限
    if (req.user.role !== 'admin' && file.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限下载此文件'
      });
    }

    // 检查文件是否存在
    try {
      await fs.access(file.file_path);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: '文件不存在于服务器'
      });
    }

    // 设置响应头并发送文件
    res.download(file.file_path, file.original_name, (err) => {
      if (err) {
        console.error('文件下载错误:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: '文件下载失败'
          });
        }
      }
    });
  } catch (error) {
    console.error('下载文件错误:', error);
    res.status(500).json({
      success: false,
      message: '下载文件失败',
      error: error.message
    });
  }
};

// 更新文件信息
export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { original_name, description } = req.body;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 检查权限
    if (req.user.role !== 'admin' && file.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限修改此文件'
      });
    }

    const updatedFile = await File.update(id, {
      original_name,
      description
    });

    res.json({
      success: true,
      message: '文件信息更新成功',
      data: updatedFile
    });
  } catch (error) {
    console.error('更新文件信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新文件信息失败',
      error: error.message
    });
  }
};

// 删除文件
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 检查权限：用户只能删除自己的文件，管理员可以删除所有文件
    if (req.user.role !== 'admin' && file.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此文件'
      });
    }

    // 删除物理文件
    try {
      await fs.unlink(file.file_path);
    } catch (err) {
      console.error('删除物理文件失败:', err);
      // 即使物理文件删除失败，也继续删除数据库记录
    }

    // 删除数据库记录
    await File.delete(id);

    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除文件错误:', error);
    res.status(500).json({
      success: false,
      message: '删除文件失败',
      error: error.message
    });
  }
};

// 获取文件统计信息
export const getStatistics = async (req, res) => {
  try {
    let stats;

    // 管理员可以查看全局统计，普通用户只能查看自己的统计
    if (req.user.role === 'admin') {
      stats = await File.getStatistics();
    } else {
      stats = await File.getStatistics(req.user.id);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
};
