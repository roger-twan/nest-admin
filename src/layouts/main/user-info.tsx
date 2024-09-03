import { Dropdown, MenuProps, Space, message } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import useUserStore from '@/store/user'
import { useNavigate } from 'react-router-dom'
import { getFetcher } from '@/utils/http'
import useSWRMutation from 'swr/mutation'

interface CustomMenuProps extends MenuProps {
  show: boolean
}

function UserInfoModule() {
  const { trigger: triggerLogout } = useSWRMutation('/api/auth/logout', getFetcher)
  const { name, type } = useUserStore((state) => state.user)
  const resetUser = useUserStore((state) => state.resetUser)
  const navigate = useNavigate()

  const items = [
    {
      key: '1',
      label: type === 1 ? '超级管理员' : '管理员',
      disabled: true,
      show: [1, 2].includes(type),
    },
    {
      type: 'divider',
      show: [1, 2].includes(type),
    },
    {
      key: '2',
      label: '修改密码',
      show: type === 2,
    },
    {
      key: '3',
      danger: true,
      label: '登出',
      show: [1, 2].includes(type),
    },
  ];

  const onMenuClick = (e: any) => {
    e.key === '2' && navigate('/reset-password')
    e.key === '3' && logout()
  }
  const logout = async () => {
    const result = await triggerLogout()
    if (result.success) {
      message.success('登出成功')
      resetUser()
      navigate('/login')
    } else {
      message.error(result.message)
    }
  }

  return (
    <Dropdown menu={{
      onClick: onMenuClick,
      items: items.filter((item => item.show )) as CustomMenuProps['items'],
    }}>
      <Space style={{color: 'black'}}>
        {name}
        <DownOutlined />
      </Space>
    </Dropdown>
  )
}

export default UserInfoModule
