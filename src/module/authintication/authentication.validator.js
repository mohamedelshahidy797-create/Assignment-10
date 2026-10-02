import {z} from 'zod'
import { GendereNUM } from './../../common/enum/user.enum.js';



export const  loginSchema = z.strictObject({
    email: z.string({message:"invalid email formate"}).email({message:"invalid email formate"}),
    password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/).min(8).max(16),

})

export const  login = z.object({
    body:loginSchema,
    query:z.strictObject({
        lang:z.enum(["ar" , "en"]).default("ar")
    })
})
export const signup = z.object({
    body: loginSchema.safeExtend({
        username: z.string().min(2 , {message:"minimum username is 2"}),
        phone: z.e164(),
        confirmPassword: z.string().min(8).max(16),
        gender:z.number().refine((value) => value === GendereNUM.MALE || value === GendereNUM.FEMALE, { message: "gender must be 0 or 1" })
    }).superRefine((data, ctx) => {
        if (data.password != data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "password mismatch with confirmation password"
            })
        }

        if (!data.username.includes(" ")) {
            ctx.addIssue({
                code: "custom",
                path: ["username"],
                message: "username must contain 2 parts"
            })
        }
    }),

    query: z.strictObject({
        lang: z.enum(["ar", "en"]).default("ar")
    }),

    params: z.object({})
})