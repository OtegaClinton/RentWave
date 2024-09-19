// const multer = require("multer");

// // Define storage options
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./media");
//     },
//     filename: function (req, file, cb) {
//         const fileName = req.user.firstName; 
//         const fileExtension = file.originalname.split('.').pop(); 
//         cb(null, `${fileName}.${fileExtension}`); 
//     }
// });

// // Define file filter function
// const fileFilter = function (req, file, cb) {
//     if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
//         return cb(new Error("Only .jpg, .jpeg, and .png files are allowed"), false);
//     }
//     cb(null, true);
// };

// // Create the uploader with storage, file filter, and size limit options
// const uploader = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: 1024 * 1024 * 5,
//         file: 3
//     }
// });

// module.exports = uploader;

const multer = require('multer');

// Define storage options
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './media');
    },
    filename: (req, file, cb) => {
        const fileName = req.user.firstName;
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${fileName}.${fileExtension}`);
    }
});

// Define file filter function
const fileFilter = (req, file, cb) => {
    if (file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
        return cb(new Error('Only .jpg, .jpeg, and .png files are allowed'), false);
    }
    cb(null, true);
};

// Create the uploader with storage, file filter, and size limit options
const uploader = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 3, // 3MB file size limit
        files: 3 // Limit to 3 files
    }
});

module.exports = uploader;


