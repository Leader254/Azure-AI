const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const pdfParse = require("pdf-parse");

const account = "filestorage2024sam";
const accountKey =
  "jc3zyiVdNgv4yr/boOU/aRli1e097jSmcxMw0+PBRCa0vPpdFVKL/rfW7C/jjeJQG+VxI4wnYSMI+AStHEoLjg==";
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const containerName = "azure-lang";

async function main() {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    let latestBlob = null;
    let latestBlobDate = new Date(0);

    let blobs = containerClient.listBlobsFlat();
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

      try {
        const pdfData = await pdfParse(downloaded);
        console.log("Extracted text from PDF:", pdfData.text);
      } catch (err) {
        console.error("Error parsing PDF:", err);
      }

      console.log("Downloaded blob content:", downloaded);
    } else {
      console.log("No blobs found in the container.");
    }
  } catch (err) {
    console.error("Error processing blobs:", err);
  }
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

main();
