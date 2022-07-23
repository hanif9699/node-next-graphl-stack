import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
    const result: Record<string, string> = {}
    errors.forEach(({ field, message }) => {
        result[field] = message
    })
    return result
}