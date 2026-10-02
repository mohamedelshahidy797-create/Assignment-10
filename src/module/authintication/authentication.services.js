import mongoose, { model } from "mongoose";
import { userModel } from "../../DB/model/user.model.js";
import { create, findOne } from "../../common/repository/index.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import { compare, createLoginCredentials, createToken, decryption, encryption, hash } from "../../common/security/index.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE, WEB_CLIENT_IDS } from "../../DB/config.js";
import {OAuth2Client} from 'google-auth-library';
import { BadException, conflictExcution } from "../../common/exceptions/error.exceptions.js";
import { ProviderENUM } from "../../common/enum/user.enum.js";

const client = new OAuth2Client();

async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_IDS,  
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) {
    throw BadException("email not verified")
  }
return payload
}


export const loginWithGmail =async (account , issuer)=>{

return await createLoginCredentials({user: account})    
}


export const signupWithGmail = async (reqBody, issuer)=>{
// Handle both { idToken: "..." } and { user: { idToken: "..." } } payload structures
const idToken = reqBody.idToken || reqBody.user?.idToken;

if (!idToken) {
    throw BadException("idToken is missing from request body");
}

const {email , name , picture} = await verifyGoogleAccount(idToken)

const existAccount = await findOne({
    model : userModel,
    filter:{email}
})

if (existAccount) {
    if (existAccount.provider != ProviderENUM.GOOGLE) {
        throw conflictExcution("invalid account provider")
    }
    return {status:200 , data : await createLoginCredentials({user , issuer})}
}

const user =  await create({
    model:userModel,
    data: {
        username : name || "Google User",
        email,
        confirmEmail:new Date(),
        PROVIDER: ProviderENUM.GOOGLE,
        image:picture
    }
})
    return {status:201 , data : await createLoginCredentials({user , issuer})}

}

export const signup = async ({email , password , username , phone })=>{

const dublicatedAccount = await findOne({
    model:userModel,
filter :  {email},
options : {select : "email"}
})
if(dublicatedAccount) throw new Error("email already exist" , {cause:{status:409}})
 const account = await create({
model:userModel,
data :{
    email , 
    password: await hash(password) , 
    username ,
    phone : await encryption(phone)
 } 
})
    return account
}

export const login =async ({email , password})=>{

const account  = await findOne({
    model:userModel,
filter :  {email}
})

if(!account) throw new Error("invalid email" , {cause :{status:404}})
    const match = await compare(password , account.password)
if(!match) throw new Error("invalid password" , {cause :{status:404}})

     const access_token = await createToken({
        options :{ subject : account.id , expiresIn : ACCESS_TOKEN_EXPIRES_IN}
     })
        const refresh_token = await createToken({
        options :{ subject : account.id , expiresIn : REFRESH_TOKEN_EXPIRES_IN  }, secret:REFRESH_USER_TOKEN_SIGNATURE 
     })
    
return await createLoginCredentials({user: account})    
}
