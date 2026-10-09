import multer from "multer"
import { randomUUID } from 'node:crypto';
import { resolve } from "node:path";
import { readFile, unlink } from "node:fs/promises"
import { fileTypeFromBuffer } from "file-type"

export const fileValidation = {
    image: ["image/png", "image/jpg", "image/jpeg", "image/gif"],
    files: ["application/pdf", "application/json"]
}

export const localFileUpload = (maxFileSize = 5, validation = []) => {

    const storage = multer.diskStorage({

        destination: function (req, file, cb) {
            cb(null, "./assets")
        },

        filename: function (req, file, cb) {
            console.log({ file });

            cb(null, randomUUID() + file.originalname)
        },

    })

    function fileFilter(req, file, cb) {
        if (validation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("invalid format", { cause: { status: 400 } }))
        }
    }

    return multer({
        fileFilter,
        storage,
       limits: { fileSize: 5 * 1024 * 1024 }
    })
}

export const processFile = ({ validation = [] }) => {
    return async (req, res, next) => {

        const filePath = resolve(`./${(req.file ?? req.files?.[0]).path}`)
        console.log({ f: req.file, filePath });

        const fileBuffer = await readFile(filePath)
        console.log(fileBuffer);

        const result = await fileTypeFromBuffer(fileBuffer)
        console.log({ result });
        if (!result || !validation.includes(result.mime)) {
            await unlink(filePath)
            next(new Error("invalid file format" , {cause:{status:400}}))
        }
        next()
    }
}