import request from '@/utils/request'

/**
 * 登录
 * @param data
 * @returns {AxiosPromise}
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @param token
 * @returns {*}
 */
export function getInfo() {
  return request({
    url: '/system/admin/info',
    method: 'post',
  })
}

/**
 * 登出
 * @returns {AxiosPromise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 用户列表
 * @param data
 * @returns {AxiosPromise}
 */
export function adminList(data) {
  return request({
    url: '/system/admins',
    method: 'post',
    data
  })
}

/**
 * 添加用户
 * @param data
 * @returns {AxiosPromise}
 */
export function adminCreate(data) {
  return request({
    url: '/system/admin/create',
    method: 'post',
    data
  })
}

/**
 * 编辑用户
 * @param data
 * @returns {AxiosPromise}
 */
export function adminUpdate(data) {
  return request({
    url: '/system/admin/update',
    method: 'post',
    data
  })
}

/**
 * 分配角色
 * @param data
 * @returns {AxiosPromise}
 */
export function adminRole(data) {
  return request({
    url: '/system/admin/role',
    method: 'post',
    data
  })
}

/**
 * 删除用户
 * @param data
 * @returns {AxiosPromise}
 */
export function adminDestroy(data) {
  return request({
    url: '/system/admin/destroy',
    method: 'post',
    data
  })
}

/**
 * 获取角色
 * @returns {AxiosPromise}
 */
export function getRole() {
  return request({
    url: '/system/role/all',
    method: 'get'
  })
}
