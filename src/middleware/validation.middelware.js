import { BadException } from "../common/exceptions/error.exceptions.js"

export const validation = (schema) => {
    return (req, res, next) => {
        const validationResult = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        })

        if (!validationResult.success) {
            return BadException("validation Error", { issues: validationResult.error.issues })
        }

        req.validate = validationResult.data
        next()
    }
}