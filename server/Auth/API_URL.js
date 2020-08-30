const APIServerBaseURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://venue-attend.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.SOURCE_IP) return `http://${process.env.SOURCE_IP}:4000/`
  return `http://localhost:4000/`
}


const FrontEndServerBaseURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://venue-attend.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.SOURCE_IP) return `http://${process.env.SOURCE_IP}:8080/`
  return `http://localhost:8080/`
}

module.exports = {
  APIServerBaseURL,
  FrontEndServerBaseURL
}