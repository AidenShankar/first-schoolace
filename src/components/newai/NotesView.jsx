import React, { useState } from "react";
import NotesSidebar from "./NotesSidebar";
import NotesContent from "./NotesContent";
import NotesChat from "./NotesChat";

export default function NotesView({ notesData, onReset }) {
  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#1a1a1a", color: "#e8e8e8" }}>
      <NotesSidebar onReset={onReset} fileName={notesData?.fileName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
          style={{ borderColor: "#2e2e2e", background: "#1a1a1a" }}>
          <span className="text-xs text-gray-400 truncate max-w-xs">{notesData?.fileName}</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded text-gray-400 hover:text-gray-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "#7c3aed" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share
            </button>
            <button className="p-1.5 rounded text-gray-400 hover:text-gray-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 px-4 py-1.5 border-b shrink-0"
          style={{ borderColor: "#2e2e2e", background: "#1a1a1a" }}>
          {/* Font selector */}
          <div className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-300 border border-gray-700 cursor-pointer hover:border-gray-500 mr-1">
            <span>Clar...</span>
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          {/* Font size */}
          <button className="p-1 text-gray-400 hover:text-gray-200 text-sm">−</button>
          <span className="px-2 py-0.5 text-xs text-gray-300 border border-gray-700 rounded">24</span>
          <button className="p-1 text-gray-400 hover:text-gray-200 text-sm">+</button>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          {/* Bold, Italic, Underline */}
          {[
            { label: "B", className: "font-bold" },
            { label: "I", className: "italic" },
            { label: "U", className: "underline" },
          ].map(({ label, className }) => (
            <button key={label} className={`w-7 h-7 flex items-center justify-center rounded text-xs text-gray-300 hover:bg-gray-700 ${className}`}>{label}</button>
          ))}
          {/* Color */}
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300 text-xs font-bold relative">
            A
            <span className="absolute bottom-1 left-1.5 right-1.5 h-0.5 rounded" style={{ background: "#ef4444" }} />
          </button>
          {/* Highlight */}
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          {/* Sigma */}
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300 text-sm">Σ</button>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          {/* Image, Table, Align, List */}
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18"/></svg>
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <div className="flex-1" />
          <button className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#7c3aed" }}>
            Upgrade to Premium
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <NotesContent notesData={notesData} />
          <NotesChat notesData={notesData} />
        </div>
      </div>
    </div>
  );
}