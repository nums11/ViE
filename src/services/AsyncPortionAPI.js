import API from '@/services/API'

export default {
  getAsyncPortion(id) {
    return API().get(`async_portions/get/${id}`)
  },
}
