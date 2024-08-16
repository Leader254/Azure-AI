const express = require("express");
const { extractText, uploadPdf } = require("../controllers/pdfController");
const router = express.Router();

router.post("/upload", uploadPdf);
router.get("/extract", extractText);

module.exports = router;
