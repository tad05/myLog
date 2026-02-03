import {
  BlogSearchOptionList,
  type BlogSearchOption,
} from '@/mock/blogSearchOption'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

//https://rrecoder.tistory.com/145#google_vignette 보고 slide range 바 컴포넌트 추가 필요

interface BlogSearchOptionState {
  searchOptionList: BlogSearchOption[]
}
// mockup initial state
const initialState: BlogSearchOptionState = {
  searchOptionList: BlogSearchOptionList.searchOptionList,
}
// const initialState: BlogScrapState = { selectedOption: [] }

const blogSearchOptionSlice = createSlice({
  name: 'searchOption',
  initialState,
  reducers: {
    initState: (state) => Object.assign(state, initialState),
    addOption: (state, action: PayloadAction<BlogSearchOption>) => {
      const info = action.payload
      if (!info?.type) return
      const exists = state.searchOptionList.find(
        (item) => item.type === info.type,
      )
      if (!exists) {
        state.searchOptionList.push(info)
      }
    },
    removeOption: (state, action: PayloadAction<string>) => {
      const type = action.payload
      state.searchOptionList = state.searchOptionList.filter(
        (item) => item.type !== type,
      )
    },
  },
})

export const { initState, addOption, removeOption } =
  blogSearchOptionSlice.actions
export default blogSearchOptionSlice.reducer
