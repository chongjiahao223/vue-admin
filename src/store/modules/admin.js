import { login, logout, getInfo } from '@/api/admin'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { Message } from 'element-ui'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    permission: '',
  }
}

const state = getDefaultState()

const mutations = {
  // RESET_STATE: (state) => {
  //   Object.assign(state, getDefaultState())
  // },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_PERMISSION: (state, permission) => {
    state.permission = permission
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { phone, password, remember } = userInfo
    return new Promise((resolve, reject) => {
      login({ phone: phone.trim(), password: password, remember: remember }).then(response => {
        const token = response.data.data.token_type +' '+ response.data.data.access_token
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        if (response.data.code == 200) {
          commit('SET_NAME', response.data.data.name)
          commit('SET_AVATAR', response.data.data.name)
          commit('SET_PERMISSION', response.data.data.permission)
          resolve(response.data.data.permission)
        } else {
          Message({
            message: '获取账户信息错误',
            type: 'error',
            duration: 5 * 1000
          })
          reject()
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(response => {
        if (response.data.code == 200 || response.data.code == 401) {
          removeToken() // must remove  token  first
          // commit('RESET_STATE')
          commit('SET_TOKEN', '')
          commit('SET_NAME', '')
          commit('SET_AVATAR', '')
          commit('SET_PERMISSION', '')
          resolve(response)
        } else {
          Message({
            message: response.data.message,
            type: 'error',
            duration: 2 * 1000
          })
          resolve()
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },

  FedLogOut({ commit }) {
    return new Promise(resolve => {
      // commit('RESET_STATE')
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      commit('SET_AVATAR', '')
      commit('SET_PERMISSION', '')
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
