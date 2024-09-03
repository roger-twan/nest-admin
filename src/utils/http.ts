import { BASE_URL } from '@/router'
import useUserStore from '@/store/user'
import { message } from 'antd'
import axios from 'axios'

const DEFAULT_TIMEOUT = 1000 * 10

const http = axios.create({
  baseURL: import.meta.env.VITE_API_HOST || '',
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = useUserStore.getState().user.token
  token && (config.headers.Authorization = `Bearer ${token}`)
  return config
})

http.interceptors.response.use((response) => {
  return response
}, (error) => {
  const { response } = error
  
  if (!response) {
    message.error('网络错误, 请稍后重试')
  } else {
    switch (response.status) {
      case 400:
        message.error(response.data.message)
        break;
      case 401:
        _redirectToLogin()
        break
      case 403:
        message.error('权限错误')
        break;
      case 500:
        message.error('服务器错误')
        break;
    }
    if (response.data.message.includes('timeout')) {
      message.error('网络超时')
    }
  }

  return Promise.resolve(error)
})

const _redirectToLogin = () => {
  const location = window.location
  useUserStore.getState().resetUser()
  alert('登录过期, 请重新登录')
  location.href = `${BASE_URL}/login?redirect=${location.pathname.replace(BASE_URL, '')}${location.search}`
}

const getFetcher = async (url: string, arg?: any) => {
  return http.get(url, arg).then(res => res.data)
}
const postFetcher = async (url: string, { arg }: { arg: any}) => {
  const data = arg._data || arg
  const headers = arg._headers || {}
  const progress = arg._progress || (() => {})
  const timeout = arg._timeout !== undefined ? arg._timeout : DEFAULT_TIMEOUT
  const opt = { headers, onUploadProgress: progress, timeout }

  return http.post(url, data, opt).then(res => res.data)
}

export {
  getFetcher,
  postFetcher
}
