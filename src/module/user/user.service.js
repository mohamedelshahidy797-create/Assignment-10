import { userModel } from "../../DB/model/user.model.js"
import { findAll , findById, findByIdAndUpdate } from "../../common/repository/index.js"
import  jwt  from 'jsonwebtoken';
import { createLoginCredentials, createRevokeToken, createToken, userRevokeTokenKey, verifytToken } from "../../common/security/token.security.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../DB/config.js";
import { conflictExcution } from "../../common/exceptions/error.exceptions.js";
import { set } from "../../common/services/index.js";

export const list = async (inputs) => {
    const data = await findAll({
        model: userModel,
        filter: {},
        select: "-password"
    })

    return data
}
 
export const profile = async (account)=>{
    return account 
}

export const update = async (user , data)=>{
    const account = await findByIdAndUpdate({ model : userModel , id: user._id , data :data })
    return account 
} 

export const rotateToken = async (payload  )=>{
    const accessExpiresIn = payload.iat + ACCESS_TOKEN_EXPIRES_IN

    const currentTime = Date.now() + (30 * 60000)
    // if (currentTime < accessExpiresIn) {
    //     throw conflictExcution("sorry we cannot create new login credentials while current access token stil within valid time range ")
    // }
const data = await createLoginCredentials({payload:{sub :payload.sub}})    
   await createRevokeToken({payload})
   return data


} 


export const logout = async (payload , user   )=>{
  return await createRevokeToken({payload , user})
} 