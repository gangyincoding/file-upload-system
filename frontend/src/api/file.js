import request from '../utils/request';

// 上传单个文件
export const uploadFile = (formData, onUploadProgress) => {
  return request({
    url: '/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
};

// 上传多个文件
export const uploadMultipleFiles = (formData, onUploadProgress) => {
  return request({
    url: '/files/upload-multiple',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
};

// 获取文件列表
export const getFiles = (params) => {
  return request({
    url: '/files',
    method: 'get',
    params
  });
};

// 获取文件统计信息
export const getStatistics = () => {
  return request({
    url: '/files/statistics',
    method: 'get'
  });
};

// 获取单个文件信息
export const getFileById = (id) => {
  return request({
    url: `/files/${id}`,
    method: 'get'
  });
};

// 下载文件
export const downloadFile = (id, filename) => {
  return request({
    url: `/files/${id}/download`,
    method: 'get',
    responseType: 'blob'
  }).then(response => {
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
};

// 更新文件信息
export const updateFile = (id, data) => {
  return request({
    url: `/files/${id}`,
    method: 'put',
    data
  });
};

// 删除文件
export const deleteFile = (id) => {
  return request({
    url: `/files/${id}`,
    method: 'delete'
  });
};
