import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, UserCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AssignmentGeneratorStudentSelector({ classId, distributionMode, onDistributionModeChange, selectedStudentIds, onSelectedStudentsChange }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!classId) return;
    const load = async () => {
      setLoading(true);
      const enrollments = await base44.entities.ClassEnrollment.filter({ class_id: classId });
      setStudents(enrollments.map(e => ({ id: e.student_id, name: e.student_name, email: e.student_email })));
      setLoading(false);
    };
    load();
  }, [classId]);

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudent = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      onSelectedStudentsChange(selectedStudentIds.filter(id => id !== studentId));
    } else {
      onSelectedStudentsChange([...selectedStudentIds, studentId]);
    }
  };

  const selectAll = () => onSelectedStudentsChange(students.map(s => s.id));
  const deselectAll = () => onSelectedStudentsChange([]);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-slate-700">Distribution</Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onDistributionModeChange("whole_class")}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
            distributionMode === "whole_class"
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">Same for Whole Class</p>
            <p className="text-xs text-slate-500">One identical assignment for everyone</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onDistributionModeChange("personalized")}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
            distributionMode === "personalized"
              ? "border-purple-400 bg-purple-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
            AI
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">Personalized per Student</p>
            <p className="text-xs text-slate-500">Unique version based on each student's ACE AI model</p>
          </div>
        </button>
      </div>

      {/* Student selector for choosing specific students */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-slate-700">
            Students ({selectedStudentIds.length} of {students.length} selected)
          </Label>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button type="button" onClick={deselectAll} className="text-xs text-slate-500 hover:text-slate-700 font-medium">
              Deselect All
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>

        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              {students.length === 0 ? "No students enrolled in this class" : "No students match your search"}
            </div>
          ) : (
            filteredStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedStudentIds.includes(student.id)}
                  onCheckedChange={() => toggleStudent(student.id)}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{student.name}</p>
                  <p className="text-xs text-slate-500 truncate">{student.email}</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}