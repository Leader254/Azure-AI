# Natural Language Processing (NLP) Project with Azure AI

## Project Overview

This project integrates Azure Cognitive Services to perform various Natural Language Processing (NLP) tasks, such as:

- Language Detection
- Sentiment Analysis
- Key Phrase Extraction
- Linked Entity Recognition

Users can upload documents (e.g., PDFs), extract text from them, and run NLP analysis on the extracted text. The results are displayed in a user-friendly interface using tabs for easy navigation.

## Features

- **File Upload**: Users can upload PDFs for analysis.
- **Text Extraction**: Text is extracted from uploaded PDFs.
- **NLP Analysis**: Provides language detection, sentiment analysis, key phrase extraction, and entity recognition using Azure Text Analytics API.
- **Caching**: Results are cached to reduce unnecessary API calls when switching between tabs.

## Technologies Used

- **Frontend**: React, PrimeReact, Axios
- **Backend**: Node.js, Express
- **Cloud**: Azure Blob Storage, Azure Text Analytics API
- **Other Libraries**: pdf-lib (for text extraction from PDFs)

## Installation

### Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [here](https://nodejs.org/).
- **Azure Account**: You will need an Azure account with access to Blob Storage and Text Analytics.

### Clone the Repository

    git clone https://github.com/Leader254/Azure-AI.git
    cd Azure-AI

**Backend Setup**
**_Navigate to the backend directory:_**

> cd backend

_Install the necessary dependencies:_

> npm install

Set up your environment variables: Create a .env file in the backend directory and add your Azure keys:

    AZURE_STORAGE_ACCOUNT=<Your Azure Storage Account Name>
    AZURE_STORAGE_CONTAINER_NAME=<Your Blob Storage Container Name>
    AZURE_STORAGE_ACCOUNT_KEY=<Your Azure Storage Account Key>
    AZURE_API_KEY=<Your Azure Text Analytics API Key>
    AZURE_ENDPOINT=<Your Azure Text Analytics API Endpoint>

Start the backend server:

> npm start

**Frontend Setup**
**_Navigate to the frontend directory:_**

> cd ../frontend

Install the necessary dependencies:

> npm install

Start the frontend development server:

> npm start

Usage

- _Upload a PDF_: Navigate to the application in your browser and upload a PDF file.
- _View NLP Analysis_: After the text is extracted, use the tabs to view the following analyses:
- _Language Detection_: Identifies the language of the text.
- _Sentiment Analysis_: Determines if the text is positive, neutral, or negative.
- _Key Phrase Extraction:_ Extracts key phrases from the text.
- _Linked Entity Recognition:_ Recognizes entities (people, places, etc.) and links them.

**API Endpoints**
**_Backend Endpoints_**

1. POST /upload: Uploads a PDF to Azure Blob Storage.
2. GET /extract-text/ : Extracts text from the specified PDF blob.
3. POST /analyze-language: Performs language detection on the text.
4. POST /analyze-sentiment: Analyzes sentiment of the text.
5. POST /extract-key-phrases: Extracts key phrases from the text.
6. POST /recognize-linked-entities: Recognizes and links entities in the text.
7. **Future Improvements**

- Support for Multiple File Types: Extend text extraction to handle more formats (e.g., Word documents).
- Enhanced Caching: Persist cached results across sessions using local storage or server-side caching.
- Batch Processing: Allow users to upload and process multiple files in one request.
