const multer = require("multer");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const { PDFDocument } = require("pdf-lib");
const { streamToBuffer } = require("../utils/azureStorage");
require("dotenv").config();

// Azure storage configuration
const account = process.env.AZURE_STORAGE_ACCOUNT;
// const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const sasToken =
  "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-08-17T01:52:04Z&st=2024-08-16T17:52:04Z&spr=https&sig=WbVlDjlkTginy0oNy1SPJIxU1O44r%2FnOzfsM8R6RfRI%3D";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
// const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net/?${sasToken}`
  // sharedKeyCredential
);
// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

// Controller to handle PDF upload
exports.uploadPdf = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ message: err.message });

    const file = req.file;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = file.originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
      await blockBlobClient.upload(file.buffer, file.size);
      res.status(200).json({ message: "File uploaded successfully!!!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// Controller to extract text from the latest PDF
exports.extractText = async (req, res) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  let latestBlob = null;
  let latestBlobDate = new Date(0);

  for await (const blob of containerClient.listBlobsFlat()) {
    if (blob.properties.lastModified > latestBlobDate) {
      latestBlobDate = blob.properties.lastModified;
      latestBlob = blob;
    }
  }

  if (!latestBlob) return res.status(404).json({ message: "No PDF found" });

  const blobClient = containerClient.getBlobClient(latestBlob.name);
  const downloadBlockBlobResponse = await blobClient.download();
  const pdfBuffer = await streamToBuffer(
    downloadBlockBlobResponse.readableStreamBody
  );

  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const text = await extractTextFromPdf(pdfDoc);
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ message: "Error extracting text" });
  }
};

async function extractTextFromPdf(pdfDoc) {
  const pages = pdfDoc.getPages();
  let fullText = "";

  for (const page of pages) {
    fullText += await page.getTextContent();
  }

  return fullText;
}
