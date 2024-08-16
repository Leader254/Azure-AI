import React, { useEffect, useState } from "react";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { PDFDocument } from "pdf-lib";

const account = "filestorage2024sam";
const accountKey =
  "jc3zyiVdNgv4yr/boOU/aRli1e097jSmcxMw0+PBRCa0vPpdFVKL/rfW7C/jjeJQG+VxI4wnYSMI+AStHEoLjg==";
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const containerName = "azure-lang";

function PdfTextExtractor() {
  const [pdfText, setPdfText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function extractPdfText() {
      const containerClient =
        blobServiceClient.getContainerClient(containerName);

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
        const downloadedBuffer = await streamToBuffer(
          downloadBlockBlobResponse.readableStreamBody
        );

        // Use pdf-lib to extract the text from the PDF
        try {
          const pdfDoc = await PDFDocument.load(downloadedBuffer);
          const text = await extractTextFromPdf(pdfDoc);

          setPdfText(text);
          setLoading(false);
        } catch (err) {
          console.error("Error parsing PDF:", err);
          setLoading(false);
        }
      } else {
        console.log("No blobs found in the container.");
        setLoading(false);
      }
    }

    extractPdfText();
  }, []);

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

  async function extractTextFromPdf(pdfDoc) {
    const pages = pdfDoc.getPages();
    let fullText = "";

    pages.forEach((page) => {
      fullText += page.getTextContent();
    });

    return fullText;
  }

  if (loading) {
    return <div>Loading PDF content...</div>;
  }

  async function uploadPdf(file) {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const content = {}; // content from front end;
    const blobName = "newblob" + new Date().getTime();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(
      content,
      content.length
    );
    console.log(
      `Upload block blob ${blobName} successfully`,
      uploadBlobResponse.requestId
    );
  }

  return (
    <div>
      <h2>Extracted PDF Text</h2>
      <pre>{pdfText}</pre>
    </div>
  );
}

export default PdfTextExtractor;
