import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import ro from 'element-ui/src/locale/lang/ro'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

/**
 * 权限判断函数
 * @param permissions
 * @param permission
 * @returns {boolean|*}
 */
function hasPermission(permissions, permission) {
  if (!permission) return true
  return permissions.includes(permission)
}

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  // const hasToken = getToken()

  if (store.getters.token) { // 判断token是否存在
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.name) { // 判断是否拉取完用户信息
        // 判断是否有权限
        if (hasPermission(store.getters.permission, to.permission)) {
          next()
        } else {
          next({ path: '/401', replace: true, query: { noGoBack: true }})
        }
      } else {
        store.dispatch('admin/getInfo').then(res => { // 拉取用户信息
          const roles = res
          store.dispatch('permission/generateRoutes', roles ).then(() => {
            router.addRoutes(store.getters.addRoutes) // 动态添加可访问的路由
            next({...to, replace:true})
          }).catch(() => {
            store.dispatch('admin/FedLogOut').then(() => {
              next(`/login?redirect=${to.path}`)
              NProgress.done()
            })
          })
        }).catch(() => {
          store.dispatch('admin/FedLogOut').then(() => {
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          })
        })
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
