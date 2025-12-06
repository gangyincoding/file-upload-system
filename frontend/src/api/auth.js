import request from '../utils/request';

// 用户注册
export const register = (data) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  });
};

// 用户登录
export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  });
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return request({
    url: '/auth/me',
    method: 'get'
  });
};

// 更新用户信息
export const updateProfile = (data) => {
  return request({
    url: '/auth/profile',
    method: 'put',
    data
  });
};

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/auth/password',
    method: 'put',
    data
  });
};
