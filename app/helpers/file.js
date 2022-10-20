const multer = require('multer')
const slugify = require('slugify')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'static/images/avatars/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.webp')
    }
})


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/webp") {
            cb(null, true);
        } else {
            return cb(new Error('Invalid mime type'));
        }
    }
});


module.exports.upload = upload 