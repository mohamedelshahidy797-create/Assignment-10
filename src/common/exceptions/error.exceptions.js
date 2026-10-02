export const ApplicationException = ({
    message = "error",
    optipns = {
        cause:{status:400}
    }
}={})=>{
    throw new Error (message , optipns)
}

export const conflictExcution =(message = "conflict" , extra = {})=>{
return ApplicationException({
    message,
    optipns : {
        cause: {status:409 , ...extra}
    }
})

}
export const NotFoundExcution =(message = "NotFound" , extra = {})=>{
return ApplicationException({
    message,
    optipns : {
        cause: {status:404 , ...extra}
    }
})
}
export const BadException =(message = "Bad Request" , extra = {})=>{
return ApplicationException({
    message,
    optipns : {
        cause: {status:400 , ...extra}
    }
})
}
export const unauthorizedExcution =(message = "unauthorized" , extra = {})=>{
return ApplicationException({
    message,
    optipns : {
        cause: {status:401 , ...extra}
    }
})
}