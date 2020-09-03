import request from '@/utils/request'

/**
 * 角色列表
 * @returns {AxiosPromise}
 */
export function roleList(data) {
  return request({
    url: '/system/role',
    method: 'post',
    data
  })
}

/**
 * 新增角色
 * @param data
 * @returns {AxiosPromise}
 */
export function roleCreate(data) {
  return request({
    url: '/system/role/create',
    method: 'post',
    data
  })
}

/**
 * 编辑角色
 * @param data
 * @returns {AxiosPromise}
 */
export function roleUpdate(data) {
  return request({
    url: '/system/role/update',
    method: 'post',
    data
  })
}

/**
 * 角色添加权限
 * @param data
 * @returns {AxiosPromise}
 */
export function createRolePermission(data) {
  return request({
    url: '/system/role/permission/create',
    method: 'post',
    data
  })
}

/**
 * 删除角色
 * @param data
 * @returns {AxiosPromise}
 */
export function roleDestroy(data) {
  return request({
    url: '/system/role/destroy',
    method: 'post',
    data
  })
}
