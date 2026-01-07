
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Image, Loader2, FileVideo, Music } from "lucide-react";
import { motion } from "framer-motion";

export default function SubmissionUpload({ assignment, onSubmit, onCancel, isSubmitting }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const acceptedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "video/mp4",
      "audio/mpeg", // .mp3
      "video/quicktime", // .mov
      "audio/mp4" // .m4a
    ];

    const MAX_FILE_SIZE_MB = 25;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      alert(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    
    const fileNameLower = selectedFile.name.toLowerCase();
    const isAcceptedExtension = 
      fileNameLower.endsWith('.pdf') ||
      fileNameLower.endsWith('.png') ||
      fileNameLower.endsWith('.jpeg') ||
      fileNameLower.endsWith('.jpg') ||
      fileNameLower.endsWith('.docx') ||
      fileNameLower.endsWith('.mp4') ||
      fileNameLower.endsWith('.mp3') ||
      fileNameLower.endsWith('.mov') ||
      fileNameLower.endsWith('.m4a');

    if (acceptedTypes.includes(selectedFile.type) || isAcceptedExtension) {
      setFile(selectedFile);
    } else {
      alert("Unsupported file type. Please upload a PDF, DOCX, PNG, JPG, MP4, MP3, MOV, or M4A file.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to submit.");
      return;
    }

    onSubmit({ file });
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8 text-slate-400" />;
    if (file.type === "application/pdf") return <FileText className="w-8 h-8 text-red-500" />;
    if (file.type.startsWith("image/")) return <Image className="w-8 h-8 text-blue-500" />;
    if (file.type.startsWith("video/")) return <FileVideo className="w-8 h-8 text-purple-500" />;
    if (file.type.startsWith("audio/")) return <Music className="w-8 h-8 text-orange-500" />;
    // Default for docx and other general documents that might not have specific icons
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) return <FileText className="w-8 h-8 text-blue-700" />;
    return <FileText className="w-8 h-8 text-gray-500" />; // Generic fallback
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Submit Assignment
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-slate-600 font-medium">{assignment.title}</p>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Upload Your Work
              </label>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  dragActive
                    ? "border-indigo-400 bg-indigo-50"
                    : file
                    ? "border-green-400 bg-green-50"
                    : "border-slate-300 hover:border-slate-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.mp4,.mp3,.mov,.m4a"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    {getFileIcon()}
                  </div>

                  {file ? (
                    <div>
                      <p className="text-lg font-semibold text-green-700 mb-2">File Selected</p>
                      <p className="text-slate-600 font-medium">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-lg"
                        onClick={() => setFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-semibold text-slate-700 mb-2">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-slate-500 mb-4">
                        Supports PDF, DOCX, PNG, JPG, MP4, MP3, MOV, M4A (up to 25MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border-slate-300 hover:border-indigo-500 hover:text-indigo-600"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-8 py-3 rounded-xl border-slate-300 hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !file}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Assignment"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
