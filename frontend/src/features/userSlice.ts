import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: number
  email: string
  nickname?: string
  createdAt?: string
}

interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload }
      }
    },
    clearUser: (state) => {
      state.currentUser = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    initState: (state) => Object.assign(state, initialState),
  },
})

export const {
  setLoading,
  setError,
  setUser,
  updateUser,
  clearUser,
  initState,
} = userSlice.actions

export default userSlice.reducer
