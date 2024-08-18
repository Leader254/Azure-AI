/**
 * This sample uses the key-phrase extraction endpoint to determine which
 * words or phrases in a document are of particular importance.
 *
 * @summary extracts key phrases from a piece of text
 */

const {
  TextAnalyticsClient,
  AzureKeyCredential,
} = require("@azure/ai-text-analytics");

// Load the .env file if it exists
const dotenv = require("dotenv");
dotenv.config();

const endpoint = "https://samlangserv.cognitiveservices.azure.com/";
const apiKey = "20b2780b393c48839e24ec5b5354ddb3";

const documents = [
  "Redmond is a city in King County, Washington, United States, located 15 miles east of Seattle.",
  "I need to take my cat to the veterinarian.",
  "I will travel to South America in the summer.",
];

async function main() {
  console.log("== Extract Key Phrases Sample ==");

  const client = new TextAnalyticsClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );

  const results = await client.extractKeyPhrases(documents);

  for (const result of results) {
    console.log(`- Document ${result.id}`);
    if (!result.error) {
      console.log("\tKey phrases:");
      for (const phrase of result.keyPhrases) {
        console.log(`\t- ${phrase}`);
      }
    } else {
      console.error("  Error:", result.error);
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
