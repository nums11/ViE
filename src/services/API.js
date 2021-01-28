import axios from 'axios'

export default() => {
  return axios.create({
    baseURL: (process.env.NODE_ENV === 'production' ? 
      `https://viengage.com/` :
      `http://localhost:4000/`),
    withCredentials: true
  })
}

// For connecting to localhost from mobile
// export default() => {
//   return axios.create({
//     baseURL: 'http://192.168.1.122:4000',
//     withCredentials: true
//   })
// }
