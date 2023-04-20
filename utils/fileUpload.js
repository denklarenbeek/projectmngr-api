const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const { Readable } = require("stream");
const { v2: cloudinary } = require("cloudinary");


cloudinary.config({
    cloud_name: 'creativeunity',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const bufferUpload = async (buffer) => {
    return new Promise((resolve, reject) => {
      const writeStream = cloudinary.uploader.upload_stream((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
      const readStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      readStream.pipe(writeStream);
    });
  };


// const multerOptions = {
//     storage: multer.memoryStorage()
// }

//Middleware for uploading photo to the memory of the server, not saving it to the database
// exports.upload = multer(multerOptions).single('picture');

// exports.uploadMultiple = multer(multerOptions).fields([{ name: 'picture', maxCount: 1 }, { name: 'oldPhoto', maxCount: 1 }]);

exports.uploadToCloudinary = async (files) => {
    //check if there is no new file to resize
    if(!files) {
        console.log('no file')
        return
    }

    console.log(files.length === 1)

    const uploadedImages = [];

    //If there is one file uploaded
    if(files.length === 1) {
        const extension = files[0].mimetype.split('/')[1]
        
        //TODO: RESIZE THE PICTURE BEFORE UPLOADING
    
        const { buffer } = files[0]
        try {
            
            const {secure_url} = await bufferUpload(buffer);
            console.log(`Picture is saved an visible at ${secure_url}`)
            uploadedImages.push(secure_url);

            return uploadedImages

        } catch (error) {
            console.log(error);
            res.send({msg: 'not oke'})
        }
    } else if(files.length > 1) {
        const arr = Object.keys(files);
        arr.forEach(async function(key){
            const {secure_url} = await bufferUpload(buffer);
            uploadedImages.push(secure_url)
        })
        return uploadedImages
    }
}