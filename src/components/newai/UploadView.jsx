import React, { useRef, useState } from "react";
import { Upload, FileText, Zap } from "lucide-react";

export default function UploadView({ onFileSelected }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file) onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f4ff 100%)" }}>
      
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 border border-purple-200 rounded-full px-4 py-1.5 text-sm font-medium text-purple-700 shadow-sm mb-4">
          <Zap className="w-4 h-4" /> Schoolace AI Notes
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Turn any document into<br />smart study notes
        </h1>
        <p className="text-gray-500 text-lg">Upload a PDF, image, or document and get structured notes instantly.</p>
      </div>

      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full max-w-xl rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-12 flex flex-col items-center gap-4 bg-white/70 backdrop-blur-sm shadow-lg
          ${dragging ? "border-purple-500 bg-purple-50/60 scale-[1.01]" : "border-purple-300 hover:border-purple-500 hover:bg-purple-50/40"}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">Drop your file here</p>
          <p className="text-sm text-gray-500 mt-1">or click to browse — PDF, DOCX, images supported</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
        {["Key Points", "Reading Checks", "Compare & Contrast", "Definitions"].map(f => (
          <span key={f} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}