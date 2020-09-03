import request from '@/utils/request'

/**
 * 权限列表
 * @returns {AxiosPromise}
 */
export function permissionList() {
  return request({
    url: '/system/permission',
    method: 'get'
  })
}

/**
 * 获取权限树
 * @returns {AxiosPromise}
 */
export function permissionTree() {
  return request({
    url: '/system/permission/tree',
    method: 'get'
  })
}

/**
 * 添加权限
 * @param data
 * @returns {AxiosPromise}
 */
export function permissionCreate(data) {
  return request({
    url: '/system/permission/create',
    method: 'post',
    data
  })
}

/**
 * 修改权限
 * @param data
 * @returns {AxiosPromise}
 */
export function permissionUpdate(data) {
  return request({
    url: '/system/permission/update',
    method: 'post',
    data
  })
}

/**
 * 删除权限
 * @param id
 * @returns {AxiosPromise}
 */
export function permissionDestroy(id) {
  return request({
    url: '/system/permission/destroy/' + id,
    method: 'post'
  })
}
