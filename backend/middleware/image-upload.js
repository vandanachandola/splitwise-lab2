const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const config = require('../config');

aws.config.update({
  accessKeyId: config.awss3.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.awss3.AWS_SECRET_ACCESS_KEY,
  region: config.awss3.AWS_LOCATION,
});

const s3 = new aws.S3();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const fileFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  if (isValid) {
    req.fileValidationError = '';
    cb(null, true);
  } else {
    req.fileValidationError =
      'Invalid Mime Type, only .jpeg, .jpg and .png files allowed!';
    cb(null, false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: config.awss3.AWS_S3_BUCKET_NAME,
    acl: config.awss3.AWS_ACL_ACCESS_CONTROL,
    metadata(req, file, cb) {
      cb(null, { fieldName: 'TESTING_META_DATA!' });
    },
    key(req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

module.exports = upload;
