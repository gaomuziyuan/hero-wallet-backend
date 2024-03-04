const express = require("express");
const router = express.Router();
const multer = require('multer');
const { createSchema, validate } = require("../middlewares/validation")
const {
  getDocumentInfo,
  getDocumentContent,
  uploadDocument
} = require("../controllers/documentController")

// Multer file upload settings
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MiB
  }
});

// Validate file presence
const validateFilePresence = (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({
      code: 400,
      message: "No file detected"
    });
  }
  next();
};

// validate document type
const uploadDocumentSchema = createSchema({
  body: {
    document_type: true
  },
  params: {
    id: true,
  }
})

const documentInfoSchema = createSchema({
  params: {
    id: true,
  },
})

const documentContentSchema = createSchema({
  params: {
    id: true,
  },
  query: {
    side: true
  }
})

// Handling multer error
const MulterErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      code: 400,
      message: `File uploading payload error. ${err.message}`
    });
  }
  next();
};

router.get('/v1/document_info/:id',validate(documentInfoSchema), getDocumentInfo);
router.get('/v1/document_content/:id', validate(createSchema(documentContentSchema)), getDocumentContent);
router.post('/v1/upload_document/:id',
  upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]),
  validateFilePresence,
  validate(uploadDocumentSchema),
  uploadDocument,
  MulterErrorHandler
);

module.exports = router;
