import crypto from "node:crypto"
import { ENC_KEY, IV_LENGHT } from './../../DB/config.js';


export const encryption = async (plainText)=>{
const iv = crypto.randomBytes(IV_LENGHT)
const cipherIv = crypto.createCipheriv('aes-256-cbc' , ENC_KEY  , iv)
let cipherText = cipherIv.update(plainText, "utf-8" , "hex").toString()
cipherText += cipherIv.final("hex")
return`${iv.toString("hex")}::${cipherText}`

}
export const decryption = async (cipherText)=>{
    const [hexIV , encryptedData] = cipherText.split("::")
    console.log({hexIV , encryptedData});
    

const iv = Buffer.from(hexIV , "hex")
console.log({hexIV , iv , encryptedData});

const decipherIv = crypto.createDecipheriv('aes-256-cbc' , ENC_KEY  , iv)
let plainText = decipherIv.update(encryptedData, "hex" , "utf-8")
plainText += decipherIv.final("utf-8")
return plainText

}