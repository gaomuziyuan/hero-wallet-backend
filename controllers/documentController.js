const Document = require("../models/document");
const { v4: uuidv4 } = require('uuid');
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client
} = require("@aws-sdk/client-s3")

// Use .env AWS settings to create S3 instance
const s3 = new S3Client({
  region: process.env.AWS_REGION
});

// Get the basic information of a document
// TODO
// JWT and check user permission
const getDocumentInfo = async (req, res) => {
  const documentId = req.params.id;

  // Query document from database
  let document;
  try {
    document = await Document.findOne({
      where: {id: documentId},
      attributes: ['id', 'user_id', 'document_type', 'issue_date', 'expiry_date', 'document_number', 'created_at', 'updated_at']
    })
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message
    });
  }

  if (!document) {
    return res.status(404).json({
      code: 404,
      message: "Document not found"
    })
  }

  // Return result as json
  const documentJson = {
    id: document.id,
    user_id: document.user_id,
    document_type: document.document_type,
    issue_date: document.issue_date,
    expiry_date: document.expiry_date,
    document_number: document.document_number,
  };

  // Send back json
  return res.status(200).json({
    code: 200,
    message: "success",
    data: documentJson
  });
}

// Get the binary file content given document id and user id
const getDocumentContent = async (req, res) => {
  const documentId = req.params.id;
  const documentSide = req.query.side;

  // Find the document
  document = await Document.findOne({
    where: {id: documentId},
    attributes: ["user_id", "file_reference"]
  });

  // TODO
  // Check if use has permission to access this file
  // Waiting for JWT integration

  // Document not exist
  if (!document) {
    return res.status(404).json({
      code: 404,
      message: "Document not found"
    });
  }

  // Get the file key from the file reference
  const fileKey = document.file_reference[documentSide];
  if (fileKey == null) {
    return res.status(404).json({
      code: 404,
      message: `Document side ${documentSide} not found`
    })
  }

  try {
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey
    });

    const file = await s3.send(getCommand);

    res.setHeader('Content-Type', file.ContentType);
    res.status(200);

    // Return file binary stream
    file.Body.pipe(res);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: `Error getting document. ${error.message}`
    })
  }
}


// Upload a document from a user

// Logic here
// Upload Front to S3
// - Success
//   Upload Back to S3
//   - Success
//     Check if user has this document_type
//     - Has
//       Update database
//       - Success
//         delete old files from S3
//         - Success
//           200
//         - Fail
//           200, but return a special message
//       - Fail
//         500, delete new files from S3
//     - Not have
//       Insert database
//       - Success
//         200
//       - Fail
//         500, delete new files from S3
//   - Fail
//     500, delete Front from S3
// - Fail
//   500
const uploadDocument = async (req, res) => {
  const userId = req.params.id;
  const { document_type } = req.body;

  const front = req.files.front;
  const back = req.files.back;

  // Check if document type and front/back requirement
  // For document type 2(Driver's License) and 3(PR card), we require both front and back
  // For other types, we only allow front to be uploaded
  if (!front) {
    return res.status(400).json({
      code: 400,
      message: `front is required for document type ${document_type}`
    });
  }

  if (document_type == 2 || document_type == 3) {
    if (!back) {
      return res.status(400).json({
        code: 400,
        message: `back is required for document type ${document_type}`
      });
    }
  } else {
    if (back) {
      return res.status(400).json({
        code: 400,
        message: `only front is allowed for document type ${document_type}`
      });
    }
  }

  // Actual file data is wrapped inside an array
  const frontFile = front[0];
  const backFile = back? back[0] : null;

  // File extension is needed to show the file type on S3.
  // But users can upload a jpg with .pdf extension and it shows pdf type on AWS.
  // Therefore, we get the extension type from mimetype
  frontFile.fileKey = `${uuidv4()}.${frontFile.mimetype.split('\/').pop()}`;
  if (backFile) {
    backFile.fileKey = `${uuidv4()}.${backFile.mimetype.split('\/').pop()}`;
  }

  // Only allow those file types to be uploaded
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  // Check if the file's MIME type is allowed
  if (!allowedTypes.includes(frontFile.mimetype) || (backFile && !allowedTypes.includes(backFile.mimetype))) {
    // Just return 400 here, need to design specific error code later
    return res.status(400).json({
      code: 400,
      message: "Invalid file type. Only .jpg, .jpeg, and .png are allowed."
    });
  }

  // Upload front
  try {
    await _uploadToS3(frontFile)
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: `Error uploading document front. ${error.message}`
    });
  }

  // Upload back
  if (backFile) {
    try {
      await _uploadToS3(backFile)
    } catch (error) {
      // Deleting document front uploaded to S3
      try {
        await _deleteFromS3(frontFile.fileKey)
      } catch (error) {
        return res.status(500).json({
          code: 500,
          message: `Error uploading document back; Error deleting document. ${error.message}`
        });
      }

      return res.status(500).json({
        code: 500,
        message: `Error uploading document back. ${error.message}`
      });
    }
  }

  // The file references object in the Document table
  const fileReference = {
    front: frontFile.fileKey,
    back: backFile? backFile.fileKey : null
  }

  // Check if user has this document type uploaded
  let currDocument;
  try {
    currDocument = await Document.findOne({
      where: {user_id: userId, document_type: document_type},
      attributes: ["id", "file_reference"]
    })
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Error reading document from database"
    })
  }

  // Update or Insert depending on if old document exists or not
  // Old document exists, update
  try {
    if (currDocument) {
      const [affectedRows] = await Document.update({
        file_reference: fileReference,
      }, {
        where: {id: currDocument.id}
      });

      if (affectedRows != 1) {
        throw new Error("Update row failed")
      }

      // Delete old files from S3 if database update succeeds
      const oldFileReference = currDocument.file_reference;
      try {
        if (oldFileReference.front) {
          await _deleteFromS3(oldFileReference.front)
        }
        if (oldFileReference.back) {
          await _deleteFromS3(oldFileReference.back)
        }
      } catch (error) {
        return res.status(200).json({
          code: 200,
          message: `Database update succeed but error deleting document. ${error.message}`
        });
      }

      return res.status(200).json({
        code: 200,
        message: "success"
      })
    // Old document does not exist. Insert
    } else {
      const newDocument = await Document.create({
        user_id: userId,
        document_type: document_type,
        file_reference: fileReference
      })

      if (!newDocument) {
        throw new Error("Insert failed");
      }

      return res.status(200).json({
        code: 200,
        message: "success"
      });
    }
  } catch (error) {
    // TODO
    // proper logging

    // Delete two uploaded files from S3
    try {
      await Promise.all([_deleteFromS3(frontFile.fileKey), _deleteFromS3(backFile.fileKey)]);
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: `Database insertion failed and error deleting document. ${error.message}`
      });
    }

    res.status(500).json({
      code: 500,
      message: `Database insertion failed. ${error}`
    });
  }
};

// Upload the file to S3 bucket
const _uploadToS3 = async (file) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.fileKey,
      Body: file.buffer,
      ContentType: file.mimetype // stored in S3 object metadata
    });
    await s3.send(command);
  } catch (error) {
    throw error;
  }
}

const _deleteFromS3 = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey
    });
    await s3.send(command);
  } catch (error) {
    throw error;
  }
}


module.exports = {
  getDocumentInfo,
  getDocumentContent,
  uploadDocument
};
