import React from "react";
import { FileText, Upload, MessageSquare, Bookmark, Mic, List } from "lucide-react";

const icons = [
  { icon: FileText, label: "Notes" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Bookmark, label: "Saved" },
  { icon: Mic, label: "Record" },
  { icon: List, label: "Outline" },
];

export default function NotesSidebar({ onReset }) {
  return (
    <div className="w-14 bg-gray-950 flex flex-col items-center py-4 gap-5 border-r border-gray-800 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-2">
        <span className="text-white font-bold text-xs">S</span>
      </div>
      {icons.map(({ icon: Icon, label }) => (
        <button key={label} title={label}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <Icon className="w-4.5 h-4.5" />
        </button>
      ))}
      <div className="mt-auto">
        <button onClick={onReset} title="Upload new"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}