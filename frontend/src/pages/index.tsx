import Navbar from '../components/navbar'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { usePostQuery } from '../generated/graphql'
import React from 'react'
import { isServer } from '../utils/isServer'
import { Box } from '@chakra-ui/react'
// const Navbar = React.lazy(() => import('../components/navbar'));


const Index = () => {
  const [{ data }] = usePostQuery()
  return <Box>
    {isServer() ? null : <Navbar />}
    <div>
      Hello World
    </div>
    <Box mt={4}>
      {
        !data ?
          null :
          data.posts.map(({ id, title }, index) => {
            return <p key={id}>{title}</p>
          })
      }
    </Box>
  </Box>
}

export default withUrqlClient(createUrqlClient, { ssr: false })(Index)
