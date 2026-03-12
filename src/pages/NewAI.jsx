import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import NotesView from "@/components/newai/NotesView";
import ProcessingView from "@/components/newai/ProcessingView";
import UploadView from "@/components/newai/UploadView";

export default function NewAI() {
  const [stage, setStage] = useState("upload"); // upload | processing | notes
  const [progress, setProgress] = useState(0);
  const [processingLabel, setProcessingLabel] = useState("Processing document...");
  const [notesData, setNotesData] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileSelected = async (file) => {
    setFileName(file.name);
    setStage("processing");
    setProgress(5);

    // Simulate progress ticks while AI runs
    const ticker = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.floor(Math.random() * 6) + 2;
      });
    }, 600);

    try {
      setProcessingLabel("Uploading document...");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setProcessingLabel("Extracting content...");
      setProgress(25);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert study notes creator. A student has uploaded a document. Analyze it and produce structured study notes.

File URL: ${file_url}
File name: ${file.name}

Create comprehensive, well-organized study notes from this document. Return a JSON object with:
- title: a short, descriptive title with an emoji prefix (e.g. "📚 Chapter 5: Colonial America")
- overview: a 2-3 sentence brief overview of what the document covers
- sections: array of section objects, each with:
  - heading: section heading (with relevant emoji)
  - type: one of "key_points", "reading_check", "compare_contrast", "summary", "definitions", "timeline"
  - content: for key_points → array of strings; for reading_check → array of {question, answer}; for compare_contrast → {left_label, right_label, rows: [{label, left, right}]}; for summary → string; for definitions → array of {term, definition}; for timeline → array of {date, event}
`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            overview: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  heading: { type: "string" },
                  type: { type: "string" },
                  content: {}
                }
              }
            }
          }
        }
      });

      clearInterval(ticker);
      setProgress(100);
      setProcessingLabel("Done!");
      setNotesData({ ...result, fileName: file.name, fileUrl: file_url });

      setTimeout(() => setStage("notes"), 500);
    } catch (e) {
      clearInterval(ticker);
      console.error(e);
      alert("Failed to process document. Please try again.");
      setStage("upload");
    }
  };

  if (stage === "upload") return <UploadView onFileSelected={handleFileSelected} />;
  if (stage === "processing") return <ProcessingView progress={progress} label={processingLabel} />;
  return <NotesView notesData={notesData} onReset={() => setStage("upload")} />;
}