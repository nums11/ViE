import API from '@/services/API'

export default {
  seed(seed_size) {
    return API().post(`seeds/${seed_size}`)
  }
}
