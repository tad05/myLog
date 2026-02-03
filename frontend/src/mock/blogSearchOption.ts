export const SEARCH_TYPE = {
  PROGRESS: 'PROGRESS',
  SCRAP: 'SCRAP',
} as const

export type BlogSearchOption =
  | {
      type: typeof SEARCH_TYPE.PROGRESS
      fromPercent: number
      toPercent: number
    }
  | { type: typeof SEARCH_TYPE.SCRAP }

interface BlogSearchOptionList {
  searchOptionList: BlogSearchOption[]
}

export const BlogSearchOptionList: BlogSearchOptionList = {
  searchOptionList: [
    { type: SEARCH_TYPE.PROGRESS, fromPercent: 0, toPercent: 50 },
  ],
}
