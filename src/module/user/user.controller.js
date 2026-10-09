import { Router } from "express";
import { fileValidation, localFileUpload, processFile, successResponse } from './../../common/utils/index.js';
import { list, logout, profile, rotateToken, update } from "./user.service.js";
import { authentication } from "../../middleware/authentication.middelware.js";
import { updateOne } from "../../common/repository/base.repository.js";
import { TokenType } from "../../common/enum/security.enum.js";
import { validation } from "../../middleware/validation.middelware.js";
const router = Router()


router.get('/' ,authentication(), async (req , res , next)=>{
const data = await profile(req.user)
return successResponse({res  , data })
})


router.patch('/' ,authentication(), async (req , res , next)=>{
const data = await update(req.user , req.payload)
return successResponse({res  , data })
})


router.post('/rotate-token' ,authentication(TokenType.REFRESH), async (req , res , next)=>{
const data = await rotateToken(req.headers.authorization , req.user)
return successResponse({res  , data })
})



router.patch('/profile-image' , localFileUpload(3, [...fileValidation.image, ...fileValidation.files]).array("attachement"),processFile({validation:fileValidation.image}) ,async (req , res , next)=>{
   
return successResponse({res  , data : {file:req.files ?? req.file}})
})



router.post('/logout' ,authentication(), async (req , res , next)=>{
const data = await logout(req.payload , req.user)
return successResponse({res  , data })
})



export default router