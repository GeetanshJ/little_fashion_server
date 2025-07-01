import multer from "multer";
// multer for product profile

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/product_images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const productFileFilter = function (req, file, cb) {
  const allowedTypes = [
    "image/jpeg",
    "text/plain",
    "image/png",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter:productFileFilter
});








// multer for user profile

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/user_images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});


export const uploadUser = multer({
  storage: userStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
