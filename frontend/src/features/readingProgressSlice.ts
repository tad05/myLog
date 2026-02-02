import { BlogProgressList } from '@/mock/blogProgress'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BlogInfo } from '@/models/dashboard'

interface ReadingProgressState {
  progressList: BlogInfo[]
}

// mockup initial state
const initialState: ReadingProgressState = {
  progressList: BlogProgressList.progressList,
}
// const initialState: ReadingProgressState = { progressList: [] }

const readingProgressSlice = createSlice({
  name: 'readingProgress',
  initialState,
  reducers: {
    initState: (state) => Object.assign(state, initialState),
    updateProgress: (state, action: PayloadAction<BlogInfo>) => {
      const info = action.payload
      if (!info?.id) return
      const idx = state.progressList.findIndex((item) => item.id === info.id)
      if (idx !== -1) {
        state.progressList[idx] = info
      } else {
        state.progressList.push(info)
      }
    },
    removeProgress: (state, action: PayloadAction<string>) => {
      const blogId = action.payload
      state.progressList = state.progressList.filter(
        (item) => item.id !== blogId,
      )
    },
  },
})

export const { initState, updateProgress, removeProgress } =
  readingProgressSlice.actions
export default readingProgressSlice.reducer
