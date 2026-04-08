const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only jpg, png, webp, mp4 are allowed.'));
    }
    return cb(null, true);
  },
});

module.exports = upload;
