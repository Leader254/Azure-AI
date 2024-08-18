import React, { useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import axios from "axios";
import { Card } from "primereact/card";

export default function LanguageActions() {
  const [analysisInfo, setAnalysisInfo] = useState({
    text: null,
    languageDetection: null,
    sentimentAnalysis: null,
    keyPhrases: null,
    linkedEntities: null,
  });

  const items = [
    { label: "Detect Language", icon: "pi pi-language" },
    { label: "Analyze Sentiments", icon: "pi pi-chart-scatter" },
    { label: "Extract Key Phrases", icon: "pi pi-key" },
    { label: "Recognize Linked Entities", icon: "pi pi-link" },
  ];

  const handleTabChange = async (e) => {
    const selectedItem = e.value.label;

    if (selectedItem === "Detect Language") {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/pdf/detect"
        );
        const { extractedText, languageDetection } = response.data;
        setAnalysisInfo({
          text: extractedText,
          languageDetection: languageDetection || [],
          sentimentAnalysis: null,
          keyPhrases: null,
          linkedEntities: null,
        });
      } catch (error) {
        console.error("Error detecting language:", error);
        setAnalysisInfo({
          text: null,
          languageDetection: [
            { detectedLanguage: "Error", iso6391Code: "", confidenceScore: 0 },
          ],
          sentimentAnalysis: null,
          keyPhrases: null,
          linkedEntities: null,
        });
      }
    } else if (selectedItem === "Analyze Sentiments") {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/pdf/analyzeSentiment"
        );
        setAnalysisInfo({
          text: null,
          languageDetection: null,
          sentimentAnalysis: response.data || [],
          keyPhrases: null,
          linkedEntities: null,
        });
      } catch (error) {
        console.error("Error analyzing sentiment:", error);
        setAnalysisInfo({
          text: null,
          languageDetection: null,
          sentimentAnalysis: [
            {
              text: "Error analyzing sentiment.",
              sentiment: "Error",
              confidenceScores: {},
            },
          ],
          keyPhrases: null,
          linkedEntities: null,
        });
      }
    } else if (selectedItem === "Extract Key Phrases") {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/pdf/keyPhrases"
        );
        console.log("first", response);
        setAnalysisInfo({
          text: null,
          languageDetection: null,
          sentimentAnalysis: null,
          keyPhrases: response.data || [],
          linkedEntities: null,
        });
      } catch (error) {
        console.error("Error extracting key phrases:", error);
        setAnalysisInfo({
          text: null,
          languageDetection: null,
          sentimentAnalysis: null,
          keyPhrases: [
            { text: "Error extracting key phrases.", keyPhrases: ["Error"] },
          ],
          linkedEntities: null,
        });
      }
    } else if (selectedItem === "Recognize Linked Entities") {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/pdf/entities"
        );
        console.log("response", response);
        setAnalysisInfo({
          text: null,
          languageDetection: null,
          sentimentAnalysis: null,
          keyPhrases: null,
          linkedEntities: response.data || [],
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error extracting key entites:", error);
        setAnalysisInfo({
          text: null,
          languageDetection: null,
          sentimentAnalysis: null,
          keyPhrases: null,
          linkedEntities: [
            {
              text: "Error extracting linked entities.",
              linkedEntities: ["Error"],
            },
          ],
        });
      }
    }
  };

  return (
    <div>
      <TabMenu model={items} onTabChange={handleTabChange} />

      <div className="card">
        {analysisInfo.text && (
          <Card title="Extracted Text">
            <p className="m-0">{analysisInfo.text}</p>
          </Card>
        )}

        {analysisInfo.languageDetection && (
          <Card title="Language Detection Result">
            {analysisInfo.languageDetection.length > 0 ? (
              <p className="m-0">
                {analysisInfo.languageDetection[0].detectedLanguage} <br />
                <strong>ISO 6391 Code:</strong>{" "}
                {analysisInfo.languageDetection[0].iso6391Code} <br />
                <strong>Confidence Score:</strong>{" "}
                {analysisInfo.languageDetection[0].confidenceScore}
              </p>
            ) : (
              <p className="m-0">No language detected.</p>
            )}
          </Card>
        )}

        {analysisInfo.sentimentAnalysis && (
          <Card title="Sentiment Analysis Result">
            {analysisInfo.sentimentAnalysis.length > 0 ? (
              analysisInfo.sentimentAnalysis.map((result, index) => (
                <div key={index}>
                  <p className="m-0">
                    <strong>Overall Sentiment:</strong> {result.sentiment}{" "}
                    <br />
                    <strong>Confidence Scores:</strong>{" "}
                    {JSON.stringify(result.confidenceScores)} <br />
                    <strong>Sentences:</strong>
                  </p>
                  {result.sentences.map((sentence, idx) => (
                    <div key={idx} style={{ marginLeft: "20px" }}>
                      <p className="m-0">
                        <strong>Sentence Sentiment:</strong>{" "}
                        {sentence.sentiment} <br />
                        <strong>Confidence Scores:</strong>{" "}
                        {JSON.stringify(sentence.confidenceScores)}
                      </p>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="m-0">No sentiment analysis results available.</p>
            )}
          </Card>
        )}

        {analysisInfo.keyPhrases && (
          <Card title="Key Phrases Extraction Result">
            {analysisInfo.keyPhrases.length > 0 ? (
              analysisInfo.keyPhrases.map((result, index) => (
                <div key={index}>
                  <p className="m-0">
                    <strong>Key Phrases:</strong>
                  </p>
                  {result.keyPhrases.length > 0 ? (
                    <ul>
                      {result.keyPhrases.map((phrase, idx) => (
                        <li key={idx}>{phrase}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No key phrases extracted.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="m-0">No key phrases available.</p>
            )}
          </Card>
        )}

        {analysisInfo.linkedEntities && (
          <Card title="Linked Entities Results">
            {analysisInfo.linkedEntities.length > 0 ? (
              <p className="m-0">
                {analysisInfo.languageDetection[0].detectedLanguage} <br />
                <strong>ISO 6391 Code:</strong>{" "}
                {analysisInfo.languageDetection[0].iso6391Code} <br />
                <strong>Confidence Score:</strong>{" "}
                {analysisInfo.languageDetection[0].confidenceScore}
              </p>
            ) : (
              <p className="m-0">No linked entities detected.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
