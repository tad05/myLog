import readingProgressSlice from '@/features/readingProgressSlice'
import blogScrapSlice from '@/features/blogScrapSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    readingProgress: readingProgressSlice,
    blogScrap: blogScrapSlice,
  },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
