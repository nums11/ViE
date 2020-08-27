import axios from 'axios'

export default() => {
  return axios.create({
    baseURL: (APIServerBaseURL()),
    withCredentials: true
  })
}


const APIServerBaseURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://venue-attend.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.VUE_APP_SOURCE_IP){ 
    console.log("source_ip", process.env.VUE_APP_SOURCE_IP)
    return `http://${process.env.VUE_APP_SOURCE_IP}:4000/`}
  return `http://localhost:4000/`
}

const FrontEndServerBaseURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://venue-attend.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.VUE_APP_SOURCE_IP) return `http://${process.env.VUE_APP_SOURCE_IP}:8080/`
  return `http://localhost:8080/`
}

export {
  APIServerBaseURL,
  FrontEndServerBaseURL
}
