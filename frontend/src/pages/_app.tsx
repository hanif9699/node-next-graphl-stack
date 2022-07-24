import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
import React from 'react'
import theme from '../theme'



function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </React.StrictMode>
  )
}

export default MyApp
