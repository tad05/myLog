import { renderInline } from './InlineRenderer'
import type { BlockNode } from '@/lib/blockParser'

export const TableRenderer = ({
  block,
}: {
  block: Extract<BlockNode, { type: 'table' }>
}) => {
  return (
    <table>
      <thead>
        <tr>
          {block.header.map((cell, i) => (
            <th
              key={i}
              style={{
                border: '1px solid #ccc',
                padding: '8px',
                textAlign: cell.align,
              }}
            >
              {renderInline(cell.children)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, rIdx) => (
          <tr key={rIdx}>
            {row.map((cell, cIdx) => (
              <td
                key={cIdx}
                style={{
                  textAlign: cell.align,
                }}
              >
                {renderInline(cell.children)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
