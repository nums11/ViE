import axios from 'axios'

export default() => {
  return axios.create({
    baseURL: (baseURL()),
    withCredentials: true
  })
}


const baseURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://byakugan.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.VUE_APP_SOURCE_IP) return `http://${process.env.VUE_APP_SOURCE_IP}:4000/`
  return `http://localhost:4000/`
}

const baseSourceURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://byakugan.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.VUE_APP_SOURCE_IP) return `http://${process.env.VUE_APP_SOURCE_IP}:8080/`
  return `http://localhost:8080/`
}

export {
  baseURL,
  baseSourceURL
}
