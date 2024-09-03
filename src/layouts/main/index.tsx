import { Layout } from 'antd'
import styles from './index.module.scss'
import { useLocation, useOutlet } from 'react-router-dom'
import LogoImg from '@/assets/logo.png'
import UserInfo from './user-info'
import MenuModule from './menu'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, useState } from 'react'
import BreadCrumb from '@/layouts/main/breadcrumb'

const { Header, Content, Sider } = Layout

function MainLayout() {
  const location = useLocation()

  const AnimatedOutlet: FC = () => {
    const o = useOutlet()
    const [outlet] = useState(o)

    return <>{outlet}</>
  }

  return (
    <Layout className={styles.layout}>
      <Sider className={styles.sider}>
        <div className={styles.logo}>
          <img src={LogoImg} />
          Admin
        </div>
        <MenuModule />
      </Sider>
      <Layout className={styles["content-layout"]}>
        <Header className={styles.header}>
          <UserInfo />
        </Header>
        <BreadCrumb />
        <Content className={styles["content-wrapper"]}>
          <AnimatePresence mode='wait'>
            <motion.div
              initial={{ opacity: 0, y: 30, }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'tween', duration: 0.1 }}
              key={location.pathname}
            >
              <AnimatedOutlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
