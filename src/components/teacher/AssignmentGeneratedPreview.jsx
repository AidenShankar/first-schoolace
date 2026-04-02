import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, CheckCircle2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function BouncingDots() {
  return (
    <span className="inline-flex items-end gap-0.5 ml-1 h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-white inline-block"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

const MOCK_STUDENTS = [
  "Aiden Shankar",
  "Brianna Torres",
  "Carlos Mendez",
  "Diana Chen",
  "Ethan Park",
];

export default function AssignmentGeneratedPreview({ onBack }) {
  const [chatInput, setChatInput] = useState("");
  const [finalizeState, setFinalizeState] = useState("idle"); // idle | finalizing | released
  const [showReleasedDialog, setShowReleasedDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);

  const handleFinalize = () => {
    setFinalizeState("finalizing");
    setTimeout(() => {
      setFinalizeState("idle");
      setShowReleasedDialog(true);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Generated Assignment</h3>
          <p className="text-sm text-slate-500 mt-0.5">Review the assignment below, request changes, or finalize.</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl text-sm gap-2">
                <span className="text-slate-500">Viewing:</span>
                <span className="font-semibold text-slate-800">{selectedStudent}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {MOCK_STUDENTS.map((student) => (
                <DropdownMenuItem
                  key={student}
                  onClick={() => setSelectedStudent(student)}
                  className={selectedStudent === student ? "bg-indigo-50 font-semibold" : ""}
                >
                  {student}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={onBack} className="rounded-xl text-sm">
            ← Back to Generator
          </Button>
        </div>
      </div>

      {/* Worksheet Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <iframe
          src="https://media.base44.com/files/public/687ed6bea54c832b17eb40bc/dd53e3dd5_ACEGeneratedAssignment.pdf"
          className="w-full"
          style={{ height: 700 }}
          title="Generated Assignment"
        />
      </div>

      {/* AI Chat Bubble */}
      <div className="relative">
        <div className="flex items-end gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {/* Input bubble */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm overflow-hidden">
            <div className="px-4 py-3 text-sm text-slate-400 font-medium">
              Request any changes to this assignment…
            </div>
            <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='e.g. "Add a vocabulary section at the end"'
                className="flex-1 text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-400"
                disabled
              />
              <button disabled className="ml-3 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center opacity-50 cursor-not-allowed">
                <Send className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 ml-12">Powered by ACE AI · Changes coming soon</p>
      </div>

      {/* Finalize Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleFinalize}
          disabled={finalizeState === "finalizing"}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-sm min-w-[180px]"
        >
          {finalizeState === "finalizing" ? (
            <span className="flex items-center">
              Finalizing<BouncingDots />
            </span>
          ) : (
            "Finalize and Release"
          )}
        </Button>
      </div>

      {/* Released Dialog */}
      <Dialog open={showReleasedDialog} onOpenChange={setShowReleasedDialog}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 text-center">Released!</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 text-sm mt-1 mb-4">The assignment has been released to your students.</p>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowReleasedDialog(false)}
              className="px-10 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}