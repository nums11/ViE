import axios from 'axios'

export default() => {
  return axios.create({
    baseURL: (process.env.NODE_ENV === 'production' ? 
      `http://localhost:4000/` :
      `http://localhost:4000/`),
    withCredentials: true
  })
}
