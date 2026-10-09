import { Router } from "express";
import { confirmEmail, login, resendConfirmEmail, signup, signupWithGmail } from './authentication.services.js';
import { successResponse } from "../../common/utils/success.response.js";
import * as validators from './authentication.validator.js'
import { BadException } from "../../common/exceptions/error.exceptions.js";
import { validation } from "../../middleware/validation.middelware.js";
const router = Router();

router.post("/signup" , validation(validators.signup) ,async (req , res , next )=>{
    
    const data =await signup(req.body)
    return successResponse({res , status:201 , data})

})


router.patch("/confirm-email" , validation(validators.confirmEmail) ,async (req , res , next )=>{
    
    const data =await confirmEmail(req.body)
    return successResponse({res , status:200 , data})

})


router.patch("/resend-confirm-email" , validation(validators.resendConfirmEmail) ,async (req , res , next )=>{
    
    const data =await resendConfirmEmail(req.body)
    return successResponse({res , status:200 , data})

})



router.post("/signup-with-gmail" ,async (req , res , next )=>{
    const {status , data} =await signupWithGmail(req.body, `${req.protocol}://${req.host}`)
    return successResponse({res , status:201 , data})

})


router.post("/login" , validation(validators.login) ,async (req , res , next )=>{
    

    const data = await login(req.validate.body , `${req.protocol}://${req.host}`)

    return successResponse({res , data})


})
export default router