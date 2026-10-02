import jwt from 'jsonwebtoken'
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from '../../DB/config.js'
import { BadException, NotFoundExcution, unauthorizedExcution } from '../exceptions/error.exceptions.js'
import { findById } from '../repository/base.repository.js'
import { model } from 'mongoose';
import { userModel } from './../../DB/model/user.model.js';
import { TokenType } from '../enum/security.enum.js';
import { RoleENUM } from '../enum/user.enum.js';
import {randomUUID} from 'node:crypto'
import { exist, set } from '../services/index.js';

export const userRevokeTokenKey = ({userId , jti})=>{
    return `User::${userId.toString()}::Revoke_Token::${jti}`
}


export const createToken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
}={})=>{

return jwt.sign(payload , secret , options)
}

export const verifytToken = async ({
    token = "",
    secret = ACCESS_USER_TOKEN_SIGNATURE
}={})=>{

return jwt.verify(token , secret )
}

const getTokenSignatures =  async ({role = RoleENUM.USER}={})=>{
    let signatures;
    switch (role) {
        case RoleENUM.ADMIN:
                signatures = {accessSignature :ACCESS_ADMIN_TOKEN_SIGNATURE , refreshSignature : REFRESH_ADMIN_TOKEN_SIGNATURE}
            break;
    
        default:
                signatures = {accessSignature :ACCESS_USER_TOKEN_SIGNATURE , refreshSignature : REFRESH_USER_TOKEN_SIGNATURE}

            break;
    }
 return signatures
}

const getSignature  = async ({tokenType = TokenType.ACCESS}={})=>{
 return tokenType== TokenType.ACCESS ? ACCESS_USER_TOKEN_SIGNATURE : REFRESH_USER_TOKEN_SIGNATURE
}

export const decodeToken = async ({
    authorization="",
    tokenType = TokenType.ACCESS
}={})=>{
     const payload = await verifytToken({token : authorization , secret : await getSignature({tokenType})})
if (!payload?.sub) {
 throw BadException("missing token payload")    
}
if ( await exist({key:userRevokeTokenKey({userId:payload.sub , jti:payload.jti})})) {
    throw unauthorizedExcution(`Expired login credentials`)
}
const user = await findById({
    model: userModel,
    id : payload.sub
})
if (!user) {
    throw NotFoundExcution("invalid user ID")
}

     return {user , payload}
}


export const createLoginCredentials = async ({
    
    user ,
    options = {}
})=>{
    const {accessSignature , refreshSignature} = await getTokenSignatures({role : user.role})
const jwtid = randomUUID()

             const access_token = await createToken({
                secret:accessSignature,
               payload: {sub:user._id},
                options :{...options ,expiresIn : ACCESS_TOKEN_EXPIRES_IN ,jwtid}
             })
                const refresh_token = await createToken({
                    
                         secret:refreshSignature,
               payload: {sub:user._id},
                options :{ ...options,  expiresIn : REFRESH_TOKEN_EXPIRES_IN , jwtid }, secret:refreshSignature
             })
            
             return {access_token , refresh_token}
}

export const createRevokeToken = async ({payload})=>{
    
        const consumedTime = (Math.ceil(Date.now() )/ 1000) - payload.iat
        const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN
        const ttl = refreshExpiresIn - consumedTime
        await set({key : userRevokeTokenKey({userId : payload.sub , jti : payload.jti}) , value:payload.jti , ttl})
        return;
}