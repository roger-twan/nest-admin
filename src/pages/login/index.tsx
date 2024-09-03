import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, message } from 'antd'
import styles from './index.module.scss'
import ColorfulLogoSVG from '@/assets/logo-colorful.svg?react'
import LoginBgImg1 from '@/assets/login-bg-1.png'
import LoginBgImg2 from '@/assets/login-bg-2.png'
import useSWRMutation from 'swr/mutation'
import { postFetcher } from '@/utils/http'
import { useState } from 'react'
import useUserStore from '@/store/user'
import { useNavigate, useSearchParams } from 'react-router-dom'

function LoginPage() {
  const { trigger: triggerLogin } = useSWRMutation('/api/auth/login', postFetcher)
  const [isLogin, setIsLogin] = useState(false)
  const setUser = useUserStore((state) => state.setUser)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onFinish = async (values: any) => {
    const { username, password, remember } = values

    setIsLogin(true)

    try {
      const result = await triggerLogin({ username, password })
      if (result.success) {
        setUser({
          name: username,
          token: result.token,
          type: result.type
        })
        remember ? localStorage.setItem('username', username) : localStorage.removeItem('username')

        const redirect = searchParams.get('redirect') as string || '/home'
        navigate(redirect)
      } else {
        message.error(result.message)
      }
      setIsLogin(false)
    } catch (error) {
      setIsLogin(false)
    }
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['logo']}>
        <ColorfulLogoSVG />
      </div>

      <Form
        className={styles['login-form']}
        initialValues={{
          remember: true,
          username: localStorage.getItem('username') || '',
        }}
        size="large"
        onFinish={onFinish}
      >
        <div className={styles['login-title']} >登录小程序管理后台</div>

        <div className='login-form-content'>
          <Form.Item
            className={styles['login-form-item-first']}
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="密码"
              autoComplete="on"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles['login-form-button']}
              loading={isLogin}
            >
              登录
            </Button>
          </Form.Item>
        </div>
      </Form>

      <img className={styles['login-bg-1']} src={LoginBgImg1} />
      <img className={styles['login-bg-2']} src={LoginBgImg2} />
    </div>
  )
}

export default LoginPage
