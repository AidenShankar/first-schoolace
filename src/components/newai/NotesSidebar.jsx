import React from "react";
import { FileText, Upload, MessageSquare, Bookmark, Mic, List, Pencil } from "lucide-react";

const icons = [
  { icon: Pencil, label: "Edit" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Bookmark, label: "Saved" },
  { icon: Mic, label: "Record" },
  { icon: List, label: "Outline" },
];

export default function NotesSidebar({ onReset }) {
  return (
    <div className="w-12 flex flex-col items-center py-3 gap-4 shrink-0 border-r"
      style={{ background: "#111111", borderColor: "#2a2a2a" }}>
      {/* Logo */}
      <div className="w-7 h-7 rounded-md flex items-center justify-center mb-1"
        style={{ background: "#7c3aed" }}>
        <span className="text-white font-bold text-xs">S</span>
      </div>

      {icons.map(({ icon: Icon, label }) => (
        <button key={label} title={label}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "#6b6b6b" }}
          onMouseEnter={e => e.currentTarget.style.color = "#e8e8e8"}
          onMouseLeave={e => e.currentTarget.style.color = "#6b6b6b"}>
          <Icon className="w-4 h-4" />
        </button>
      ))}

      <div className="mt-auto flex flex-col items-center gap-3">
        <button onClick={onReset} title="Upload new"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "#6b6b6b" }}
          onMouseEnter={e => e.currentTarget.style.color = "#e8e8e8"}
          onMouseLeave={e => e.currentTarget.style.color = "#6b6b6b"}>
          <Upload className="w-4 h-4" />
        </button>
        {/* User avatar placeholder */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "#7c3aed" }}>A</div>
      </div>
    </div>
  );
}