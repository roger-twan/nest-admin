import { Menu } from 'antd'
import { useNavigate, useMatches } from 'react-router-dom'
import { Route, routes } from '@/router/index'
import { hasPermission } from '@/utils/auth'
import styles from './menu.module.scss'

function MenuModule() {
  const navigate = useNavigate()
  const matches = useMatches()

  const generateMenuFromRouter = () => {
    const root = routes.filter(route => route.id === 'root')[0]
  
    const route2Menu = (routes: any) => {
      return routes.filter((route: Route) =>
        route.extra && route.extra.isMenu && hasPermission(route.extra.permission)
      ).map((route: Route) => {
        const item: any = {
          label: route.extra?.title,
          key: route.path,
        }
  
        if (route.children && route.children.some(child => child.extra?.isMenu)) {
          item.children = route2Menu(route.children)
        }
  
        return item
      })
    }
  
    return route2Menu(root.children)
  }

  return (
    <Menu
      className={styles['menu-module']}
      theme="dark"
      items={generateMenuFromRouter()}
      mode="inline"
      defaultOpenKeys={['/home-management']}
      selectedKeys={matches.map(match => match.pathname)}
      onClick={e => navigate(e.key)}
    />
  )
}

export default MenuModule
