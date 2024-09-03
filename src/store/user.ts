import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  name: string
  type: number
  token: string
}

interface UserInfoState {
  user: UserInfo
  setUser: (user: UserInfo) => void
  resetUser: () => void
}

const defaultUserInfo: UserInfo = {
  name: '',
  type: 0, // 1: 超管，2: 管理员
  token: '',
}

const userStore: StateCreator<UserInfoState> = (set) => ({
  user: defaultUserInfo,
  setUser: (user: UserInfo) => set({ user }),
  resetUser: () => set({ user: defaultUserInfo }),
})

const useUserStore = create<UserInfoState>()(
  persist(
    userStore,
    { name: 'userInfo'},
  )
)

export default useUserStore
