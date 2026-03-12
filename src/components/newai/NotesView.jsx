import React, { useState } from "react";
import NotesSidebar from "./NotesSidebar";
import NotesContent from "./NotesContent";
import NotesChat from "./NotesChat";

export default function NotesView({ notesData, onReset }) {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <NotesSidebar onReset={onReset} />
      <div className="flex-1 flex overflow-hidden">
        <NotesContent notesData={notesData} />
        {chatOpen && <NotesChat notesData={notesData} onClose={() => setChatOpen(false)} />}
      </div>
    </div>
  );
}