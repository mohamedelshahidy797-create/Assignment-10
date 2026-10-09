import {z} from "zod";

export const generalValidationFields = {
    email: (lang) => z.string().email(),
    otp: (lang) => z.string().regex(/^\d{6}$/, { message: "invalid code" }),
    password: (lang) => z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#_$%^&*()]).{8,16}$/),
    username: (lang) => z.string().min(2, { message: lang == LanguageEnum.AR ? translateObj.username.ar : translateObj.username.en }),
    phone: (lang) => z.string(), 
}