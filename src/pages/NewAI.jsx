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

      const raw = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert study notes creator. A student has uploaded a document. Analyze it carefully and produce comprehensive structured study notes.

File name: ${file.name}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "title": "emoji + short descriptive title",
  "overview": "2-3 sentence overview of the document",
  "sections": [
    {
      "heading": "Section heading with emoji",
      "type": "key_points",
      "content": ["point 1", "point 2", "point 3"]
    },
    {
      "heading": "Reading Check heading",
      "type": "reading_check",
      "content": [{"question": "Q?", "answer": "A."}]
    },
    {
      "heading": "Compare & Contrast heading",
      "type": "compare_contrast",
      "content": {"left_label": "A", "right_label": "B", "rows": [{"label": "Topic", "left": "...", "right": "..."}]}
    }
  ]
}

Use a mix of section types: key_points, reading_check, compare_contrast, summary, definitions, timeline — whichever fit the content best.`,
        file_urls: [file_url],
      });

      let result;
      if (typeof raw === "string") {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      } else {
        result = raw;
      }

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