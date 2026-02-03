import { useNavigate } from 'react-router-dom'
import { Flex } from './shared/Flex'
import { Text } from './shared/Text'

export const NavBar = () => {
  const navigate = useNavigate()

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--item)',
      }}
    >
      <Text
        typography="t3"
        bold={true}
        color="mainText"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/myLog')}
      >
        myLog
      </Text>
      <Flex align="center" style={{ gap: '16px' }}>
        {/* 추후 메뉴 아이템 추가 */}
      </Flex>
    </Flex>
  )
}
