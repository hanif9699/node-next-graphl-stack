import { ChakraProvider } from '@chakra-ui/react'

import theme from '../theme'
import { AppProps } from 'next/app'
import React from 'react'
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql'
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';
import Navbar from '../components/navbar'
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql'

function wrappedUpdateQuery<Result, Query>(result: any, cache: Cache, qi: QueryInput, fn: (r: Result, q: Query) => Query) {
  return cache.updateQuery(qi, (data) => {
    return fn(result, data as any) as any
  })
}

const client = createClient({
  url: "http://localhost:8080/graphql",
  fetchOptions: {
    credentials: 'include'
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        login: (result, args, cache, info) => {
          return wrappedUpdateQuery<LoginMutation, MeQuery>(
            result, cache, { query: MeDocument }, (_result, data) => {
              if (_result.login.errors) {
                return data
              } else {
                return {
                  me: _result.login.user
                }
              }
            }
          )
        },
        register: (result, args, cache, info) => {
          return wrappedUpdateQuery<RegisterMutation, MeQuery>(
            result, cache, { query: MeDocument }, (_result, data) => {
              if (_result.register.errors) {
                return data
              } else {
                return {
                  me: _result.register.user
                }
              }
            }
          )
        }
      }
    }
  }), fetchExchange],
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <Provider value={client}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </Provider>
    </React.StrictMode>
  )
}

export default MyApp
