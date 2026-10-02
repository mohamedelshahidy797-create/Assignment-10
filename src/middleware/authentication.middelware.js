import { TokenType } from "../common/enum/security.enum.js"
import { unauthorizedExcution } from "../common/exceptions/error.exceptions.js"
import { decodeToken } from "../common/security/token.security.js"


export const authentication = (tokenType = TokenType.ACCESS)=>{
    return async(req , res , next  ) => {
const {authorization} = req.headers

if (!authorization) {
    throw unauthorizedExcution("Unauthorized Account ")
}

 const {user , payload} = await decodeToken({authorization , tokenType})
 req.user = user
 req.payload = payload
next()
}
}