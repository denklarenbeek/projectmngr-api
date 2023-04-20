const multer = require('multer');
const storage = multer.memoryStorage();
exports.multerUploads = multer({ storage }).single('image');
