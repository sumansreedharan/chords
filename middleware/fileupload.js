const multer = require('multer')

const path = require('path')





//for adding images



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});



const checkFileType = function (file, cb) {
//Allowed file extensions
const fileTypes = /jpeg|jpg|png|gif|svg|webp/;

//check extension names
const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

const mimeType = fileTypes.test(file.mimetype);

if (mimeType && extName) {
return cb(null, true);
} else {
cb("Error: You can Only Upload Images");
}
};

const upload = multer({storage:storage,limits:{fileSize:1000000},fileFilter:(req,file,cb)=>{
    checkFileType(file,cb)
}})


// const upload = multer({storage:storage}).array("images",4)

module.exports = upload;