import { BlogScrapList } from '@/mock/blogScrap'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BlogInfo } from '@/models/dashboard'

interface BlogScrapState {
  scrapList: BlogInfo[]
}

// mockup initial state
const initialState: BlogScrapState = {
  scrapList: BlogScrapList.scrapList,
}
// const initialState: BlogScrapState = { scrapList: [] }

const blogScrapSlice = createSlice({
  name: 'scrap',
  initialState,
  reducers: {
    initState: (state) => Object.assign(state, initialState),
    addScrap: (state, action: PayloadAction<BlogInfo>) => {
      const info = action.payload
      if (!info?.id) return
      const exists = state.scrapList.some((item) => item.id === info.id)
      if (!exists) {
        state.scrapList.push(info)
      }
    },
    removeScrap: (state, action: PayloadAction<string>) => {
      const blogId = action.payload
      state.scrapList = state.scrapList.filter((item) => item.id !== blogId)
    },
    toggleScrap: (state, action: PayloadAction<BlogInfo>) => {
      const info = action.payload
      if (!info?.id) return
      const idx = state.scrapList.findIndex((item) => item.id === info.id)
      if (idx !== -1) {
        state.scrapList.splice(idx, 1)
      } else {
        state.scrapList.push(info)
      }
    },
  },
})

export const { initState, addScrap, removeScrap, toggleScrap } =
  blogScrapSlice.actions
export default blogScrapSlice.reducer
