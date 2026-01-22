import React, { useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileUpload({ id, label, onFileChange }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) {
            // Check file size (max 10MB for reliable AI processing)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                alert('File is too large. Please select a file smaller than 10MB for reliable AI processing.');
                return;
            }
            
            setFile(selectedFile);
            onFileChange(selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        onFileChange(null);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 text-center
                ${isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-slate-400"}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id={id}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />
                {!file ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Upload className="w-8 h-8" />
                        <p className="font-medium">Drag & drop your file here</p>
                        <p className="text-sm">or</p>
                        <Button type="button" variant="outline" asChild>
                            <label htmlFor={id} className="cursor-pointer">Browse File</label>
                        </Button>
                        <p className="text-xs mt-2">Supports PDF, DOC, DOCX, TXT, PNG, JPG (max 10MB)</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
                        <File className="w-8 h-8 text-indigo-600" />
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4 mr-1" />
                            Remove
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}