import Vue from "vue";
import App from "./App.vue";
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import router from './routes.js'
import store from './vuex/store'

import VueAxios from 'vue-axios';
import axios from 'axios';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import PortalVue from "portal-vue"
import SuiVue from "semantic-ui-vue"
Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker);
Vue.use(SuiVue)
Vue.use(PortalVue)
Vue.use(VueAxios, axios);

import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import '@/assets/css/venue-2.scss';
import '@/assets/css/venue.css';
import '@/assets/css/venue-core.css';
import 'semantic-ui-css/semantic.min.css';
import '@/assets/css/icomoon2.css';
import '@/assets/css/icomoon3.css';

Vue.config.productionTip = false;

//Custom Functions START
Number.prototype.toFixedDecimals = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

Array.prototype.uniqueByProp = function(prop){
	const thisP = this.map( el => el[prop]); // I only need to do that one time;
	return this.filter( (obj, index) => {
		return thisP.indexOf(obj[prop]) === index;
	})
}
//Custom Functions END

//Custom Directives START
Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his childrens
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  },
});
//Custom Directives END

new Vue({
    router,
    store,
    created(){
    	// Automatic Login
    	const userString = localStorage.getItem('user')
    	if(userString) {
    		const userData = JSON.parse(userString)
    		this.$store.commit('SET_USER_DATA', userData)
    	}
    	//Prevents user from inputting fake credentials
    	axios.interceptors.response.use(
    		response => response,
    		error => {
    			if (error.response.status === 401) {
    				this.$store.dispatch('logout')
    			}
    			return Promise.reject(error)
    		}
    	)
    },
    render: h => h(App)
}).$mount('#app');
