import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Sparkles } from "lucide-react";

export default function CreateAssignmentChoiceDialog({ open, onOpenChange, onChooseManual, onChooseGenerate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Assignment</DialogTitle>
          <DialogDescription>
            How would you like to create your assignment?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={onChooseManual}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <FileText className="w-7 h-7 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Create Manually</p>
              <p className="text-sm text-slate-500 mt-1">
                Build your assignment from scratch with full control
              </p>
            </div>
          </button>

          <button
            onClick={onChooseGenerate}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              ACE AI
            </div>
            <div className="w-14 h-14 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
              <Sparkles className="w-7 h-7 text-purple-600 transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Generate with AI</p>
              <p className="text-sm text-slate-500 mt-1">
                Let ACE AI create a complete assignment for your students
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}