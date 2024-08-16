const { PDFDocument } = require("pdf-lib");

exports.extractTextFromPdf = async (pdfBuffer) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  let fullText = "";

  for (const page of pages) {
    fullText += await page.getTextContent();
  }

  return fullText;
};
