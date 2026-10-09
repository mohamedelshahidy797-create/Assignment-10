import express from 'express'
import cors from 'cors'

import { authenticationController, messageController, userController } from './module/index.js'
import { globalErrorHandling } from './middleware/index.js';
import { PORT, WEB_CLIENT_IDS } from './DB/config.js';
import { bootstrapDB } from './DB/connection.db.js';
import { userModel } from './DB/model/user.model.js';
import { decryption, encryption } from './common/security/encryption.security.js';
import { set } from './common/services/index.js';
import { sendEmail } from './common/utils/index.js';

const app = (express())

await bootstrapDB(app , PORT)

await set({key: "age" , value: 0 , ttl: 60})


app.use(cors())
app.use("/assets" , express.static("./assets"))

app.use(express.json())
app.use("/auth" , authenticationController)
app.use("/message" , messageController)
app.use("/user" , userController)

app.get("/", (req, res, next) => {
    res.send("Home Page")
})
app.use(globalErrorHandling)

