import testBlock from './testBlock.txt?raw'
export interface BlogContent {
  type: string
  text: string
  lang?: string
}
export interface BlogContentList {
  type: string
  version: number
  blocks: BlogContent[]
}
export const CONTENTS: BlogContentList = {
  type: 'doc',
  version: 1,
  blocks: [
    { type: 'text', text: '/// 상태 관리' },
    { type: 'text', text: '/// 상태 관리2' },
    { type: 'text', text: 'useState는...' },
    {
      type: 'code',
      lang: 'ts',
      text: testBlock,
    },
  ],
}
