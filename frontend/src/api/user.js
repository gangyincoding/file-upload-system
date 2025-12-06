import request from '../utils/request';

// 获取所有用户列表（管理员）
export const getAllUsers = (params) => {
  return request({
    url: '/users',
    method: 'get',
    params
  });
};

// 获取单个用户信息（管理员）
export const getUserById = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'get'
  });
};

// 更新用户信息（管理员）
export const updateUser = (id, data) => {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  });
};

// 删除用户（管理员）
export const deleteUser = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  });
};
