import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, X, FileText, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FilePreview({ fileUrl, fileName, className = "" }) {
  const [showPreview, setShowPreview] = useState(false);

  if (!fileUrl) return null;

  const isImage = fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/);
  // Common document formats that Google Docs Viewer can handle
  const isDoc = fileName?.toLowerCase().match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|rtf)$/);

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(fileUrl, '_blank');
  };

  return (
    <>
      <div className={`flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg ${className}`}>
        {/* Thumbnail - Clickable for preview */}
        <div 
            onClick={() => setShowPreview(true)}
            className="relative flex-shrink-0 w-16 h-16 bg-white rounded-md border border-slate-200 overflow-hidden cursor-pointer group hover:border-indigo-400 transition-all flex items-center justify-center"
        >
            {isImage ? (
                <img src={fileUrl} alt={fileName} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            ) : (
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-sm transform scale-90 group-hover:scale-100 transition-all" />
            </div>
        </div>

        {/* Info & Download */}
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-900 truncate mb-1" title={fileName}>
                {fileName || "Untitled File"}
            </h4>
            <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-white bg-white/50 border-slate-200"
                onClick={handleDownload}
            >
                <Download className="w-3 h-3 mr-1.5" />
                Download
            </Button>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-900 border-slate-800">
          <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white">
              {isPDF ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              <span className="truncate max-w-md">{fileName || 'File Preview'}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPreview(false)}
                    className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden bg-black flex items-center justify-center relative p-4">
            {isImage ? (
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
              />
            ) : isDoc ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                className="w-full h-full bg-white rounded-sm border-none"
                title={fileName}
              />
            ) : (
              <div className="text-center">
                <FileText className="w-20 h-20 text-slate-600 mx-auto mb-6" />
                <p className="text-slate-400 font-medium text-lg mb-2">Preview not available for this file type</p>
                <p className="text-sm text-slate-500 mb-6">
                  Please download the file to view its contents.
                </p>
                <Button
                  variant="secondary"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}