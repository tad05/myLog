import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateProgress } from '../features/readingProgressSlice'
import { CONTENTS } from '@/mock/blogContent'
import type { BlogInfo } from '@/models/dashboard'

export const BlogPage = ({ id, title }: BlogInfo) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const saveProgress = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const percent = Math.min(
        100,
        ((scrollTop + windowHeight) / docHeight) * 100,
      )
      dispatch(updateProgress({ id, title, percent }))
    }
    //브라우저 닫기 / 새로고침 / 외부 이동 시 호출
    window.addEventListener('beforeunload', saveProgress)

    return () => {
      // 페이지 이동 시 호출
      saveProgress()
      window.removeEventListener('beforeunload', saveProgress)
    }
  }, [id, title, dispatch])

  return <div>{CONTENTS.text}</div>
}
