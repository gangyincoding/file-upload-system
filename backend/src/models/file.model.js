import { pool } from '../config/db.config.js';

class File {
  // 创建文件记录
  static async create({
    filename,
    original_name,
    file_path,
    file_size,
    mime_type,
    user_id,
    description = ''
  }) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO files (filename, original_name, file_path, file_size, mime_type, user_id, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [filename, original_name, file_path, file_size, mime_type, user_id, description]
      );

      return {
        id: result.insertId,
        filename,
        original_name,
        file_path,
        file_size,
        mime_type,
        user_id,
        description
      };
    } catch (error) {
      throw error;
    }
  }

  // 根据ID查找文件
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.*, u.username, u.email
         FROM files f
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 获取用户的文件列表
  static async findByUserId(userId, page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM files WHERE user_id = ?';
      let countQuery = 'SELECT COUNT(*) as total FROM files WHERE user_id = ?';
      const params = [userId];
      const countParams = [userId];

      // 如果有搜索关键词
      if (search) {
        query += ' AND (original_name LIKE ? OR description LIKE ?)';
        countQuery += ' AND (original_name LIKE ? OR description LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
        countParams.push(searchPattern, searchPattern);
      }

      // 获取总数
      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      // 获取文件列表
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.execute(query, params);

      return {
        files: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取所有文件列表（管理员）
  static async findAll(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT f.*, u.username, u.email
        FROM files f
        LEFT JOIN users u ON f.user_id = u.id
      `;
      let countQuery = 'SELECT COUNT(*) as total FROM files f';
      const params = [];
      const countParams = [];

      // 如果有搜索关键词
      if (search) {
        query += ' WHERE (f.original_name LIKE ? OR f.description LIKE ? OR u.username LIKE ?)';
        countQuery += ' WHERE (f.original_name LIKE ? OR f.description LIKE ? OR u.username LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
        countParams.push(searchPattern, searchPattern, searchPattern);
      }

      // 获取总数
      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      // 获取文件列表
      query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.execute(query, params);

      return {
        files: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 更新文件信息
  static async update(id, data) {
    try {
      const fields = [];
      const values = [];

      if (data.original_name) {
        fields.push('original_name = ?');
        values.push(data.original_name);
      }
      if (data.description !== undefined) {
        fields.push('description = ?');
        values.push(data.description);
      }

      if (fields.length === 0) {
        throw new Error('没有要更新的字段');
      }

      values.push(id);

      await pool.execute(
        `UPDATE files SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // 删除文件记录
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM files WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取文件统计信息
  static async getStatistics(userId = null) {
    try {
      let query = `
        SELECT
          COUNT(*) as total_files,
          SUM(file_size) as total_size,
          AVG(file_size) as avg_size
        FROM files
      `;

      if (userId) {
        query += ' WHERE user_id = ?';
        const [rows] = await pool.execute(query, [userId]);
        return rows[0];
      } else {
        const [rows] = await pool.execute(query);
        return rows[0];
      }
    } catch (error) {
      throw error;
    }
  }
}

export default File;
