import { dedupExchange, fetchExchange } from "urql"
import { LoginMutation, MeQuery, MeDocument, RegisterMutation, LogoutMutation } from "../generated/graphql"
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';
import { wrappedUpdateQuery } from "./wrappedUpdateQuery";

export const createUrqlClient = (ssrExchange) => {
    return {
        url: "https://localhost:8080/graphql",
        fetchOptions: {
            credentials: 'include' as const
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
                    },
                    logout: (result, args, cache, info) => {
                        return wrappedUpdateQuery<LogoutMutation, MeQuery>(result, cache, { query: MeDocument }, (_result, data) => {
                            return {
                                me: null
                            }
                        })
                    }
                }
            }
        }), ssrExchange, fetchExchange],
    }
}