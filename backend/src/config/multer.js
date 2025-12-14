import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//es module helpers to get --dirname
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

//folder where rtl files will be stores
const uploadDir=path.join(__dirname,"../../uploads/rtl");

//create folder if it doesnt exist
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true});
}

//storage config :where +how to share file
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadDir);
    },
    filename:function(req,file,cb){
        const timestamp=Date.now();
        const safeName=file.originalname.replace(/\s+/g,"-");
        cb(null,`${timestamp}-${safeName}`);
    },
});

//only allow rtl-like files
function fileFilter(req,file,cb){
    const allowedExt=[".v",".sv",".vh",".svh",".vhd",".vhdl"];
    const ext=path.extname(file.originalname).toLowerCase();

    if(allowedExt.includes(ext)){
        cb(null,true);
    }else{
        cb(new Error("Only RTL files allowed (.v, .sv, .vh, .svh, .vhd, .vhdl)"));
    }
}

//multer instance for rtl uploads
export const rtlUpload=multer({
    storage,
    fileFilter,
    limits:{
        fileSize:50*1024*1024, //5MB limit
    },
});