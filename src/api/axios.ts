import axios from 'axios'

// '/api' isi website ka address hai. Local pe Vite proxy aur Vercel pe
// vercel.json ka rewrite is request ko backend tak pohanchata hai
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export default api
