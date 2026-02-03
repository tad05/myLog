import readingProgressSlice from '@/features/readingProgressSlice'
import blogScrapSlice from '@/features/blogScrapSlice'
import { configureStore } from '@reduxjs/toolkit'
import blogSearchOptionSlice from '@/features/blogSearchOptionSlice'

export const store = configureStore({
  reducer: {
    readingProgress: readingProgressSlice,
    blogScrap: blogScrapSlice,
    blogSearchOption: blogSearchOptionSlice,
  },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
