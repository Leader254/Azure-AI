const multer = require("multer");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const pdfParse = require("pdf-parse");
const { streamToBuffer } = require("../utils/azureStorage");
require("dotenv").config();
const {
  TextAnalyticsClient,
  AzureKeyCredential,
} = require("@azure/ai-text-analytics");

// Azure storage configuration
const account = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const apiKey = process.env.AZURE_API_KEY;
const endpoint = process.env.AZURE_ENDPOINT;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net/`,
  sharedKeyCredential
);
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

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

exports.getLatestBlob = async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    let latestBlob = null;
    let latestBlobDate = new Date(0);

    // List all blobs in the container and find the latest one
    const blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
      if (blob.properties.lastModified > latestBlobDate) {
        latestBlobDate = blob.properties.lastModified;
        latestBlob = blob;
      }
    }

    if (!latestBlob) {
      return res
        .status(404)
        .json({ error: "No blobs found in the container." });
    }

    const blobName = latestBlob.name;
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blobClient.download();

    // Convert the blob stream to buffer
    const downloadedBuffer = await streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody
    );

    // Parse the PDF content
    const pdfData = await pdfParse(downloadedBuffer);

    // Send the extracted text as response
    res.status(200).json({ text: pdfData.text });
  } catch (error) {
    console.error("Error getting PDF:", error);
    res.status(500).json({ error: "Error processing blob" });
  }
};

// Controller to extract text from the latest PDF
exports.extractText = async () => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    let latestBlob = null;
    let latestBlobDate = new Date(0);

    const blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
      if (blob.properties.lastModified > latestBlobDate) {
        latestBlobDate = blob.properties.lastModified;
        latestBlob = blob;
      }
    }

    if (latestBlob) {
      const blobName = latestBlob.name;
      const blobClient = containerClient.getBlobClient(blobName);
      const downloadBlockBlobResponse = await blobClient.download();
      const downloaded = await streamToBuffer(
        downloadBlockBlobResponse.readableStreamBody
      );

      const pdfData = await pdfParse(downloaded);
      return pdfData.text;
    } else {
      throw new Error("No blobs found in the container.");
    }
  } catch (err) {
    console.error("Error extracting text:", err);
    throw new Error("Error extracting text.");
  }
};

exports.detectLanguage = async (req, res) => {
  try {
    // Get the text from the latest blob
    const text = await exports.extractText();
    const client = new TextAnalyticsClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    if (text) {
      const documents = [text];
      const results = await client.detectLanguage(documents);

      const response = results.map((result) => {
        if (!result.error) {
          const primaryLanguage = result.primaryLanguage;
          return {
            detectedLanguage: primaryLanguage.name,
            iso6391Code: primaryLanguage.iso6391Name,
            confidenceScore: primaryLanguage.confidenceScore,
          };
        } else {
          return { error: result.error };
        }
      });

      // Send extracted text along with detected language result
      res.status(200).json({
        extractedText: text,
        languageDetection: response,
      });
    } else {
      res
        .status(400)
        .json({ error: "No text available for language detection." });
    }
  } catch (err) {
    console.error("Error detecting language:", err);
    res.status(500).json({ error: "Error detecting language" });
  }
};

exports.analyzeSentiment = async (req, res) => {
  try {
    const text = await exports.extractText();
    const client = new TextAnalyticsClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    if (text) {
      const documents = [text];
      const results = await client.analyzeSentiment(documents);

      // Format the results to send back to the frontend
      const formattedResults = results.map((result, index) => {
        if (!result.error) {
          return {
            text: documents[index],
            sentiment: result.sentiment,
            confidenceScores: result.confidenceScores,
            sentences: result.sentences.map((sentence) => ({
              text: sentence.text,
              sentiment: sentence.sentiment,
              confidenceScores: sentence.confidenceScores,
            })),
          };
        } else {
          return { error: result.error };
        }
      });

      res.status(200).json(formattedResults);
    } else {
      res
        .status(400)
        .json({ error: "No text available for sentiment analysis." });
    }
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Error analyzing sentiment" });
  }
};

exports.keyPhrases = async (req, res) => {
  try {
    const text = await exports.extractText();
    const client = new TextAnalyticsClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    if (text) {
      const documents = [text];
      const results = await client.extractKeyPhrases(documents);

      const formattedResults = results.map((result, index) => {
        if (!result.error) {
          return {
            text: documents[index],
            keyPhrases: result.keyPhrases,
          };
        } else {
          return { error: result.error };
        }
      });

      res.status(200).json(formattedResults);
    } else {
      res
        .status(400)
        .json({ error: "No text available for key phrases extraction." });
    }
  } catch (error) {
    console.error("Error extracting key phrases:", error);
    res.status(500).json({ error: "Error extracting key phrases" });
  }
};

exports.recognizeLinkedEntities = async (req, res) => {
  try {
    // Extract text from the PDF
    const text = await exports.extractText();

    if (text) {
      const client = new TextAnalyticsClient(
        endpoint,
        new AzureKeyCredential(apiKey)
      );
      const documents = [text];

      const results = await client.recognizeLinkedEntities(documents);

      const response = results.map((result) => {
        if (!result.error) {
          return {
            documentId: result.id,
            entities: result.entities.map((entity) => ({
              name: entity.name,
              url: entity.url,
              dataSource: entity.dataSource,
              matches: entity.matches.map((match) => ({
                text: match.text,
                confidenceScore: match.confidenceScore,
              })),
            })),
          };
        } else {
          return { error: result.error };
        }
      });

      res.status(200).json(response[0]); // Return the first document's results
    } else {
      res
        .status(400)
        .json({ error: "No text available for entity recognition." });
    }
  } catch (err) {
    console.error("Error recognizing linked entities:", err);
    res.status(500).json({ error: "Error recognizing linked entities" });
  }
};
