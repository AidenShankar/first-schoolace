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

  const isPDF = fileName?.toLowerCase().endsWith('.pdf');
  const isImage = fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(true)}
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl w-full h-[90vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isPDF ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              {fileName || 'File Preview'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(false)}
              className="rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden rounded-lg border">
            {isPDF ? (
              <iframe
                src={fileUrl}
                className="w-full h-full"
                title={fileName}
              />
            ) : isImage ? (
              <img
                src={fileUrl}
                alt={fileName}
                className="w-full h-full object-contain bg-slate-50"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-slate-50">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Preview not available</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Please download the file to view its contents.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}