import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data.code !== 200) {
      ElMessage.error(data.message || 'Request failed')
      return Promise.reject(new Error(data.message))
    }
    return data
  },
  (error) => {
    ElMessage.error(error.message || 'Network error')
    return Promise.reject(error)
  }
)

export default request