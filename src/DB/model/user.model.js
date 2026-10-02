import mongoose from "mongoose";
import { GendereNUM, ProviderENUM, RoleENUM } from './../../common/enum/index.js';

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minleght:2,
        maxlegth:25
    },
    lastName:{
        type:String,
        required:true,
        minleght:2,
        maxlegth:25
    },
    email:{
        type:String,
        required:true,
      unique:true
    },
    password:{
        type:String,
        required:function(){
            return this.PROVIDER === ProviderENUM.SYSTEM;
        },
    },
    DOB:Date,
    confirmEmail:Date,
    gender:{
type :Number,
enum:Object.values(GendereNUM),
default:GendereNUM.MALE

    },
    role:{
type :Number,
enum:Object.values(RoleENUM),
default:RoleENUM.USER

    }, 
     PROVIDER:{
type :Number,
enum:Object.values(ProviderENUM),
default:ProviderENUM.SYSTEM

    },

    phone:String,
    image:String,
    coverImage:[String],

},
{
    collection:"SARAHA_APP_USERS",
timestamps:true    ,
strict:true,
strictQuery:true,
toObject:{virtuals:true},
toJSON:{virtuals:true},
autoIndex:true
})
userSchema.virtual("username").set(function(value){
    const parts = value?.split(" ") || [];
    const firstName = parts[0] || "Unknown";
    const lastName = parts.slice(1).join(" ") || "User";
    this.set({firstName , lastName})
})

userSchema.virtual("username").get(function(value){
    return this.firstName+" "+this.lastName
})

export const userModel = mongoose.model("User", userSchema);
