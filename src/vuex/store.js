import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import AuthAPI from '@/services/AuthAPI.js';
import jwt from 'jsonwebtoken';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null
  },
  mutations: {
    // Store the user in our vuex state, add their token to 
    // local storage, and add their token to the axios header
    // for any asynchronous requests that will be made
    SET_USER_DATA(state, userData){
      if(userData != null) {
        state.user = userData
        localStorage.setItem('user', JSON.stringify(userData))
        axios.defaults.headers.common['Authorization'] = `Bearer ${
          userData.token
        }`
      }
    },
    CLEAR_USER_DATA() {
      localStorage.removeItem('user')
      location.reload()
    },
    SET_NEW_TOKEN(state){
      let current_user = state.user.current_user
      const token = jwt.sign(current_user.user_id + current_user.last_name +
        current_user.first_name, "dsad923Scxsdds1281230aFJ9DF0Ujmf")
      axios.defaults.headers.common['Authorization'] = `Bearer ${
        token
      }`
    },
  },
  actions: {
    login({ commit }, user) {
      return AuthAPI.login(user)
        .then(({data}) => {
          commit('SET_USER_DATA', data)
        })
    },
    loginCAS({ commit }) {
      return AuthAPI.loginStatus()
        .then(({data}) => {
          commit('SET_USER_DATA', data)
        })
    },
    logout({ commit }) {
      commit('CLEAR_USER_DATA')
    },
    setPermanentPassword({ commit }, user) {
      return AuthAPI.setPermanentPassword(user)
        .then(({data}) => {
          commit('SET_USER_DATA', data)
        })
    },
    fixTokenIfNeeded({commit}) {
      let auth_header = axios.defaults.headers.common['Authorization']
      console.log("auth_header", auth_header)
      if(auth_header.length > 400) {
        console.log("Updating auth header")
        commit('SET_NEW_TOKEN')
        console.log("New auth header", axios.defaults.headers.common['Authorization'])
      }
    }
  },
  getters: {
    loggedIn(state) {
      //returns true if there is state in state.user, false otherwise
      return !!state.user
    }
  }
})
