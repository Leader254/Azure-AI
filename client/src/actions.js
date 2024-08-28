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
    { label: "Detect Language", icon: "pi pi-language", apiPath: "/detect" },
    {
      label: "Analyze Sentiments",
      icon: "pi pi-chart-scatter",
      apiPath: "/analyzeSentiment",
    },
    { label: "Extract Key Phrases", icon: "pi pi-key", apiPath: "/keyPhrases" },
    {
      label: "Recognize Linked Entities",
      icon: "pi pi-link",
      apiPath: "/entities",
    },
  ];

  const handleTabChange = async (e) => {
    const { apiPath, label } = e.value;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/pdf${apiPath}`
      );
      const data = response.data;

      setAnalysisInfo((prevInfo) => ({
        ...prevInfo,
        text: label === "Detect Language" ? data.extractedText : null,
        languageDetection:
          label === "Detect Language" ? data.languageDetection || [] : null,
        sentimentAnalysis: label === "Analyze Sentiments" ? data || [] : null,
        keyPhrases: label === "Extract Key Phrases" ? data || [] : null,
        linkedEntities:
          label === "Recognize Linked Entities" ? data.entities || [] : null,
      }));
    } catch (error) {
      console.error(`Error in ${label.toLowerCase()}:`, error);
      setAnalysisInfo((prevInfo) => ({
        ...prevInfo,
        text: null,
        languageDetection:
          label === "Detect Language"
            ? [
                {
                  detectedLanguage: "Error",
                  iso6391Code: "",
                  confidenceScore: 0,
                },
              ]
            : null,
        sentimentAnalysis:
          label === "Analyze Sentiments"
            ? [
                {
                  text: "Error analyzing sentiment.",
                  sentiment: "Error",
                  confidenceScores: {},
                },
              ]
            : null,
        keyPhrases:
          label === "Extract Key Phrases"
            ? [{ text: "Error extracting key phrases.", keyPhrases: ["Error"] }]
            : null,
        linkedEntities:
          label === "Recognize Linked Entities"
            ? [
                {
                  text: "Error extracting linked entities.",
                  linkedEntities: ["Error"],
                },
              ]
            : null,
      }));
    }
  };

  const renderCard = (title, content) => (
    <Card title={title}>
      {content || <p className="m-0">No {title.toLowerCase()} available.</p>}
    </Card>
  );

  return (
    <div>
      <TabMenu model={items} onTabChange={handleTabChange} className="mt-3" />
      <div className="card">
        {analysisInfo.text &&
          renderCard(
            "Extracted Text",
            <p className="m-0">{analysisInfo.text}</p>
          )}

        {analysisInfo.languageDetection &&
          renderCard(
            "Language Detection Result",
            analysisInfo.languageDetection.length > 0 ? (
              <p className="m-0">
                <strong>Language:</strong>
                {analysisInfo.languageDetection[0].detectedLanguage} <br />
                <strong>ISO 6391 Code:</strong>
                {analysisInfo.languageDetection[0].iso6391Code} <br />
                <strong>Confidence Score:</strong>
                {analysisInfo.languageDetection[0].confidenceScore}
              </p>
            ) : null
          )}

        {analysisInfo.sentimentAnalysis &&
          renderCard(
            "Sentiment Analysis Result",
            analysisInfo.sentimentAnalysis.length > 0
              ? analysisInfo.sentimentAnalysis.map((result, index) => (
                  <div key={index}>
                    <p className="m-0">
                      <strong>Overall Sentiment:</strong> {result.sentiment}
                      <br />
                      <strong>Confidence Scores:</strong>
                      {JSON.stringify(result.confidenceScores)} <br />
                      <strong>Sentences:</strong>
                    </p>
                    {result.sentences.map((sentence, idx) => (
                      <div key={idx} style={{ marginLeft: "20px" }}>
                        <p className="m-0">
                          <strong>Sentence Sentiment:</strong>
                          {sentence.sentiment} <br />
                          <strong>Confidence Scores:</strong>
                          {JSON.stringify(sentence.confidenceScores)}
                        </p>
                      </div>
                    ))}
                  </div>
                ))
              : null
          )}

        {analysisInfo.keyPhrases &&
          renderCard(
            "Key Phrases Extraction Result",
            analysisInfo.keyPhrases.length > 0
              ? analysisInfo.keyPhrases.map((result, index) => (
                  <div key={index}>
                    <p className="m-0">
                      <strong>Key Phrases:</strong>
                    </p>
                    <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                      {result.keyPhrases.map((phrase, idx) => (
                        <li key={idx} style={{ paddingBottom: "4px" }}>
                          {phrase}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              : null
          )}

        {analysisInfo.linkedEntities &&
          renderCard(
            "Linked Entities Results",
            analysisInfo.linkedEntities.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {analysisInfo.linkedEntities.map((entity, index) => (
                  <div
                    key={index}
                    style={{
                      flex: "1 1 300px",
                      minWidth: "300px",
                      border: "1px solid #ccc",
                      padding: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="m-0">
                      <strong>Entity:</strong> {entity.name} <br />
                      <strong>Data Source:</strong> {entity.dataSource} <br />
                      <strong>URL:</strong>
                      <a
                        href={entity.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Follow link
                      </a>
                      <br />
                      {entity.matches.map((match, matchIndex) => (
                        <div key={matchIndex}>
                          <strong>Matched Text:</strong> {match.text} <br />
                          <strong>Confidence Score:</strong>
                          {match.confidenceScore}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null
          )}
      </div>
    </div>
  );
}
