import { ref, computed } from 'vue'
import type { UserProfile } from '~/types'

const STORAGE_KEY = 'wcd_user'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function useUser() {
  const user = ref<UserProfile | null>(null)

  // 从 localStorage 加载用户
  function loadUser() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        user.value = JSON.parse(raw) as UserProfile
      } else {
        // 首次访问，生成新用户
        const newUser: UserProfile = {
          id: generateUUID(),
          nickname: '',
          createdAt: Date.now(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
        user.value = newUser
      }
    } catch {
      user.value = null
    }
  }

  // 设置昵称
  function setNickname(nickname: string) {
    if (!import.meta.client || !user.value) return
    user.value.nickname = nickname.trim()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
  }

  const isLoggedIn = computed(() => !!user.value)

  // 初始化加载
  loadUser()

  return {
    user,
    setNickname,
    isLoggedIn,
  }
}
