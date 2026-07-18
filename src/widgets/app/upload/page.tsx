"use client";

import { useState } from "react";
import { useWidgetSDK } from "@nitrostack/widgets";

export default function UploadPage() {
  const { callTool, isReady } = useWidgetSDK();

  const [files, setFiles] = useState<FileList | null>(null);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 700,
        margin: "auto",
      }}
    >
      <h1>Research Graph Auditor</h1>

      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) => {
          setFiles(e.target.files);
        }}
      />

      <br />
      <br />

      {files &&
        Array.from(files).map((file) => (
          <div key={file.name}>{file.name}</div>
        ))}

      <br />

      <button>
        Analyze Papers
      </button>
    </div>
  );
}