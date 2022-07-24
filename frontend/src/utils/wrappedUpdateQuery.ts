import { QueryInput, Cache } from "@urql/exchange-graphcache"

export function wrappedUpdateQuery<Result, Query>(result: any, cache: Cache, qi: QueryInput, fn: (r: Result, q: Query) => Query) {
    return cache.updateQuery(qi, (data) => {
        return fn(result, data as any) as any
    })
}