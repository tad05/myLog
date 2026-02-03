import { useNavigate } from 'react-router-dom'
import { Flex } from './shared/Flex'
import { Text } from './shared/Text'
import { SearchBar } from './SearchBar'

export const Header = () => {
  const navigate = useNavigate()

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        gap: '16px',
      }}
    >
      <Text
        typography="t3"
        bold={true}
        color="mainText"
        display="flex"
        style={{ cursor: 'pointer', flexShrink: 0, alignItems: 'center' }}
        onClick={() => navigate('/myLog')}
      >
        myLog
      </Text>
      <SearchBar />
    </Flex>
  )
}
