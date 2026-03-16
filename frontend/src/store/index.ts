import readingProgressSlice from '@/features/readingProgressSlice'
import blogScrapSlice from '@/features/blogScrapSlice'
import { configureStore } from '@reduxjs/toolkit'
import blogSearchOptionSlice from '@/features/blogSearchOptionSlice'
import userSlice from '@/features/userSlice'

export const store = configureStore({
  reducer: {
    readingProgress: readingProgressSlice,
    blogScrap: blogScrapSlice,
    blogSearchOption: blogSearchOptionSlice,
    user: userSlice,
  },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
