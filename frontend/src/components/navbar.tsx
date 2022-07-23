import { Box, Button, Flex, Link } from '@chakra-ui/react'
import React from 'react'
import NextLink from 'next/link'
import { useMeQuery } from '../generated/graphql'

const Navbar = () => {
    const [{ data, fetching }] = useMeQuery()
    let body = null
    if (fetching) {

    } else if (!data.me) {
        body = <>
            <NextLink href={'/login'}>
                <Link mr={2}>Login</Link>
            </NextLink>
            <NextLink href={'/register'}>
                <Link mr={2}>Register</Link>
            </NextLink>
        </>
    } else {
        body = <Flex>
            <Box mr={4}>
                {data.me.username}
            </Box>
            <Button variant={'link'}>Logout</Button>
        </Flex>
    }
    return (
        <Flex p={4} bg='tan' >
            <Box ml={'auto'}>
                {body}
            </Box>
        </Flex>
    )
}

export default Navbar