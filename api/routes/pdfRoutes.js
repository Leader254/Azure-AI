const express = require("express");
const {
  extractText,
  uploadPdf,
  detectLanguage,
  getLatestBlob,
  analyzeSentiment,
  keyPhrases,
  recognizeLinkedEntities,
} = require("../controllers/pdfController");
const router = express.Router();

router.post("/upload", uploadPdf);
router.get("/extract", extractText);
router.get("/detect", detectLanguage);
router.get("/latest", getLatestBlob);
router.get("/analyzeSentiment", analyzeSentiment);
router.get("/keyphrases", keyPhrases);
router.get("/entities", recognizeLinkedEntities);

module.exports = router;
