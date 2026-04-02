import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, X, Upload, Plus, Link2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import AssignmentGeneratorTypeSelector from "./AssignmentGeneratorTypeSelector";
import AssignmentGeneratorStudentSelector from "./AssignmentGeneratorStudentSelector";
import AssignmentGeneratedPreview from "./AssignmentGeneratedPreview";

export default function AssignmentGenerator({ classId, onCancel }) {
  const [genState, setGenState] = useState("form"); // form | generating | preview

  const [formData, setFormData] = useState({
    topic: "",
    subject: "other",
    assignmentType: "",
    description: "",
    gradeLevel: "",
    duration: [30],
    difficulty: [50],
    distributionMode: "",
    selectedStudentIds: [],
    files: [],
    links: [],
    newLink: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLink = () => {
    const url = formData.newLink.trim();
    if (!url) return;
    handleChange("links", [...formData.links, url]);
    handleChange("newLink", "");
  };

  const handleRemoveLink = (index) => {
    handleChange("links", formData.links.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    handleChange("files", [...formData.files, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    handleChange("files", formData.files.filter((_, i) => i !== index));
  };

  const getDifficultyLabel = (value) => {
    if (value <= 20) return "Very Easy";
    if (value <= 40) return "Easy";
    if (value <= 60) return "Medium";
    if (value <= 80) return "Hard";
    return "Very Hard";
  };

  const getDurationLabel = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hour${hrs > 1 ? "s" : ""}`;
  };

  const handleGenerate = () => {
    setGenState("generating");
    setTimeout(() => setGenState("preview"), 10000);
  };

  if (genState === "generating") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-32 gap-6"
      >
        <div className="flex flex-col items-start gap-2">
          {/* AI bubble with bouncing dots */}
          <div className="flex items-end gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm px-5 py-3.5 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-700">ACE AI is generating your assignment…</p>
          <p className="text-sm text-slate-400 mt-1">This usually takes about 10 seconds</p>
        </div>
      </motion.div>
    );
  }

  if (genState === "preview") {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
        <CardContent className="p-8">
          <AssignmentGeneratedPreview onBack={() => setGenState("form")} />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-purple-600" />
              Generate Assignment with AI
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-slate-100 rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Topic & Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Topic / Title</Label>
              <Input
                value={formData.topic}
                onChange={(e) => handleChange("topic", e.target.value)}
                placeholder="e.g. Photosynthesis, The Great Gatsby Chapter 3"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Subject</Label>
              <Select value={formData.subject} onValueChange={(v) => handleChange("subject", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grade Level */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Grade Level</Label>
            <Select value={formData.gradeLevel} onValueChange={(v) => handleChange("gradeLevel", v)}>
              <SelectTrigger className="rounded-xl max-w-xs">
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "College"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g === "K" ? "Kindergarten" : g === "College" ? "College" : `Grade ${g}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Type */}
          <AssignmentGeneratorTypeSelector
            selectedType={formData.assignmentType}
            onSelect={(type) => handleChange("assignmentType", type)}
          />

          {/* Description / Additional Instructions */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Additional Instructions (Optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Any specific requirements, topics to cover, format preferences..."
              className="rounded-xl h-24"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700">Estimated Duration</Label>
              <span className="text-sm font-medium text-indigo-600">{getDurationLabel(formData.duration[0])}</span>
            </div>
            <Slider
              value={formData.duration}
              onValueChange={(v) => handleChange("duration", v)}
              min={10}
              max={180}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>10 min</span>
              <span>3 hours</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Reference Files (Optional)</Label>
            <p className="text-xs text-slate-500">Upload textbook pages, notes, or reference material for the AI to use</p>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
              {formData.files.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Upload className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                    <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile(i)} className="h-6 w-6 flex-shrink-0">
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <input type="file" id="gen-file-upload" className="hidden" multiple onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.txt,.pptx" />
              <Button asChild variant="outline" className="w-full rounded-lg">
                <label htmlFor="gen-file-upload" className="cursor-pointer flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" /> Add Files
                </label>
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Reference Links (Optional)</Label>
            <p className="text-xs text-slate-500">Paste website URLs for the AI to reference while creating the assignment</p>
            <div className="space-y-2">
              {formData.links.map((link, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                  <Link2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate min-w-0">
                    {link}
                  </a>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLink(i)} className="h-6 w-6 flex-shrink-0 ml-auto">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={formData.newLink}
                  onChange={(e) => handleChange("newLink", e.target.value)}
                  placeholder="https://example.com/article"
                  className="rounded-lg"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                />
                <Button type="button" variant="outline" onClick={handleAddLink} className="rounded-lg px-4 flex-shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* Student Distribution */}
          <div className="pt-2 border-t border-slate-200">
            <AssignmentGeneratorStudentSelector
              classId={classId}
              distributionMode={formData.distributionMode}
              onDistributionModeChange={(mode) => handleChange("distributionMode", mode)}
              selectedStudentIds={formData.selectedStudentIds}
              onSelectedStudentsChange={(ids) => handleChange("selectedStudentIds", ids)}
              difficulty={formData.difficulty}
              onDifficultyChange={(v) => handleChange("difficulty", v)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onCancel} className="px-8 py-3 rounded-xl border-slate-300 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={!formData.topic || !formData.assignmentType}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Assignment
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}