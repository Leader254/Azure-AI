import PdfTextExtractor from "./utils";

// const {
//   TextAnalyticsClient,
//   AzureKeyCredential,
// } = require("@azure/ai-text-analytics");

import {
  TextAnalyticsClient,
  AzureKeyCredential,
} from "@azure/ai-text-analytics";
// const dotenv = require("dotenv");
// dotenv.config();

const endpoint = "https://samlangserv.cognitiveservices.azure.com/";
const apiKey = "20b2780b393c48839e24ec5b5354ddb3";

async function main() {
  console.log("== Detect Language Sample ==");

  const client = new TextAnalyticsClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );

  // Extract the text from the PDF
  const pdfText = await PdfTextExtractor();

  if (pdfText) {
    const documents = [pdfText]; // Use the extracted text as the document for language detection

    const results = await client.detectLanguage(documents);

    for (const result of results) {
      console.log(`- Document ${result.id}`);
      if (!result.error) {
        const primaryLanguage = result.primaryLanguage;
        console.log(
          `\tDetected language: ${primaryLanguage.name} (ISO 6391 code: ${primaryLanguage.iso6391Name}), Confidence Score is ${primaryLanguage.confidenceScore}`
        );
      } else {
        console.error("\tError:", result.error);
      }
    }
  } else {
    console.error("Failed to extract text from the PDF.");
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
