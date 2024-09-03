import { Card, Col, Row, Space, Statistic } from 'antd'
import { Formatter } from 'antd/es/statistic/utils'
import CountUp from 'react-countup'
import { NavLink } from 'react-router-dom'
import { FileImageOutlined, AppstoreAddOutlined, PartitionOutlined, UsergroupAddOutlined, IdcardOutlined } from '@ant-design/icons'
import useUserStore from '@/store/user'
import useSWR from 'swr'

function HomePage() {
  const { name, type } = useUserStore((state) => state.user)
  const formatter = (value: number) => <CountUp end={value} separator="," />
  const {data: jobCount} = useSWR('/api/job/get_count_by_status?status=1')
  const {data: ApplicationCount} = useSWR('/api/application/get_count_by_status?status=1,2,3,4')

  const actionList = [
    {
      title: 'New Banner',
      icon: <FileImageOutlined />,
      path: '/home-management/banner/new',
      permissions: [1]
    },
    {
      title: 'New Menu',
      icon: <AppstoreAddOutlined />,
      path: '/home-management/menu/new',
      permissions: [1]
    },
    {
      title: 'New Branch',
      icon: <PartitionOutlined />,
      path: '/company-management/new',
      permissions: [1]
    },
    {
      title: 'New Account',
      icon: <UsergroupAddOutlined />,
      path: '/account-management/new',
      permissions: [1]
    },
    {
      title: 'New Job',
      icon: <IdcardOutlined />,
      path: '/job-management/new',
      permissions: [1, 2]
    },
  ]

  return (
    <>
      <h1>Hello，<br />{name}</h1>

      <h3 style={{ marginTop: "40px" }}>Data Overview</h3>
      <Row gutter={[24, 16]}>
        <Col span={8}>
          <Card>
            <Statistic title="Available Positions" value={jobCount?.success ? jobCount?.total : '-'} formatter={formatter as Formatter} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Review" value={ApplicationCount?.success ? ApplicationCount?.total['1'] : '-'} formatter={formatter as Formatter} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Selected" value={ApplicationCount?.success ? ApplicationCount?.total['2'] : '-'} formatter={formatter as Formatter} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Interview" value={ApplicationCount?.success ? ApplicationCount?.total['3'] : '-'} formatter={formatter as Formatter} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Onboarding" value={ApplicationCount?.success ? ApplicationCount?.total['4'] : '-'} formatter={formatter as Formatter} />
          </Card>
        </Col>
      </Row>

      <h3 style={{ marginTop: "40px" }}>Shortcut</h3>
      <Row gutter={24}>
        {actionList.filter((item) => item.permissions?.includes(type)).map((item, index) => (
          <Col span={4} key={index}>
            <NavLink to={item.path}>
              <Card hoverable style={{textAlign: 'center'}}>
                <Space>
                  {item.icon}
                  {item.title}
                </Space>
              </Card>
            </NavLink>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default HomePage
