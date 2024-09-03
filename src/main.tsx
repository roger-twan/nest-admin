import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import 'antd/dist/reset.css'
import './global.scss'
import theme from './theme'
import router from './router'
import { SWRConfig } from 'swr'
import { getFetcher } from './utils/http'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <SWRConfig value={{ fetcher: getFetcher }}>
        <RouterProvider router={router} />
      </SWRConfig>
    </ConfigProvider>
  </React.StrictMode>,
)
