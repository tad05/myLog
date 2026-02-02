import type { BlogInfo } from '@/models/dashboard'
import { BlogItem } from './BlogItem'

export const BlogList = ({ items }: { items: BlogInfo[] }) => {
  return (
    <>
      {items.map((blog) => (
        <BlogItem key={blog.id} {...blog} />
      ))}
    </>
  )
}
