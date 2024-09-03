import { createBrowserRouter, redirect } from 'react-router-dom'
import { hasPermission, isLogin } from '@/utils/auth'
import routes from './routes'

type Route = {
  id?: string
  path: string
  element: JSX.Element
  errorElement?: JSX.Element,
  children?: Route[]
  extra?: {
    isMenu?: boolean
    isContainSubMenu?: boolean
    title?: string
    permission?: string[]
  }
}

const authLoader = async (route: Route) => {
  const permission = route.extra?.permission || []

  if (route.path === '/login' && isLogin()) {
    return redirect('/home')
  }

  if (permission.length) {
    if (!isLogin()) {
      return redirect('/login?redirect=' + route.path)
    }

    if (!hasPermission(permission)) {
      alert('无访问权限')
      return redirect('/home')
    }
  }

  return ({
    path: route.path,
    title: route.extra?.title,
    element: route.element
  })
}

const attachLoader = (routes: any, loader: any) => {
  for (const route of routes) {
    if (route.path) {
      route.loader = () => loader(route)
    }
    if (route.children?.length) {
      attachLoader(route.children, loader)
    }
  }

  return routes;
}

const BASE_URL = '/'
const router = createBrowserRouter(attachLoader(routes, authLoader), {
  basename: BASE_URL,
})

export { routes, BASE_URL, type Route, router as default }
