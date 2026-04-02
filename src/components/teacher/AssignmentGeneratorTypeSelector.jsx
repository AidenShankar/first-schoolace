import React from "react";
import { FileText, PenLine, ClipboardList, BookOpen } from "lucide-react";

const TYPES = [
  {
    id: "worksheet",
    label: "Worksheet",
    description: "Printable worksheet with questions and answer spaces",
    icon: FileText,
    color: "indigo",
  },
  {
    id: "text_assignment",
    label: "Text-Based Assignment",
    description: "Essay, short answer, or written response assignment",
    icon: PenLine,
    color: "emerald",
  },
  {
    id: "project",
    label: "Project / Research",
    description: "Multi-step project with rubric and milestones",
    icon: ClipboardList,
    color: "amber",
  },
  {
    id: "reading_response",
    label: "Reading Response",
    description: "Questions based on a reading passage or article",
    icon: BookOpen,
    color: "rose",
  },
];

const colorMap = {
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-400", hoverBg: "hover:bg-indigo-50" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-400", hoverBg: "hover:bg-emerald-50" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-400", hoverBg: "hover:bg-amber-50" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-400", hoverBg: "hover:bg-rose-50" },
};

export default function AssignmentGeneratorTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700">Assignment Type</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TYPES.map((type) => {
          const colors = colorMap[type.color];
          const isSelected = selectedType === type.id;
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${colors.border} ${colors.hoverBg} bg-opacity-50 shadow-sm`
                  : `border-slate-200 hover:border-slate-300 ${colors.hoverBg}`
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{type.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}