import type { BlogInfo } from '@/models/dashboard'
import { BlogGridItem } from './BlogGridItem'

export const BlogGrid = ({ items }: { items: BlogInfo[] }) => {
  return (
    <ul className="grid grid-cols-5 gap-4 px-[20px] pb-[20px]">
      {items.map((scrap) => (
        <BlogGridItem key={scrap.id} {...scrap} />
      ))}
    </ul>
  )
}
