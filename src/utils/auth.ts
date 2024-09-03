import useUserStore from '@/store/user'

const isLogin = () => !!useUserStore.getState().user.token

const hasPermission = (permission?: string[]) => {
  switch (useUserStore.getState().user.type) {
    case 1:
      return permission?.includes('super')
    case 2:
      return permission?.includes('general')
    default:
      return false
  }
}

export {
  isLogin,
  hasPermission,
}
