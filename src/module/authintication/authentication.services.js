import mongoose, { model } from "mongoose";
import { userModel } from "../../DB/model/user.model.js";
import { create, findOne } from "../../common/repository/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
    compare,
    createLoginCredentials,
    createToken,
    decryption,
    encryption,
    hash
} from "../../common/security/index.js";
import {
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,
    REFRESH_USER_TOKEN_SIGNATURE,
    WEB_CLIENT_IDS
} from "../../DB/config.js";
import { OAuth2Client } from "google-auth-library";
import {
    BadException,
    conflictExcution,
    NotFoundExcution,
    tooManyRequestException
} from "../../common/exceptions/error.exceptions.js";
import { ProviderENUM } from "../../common/enum/user.enum.js";
import { emailEvent, sendEmail, userEmailKey, userEmailTrialsKey } from "../../common/utils/index.js";
import { EmailSubjectEnum } from "../../common/enum/email.enum.js";
import { createNumberOtp } from "../../common/utils/otp.js";
import {
    set,
    get,
    del,
    ttl,
    incBy,
    expire
} from "../../common/services/cache.service.js";

const client = new OAuth2Client();

async function verifyGoogleAccount(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_IDS,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
        throw BadException("email not verified");
    }

    return payload;
}

export const loginWithGmail = async (account, issuer) => {
    return await createLoginCredentials({
        user: account
    });
};

export const signupWithGmail = async (reqBody, issuer) => {

    const idToken = reqBody.idToken || reqBody.user?.idToken;

    if (!idToken) {
        throw BadException("idToken is missing from request body");
    }

    const { email, name, picture } = await verifyGoogleAccount(idToken);

    const existAccount = await findOne({
        model: userModel,
        filter: { email }
    });

    if (existAccount) {

        if (existAccount.PROVIDER != ProviderENUM.GOOGLE) {
            throw conflictExcution("invalid account provider");
        }

        return {
            status: 200,
            data: await createLoginCredentials({
                user: existAccount,
                issuer
            })
        };
    }

    const user = await create({
        model: userModel,
        data: {
            username: name || "Google User",
            email,
            confirmEmail: new Date(),
            PROVIDER: ProviderENUM.GOOGLE,
            image: picture
        }
    });

    return {
        status: 201,
        data: await createLoginCredentials({
            user,
            issuer
        })
    };
};


 const sendEmailOtp = async ({email , subject , expiresIn = 120, maxTrails = 5 , blockInSeconds=18000})=>{
 const code = createNumberOtp();
const existOTP_TTL=  await ttl({key : userEmailKey({email , subject})})
const oldTrials = await get({key:userEmailTrialsKey({email , subject})})??0

if (oldTrials>=maxTrails) {
    throw tooManyRequestException("Max otp trials reached")
}

if (existOTP_TTL>0) {
    throw conflictExcution("otp unavailable")
}
    await set({
        key:userEmailKey({email , subject}),
        value: await hash(code.toString()),
        ttl: expiresIn
    });

    const currentTrials = await incBy({key : userEmailTrialsKey({email , subject}),})

if (currentTrials == 3) {
    await expire({key : userEmailTrialsKey({email , subject}),ttl:blockInSeconds})
    
}

    emailEvent.emit("sendEmail", {
        recipients: { to: email },
        subject: EmailSubjectEnum.COMFIRM_EMAIL,
        data: { code }
    });

}



export const signup = async ({
    email,
    password,
    username,
    phone
}) => {

    const dublicatedAccount = await findOne({
        model: userModel,
        filter: { email },
        options: { select: "email" }
    });

    if (dublicatedAccount) {
        throw new Error("email already exist", {
            cause: { status: 409 }
        });
    }

    const account = await create({
        model: userModel,
        data: {
            email,
            password: await hash(password),
            username,
            phone: await encryption(phone)
        }
    });
    await sendEmailOtp({email , subject:EmailSubjectEnum.COMFIRM_EMAIL})
    return account;
};

export const confirmEmail = async ({ email, otp }) => {

    const account = await findOne({
        model: userModel,
        filter: {
            email,
            PROVIDER: ProviderENUM.SYSTEM,
            confirmEmail: { $exists: false }
        },
        options: { select: "email" }
    });

    if (!account) {
        throw NotFoundExcution(
            "Account not found or already verified",
            { cause: { status: 404 } }
        );
    }


    const hashedOtp = await get({ key:userEmailKey({email , subject : EmailSubjectEnum.COMFIRM_EMAIL})});

    if (!hashedOtp || !(await compare(otp.toString(), hashedOtp))) {
        throw conflictExcution("OTP expired or not found");
    }
    account.confirmEmail = new Date()

    await account.save();
    await del({key: await keys({prefix: userEmailKey({email , subject : EmailSubjectEnum.COMFIRM_EMAIL})})})
    return

};


export const resendConfirmEmail = async ({ email }) => {

    const account = await findOne({
        model: userModel,
        filter: {
            email,
            PROVIDER: ProviderENUM.SYSTEM,
            confirmEmail: { $exists: false }
        },
        options: { select: "email" }
    });

    if (!account) {
        throw NotFoundExcution(
            "Account not found or already verified",
            { cause: { status: 404 } }
        );
    }
await sendEmailOtp({email , subject:EmailSubjectEnum.COMFIRM_EMAIL})
    return

};

export const login = async ({
    email,
    password
}) => {

    const account = await findOne({
        model: userModel,
        filter: { 
            email,
            PROVIDER: ProviderENUM.SYSTEM,
            confirmEmail: { $exists: true } }
    });

    if (!account) {
        throw new Error("invalid email", {
            cause: { status: 404 }
        });
    }

    const match = await compare(
        password,
        account.password
    );

    if (!match) {
        throw new Error("invalid password", {
            cause: { status: 404 }
        });
    }

    const access_token = await createToken({
        options: {
            subject: account.id,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    });

    const refresh_token = await createToken({
        options: {
            subject: account.id,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        },
        secret: REFRESH_USER_TOKEN_SIGNATURE
    });

    return await createLoginCredentials({
        user: account
    });
};