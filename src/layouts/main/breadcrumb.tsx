import { Breadcrumb } from 'antd'
import { Link, useLocation, useMatches } from 'react-router-dom'

type CrumbData = {
  path: string
  title: string
  element: JSX.Element
}

const exceptPages = ['/home']

function BreadCrumb() {
  const matches = useMatches()
  const location = useLocation()
  const routes = matches.filter(
    match => match.id !== 'root'
    && (match.data as CrumbData)?.title
  )
  const crumbs = routes.map((route, index) => {
    const isLast = index === routes.length - 1
    const title = (route.data as CrumbData)?.title
    const path = (route.data as CrumbData)?.path
  
    return ({title: isLast ? title : <Link to={path}>{title}</Link>})
  })
  
  if (exceptPages.includes(location.pathname)) {
    return null
  }

  return exceptPages.includes(location.pathname) ? null : (
    <Breadcrumb items={crumbs} style={{
      position: 'fixed',
      top: '56px',
      fontSize: '16px',
      padding: '12px 24px',
      zIndex: 1,
      backgroundColor: '#f2f2f2',
      width: '100%',
      lineHeight: 'normal',
    }} />
  )
}

export default BreadCrumb
