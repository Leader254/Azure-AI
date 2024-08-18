import React, { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import axios from "axios";
import { Fieldset } from "primereact/fieldset";
import LanguageActions from "./actions";
import { Panel } from "primereact/panel";

export default function TemplateDemo() {
  const toast = useRef(null);
  const fileUploadRef = useRef(null);
  const [totalSize, setTotalSize] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const ref = useRef(null);
  const [hasDocument, setHasDocument] = useState(false);

  const onTemplateSelect = (e) => {
    setHasDocument(true);
    let _totalSize = totalSize;
    let files = e.files;

    Object.keys(files).forEach((key) => {
      _totalSize += files[key].size || 0;
    });

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = async (e) => {
    let file = e.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/pdf/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("response,", response);
      setUploadedFile(file);
      setHasDocument(false); // Reset document flag after upload
      setTotalSize(0);

      toast.current.show({
        severity: "info",
        summary: "Success",
        detail: "File Uploaded Successfully",
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "File Upload Failed",
      });
    }
  };

  const extractTextFromPdf = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pdf/extract");
      setExtractedText(response.data.text);
      toast.current.show({
        severity: "info",
        summary: "Success",
        detail: "Text Extracted Successfully",
      });
    } catch (err) {
      console.error("Error extracting text:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Text Extraction Failed",
      });
    }
  };

  const getLatestBlob = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pdf/latest");
      const { text } = response.data;
      setExtractedText(text);
      toast.current.show({
        severity: "info",
        summary: "Success",
        detail: "Latest Blob Text Extracted Successfully",
      });
    } catch (err) {
      console.error("Error getting latest blob:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to Get Latest Blob",
      });
    }
  };

  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - file.size);
    setHasDocument(false);
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
    setHasDocument(false);
  };

  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 100000;
    const formattedValue = fileUploadRef.current
      ? fileUploadRef.current.formatSize(totalSize)
      : "0 B";

    return (
      <div
        className={className}
        style={{
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formattedValue} / 10 MB</span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{ width: "10rem", height: "12px" }}
          ></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: "40%" }}>
          {file.type === "application/pdf" ? (
            <i
              className="pi pi-file-pdf"
              style={{ fontSize: "2em", marginRight: "1em" }}
            ></i>
          ) : (
            <img
              alt={file.name}
              role="presentation"
              src={file.objectURL}
              width={100}
            />
          )}
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <Tag
          value={props.formatSize}
          severity="warning"
          className="px-3 py-2"
        />
        <Button
          type="button"
          icon="pi pi-times"
          className="p-button-outlined p-button-rounded p-button-danger ml-auto"
          onClick={() => onTemplateRemove(file, props.onRemove)}
        />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i
          className="pi pi-file mt-3 p-5"
          style={{
            fontSize: "5em",
            borderRadius: "50%",
            backgroundColor: "var(--surface-b)",
            color: "var(--surface-d)",
          }}
        ></i>
        <span
          style={{ fontSize: "1.2em", color: "var(--text-color-secondary)" }}
          className="my-5"
        >
          Drag and Drop Files Here
        </span>
      </div>
    );
  };

  const chooseOptions = {
    icon: "pi pi-fw pi-file",
    iconOnly: true,
    className: "custom-choose-btn p-button-rounded p-button-outlined",
  };

  const uploadOptions = {
    icon: "pi pi-fw pi-cloud-upload",
    iconOnly: true,
    className:
      "custom-upload-btn p-button-success p-button-rounded p-button-outlined",
  };

  const cancelOptions = {
    icon: "pi pi-fw pi-times",
    iconOnly: true,
    className:
      "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
  };

  return (
    <>
      <div>
        <Toast ref={toast}></Toast>

        <FileUpload
          ref={fileUploadRef}
          name="demo[]"
          onSelect={onTemplateSelect}
          onClear={onTemplateClear}
          multiple={false}
          uploadHandler={onTemplateUpload}
          accept="application/pdf"
          headerTemplate={headerTemplate}
          itemTemplate={itemTemplate}
          emptyTemplate={emptyTemplate}
          customUpload={true}
          chooseOptions={chooseOptions}
          uploadOptions={uploadOptions}
          cancelOptions={cancelOptions}
        />

        <Button
          label="Extract Text from PDF"
          icon="pi pi-file"
          className="p-button-success mt-4"
          onClick={extractTextFromPdf}
          disabled={!uploadedFile}
        />

        <Button
          label="Get Latest Blob"
          icon="pi pi-refresh"
          className="p-button-info mt-4 ml-4"
          onClick={getLatestBlob}
          disabled={hasDocument}
        />
      </div>
      {extractedText && (
        <>
          <Panel ref={ref} header="Extrated Text" className="mt-4" toggleable>
            <p className="m-0">{extractedText}</p>
          </Panel>
          <LanguageActions />
        </>
      )}
    </>
  );
}
