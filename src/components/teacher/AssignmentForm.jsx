import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, FileText, Plus, X, Upload, Brain, User, Paperclip, Clock, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// This import is not directly used in the modified handleSubmit but might be used elsewhere.
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useTranslation } from "../i18n/useTranslation";
import { base44 } from "@/api/base44Client";

const initialFormState = {
  title: "",
  description: "",
  instructions: "",
  max_points: 100,
  due_date: null,
  open_date: "",
  close_date: "",
  subject: "other",
  is_visible: true,
  allow_submissions: true, // Added new state property
  use_ai_grading: true,
  leniency: "Neutral",
  attachment_file: [],
};

export default function AssignmentForm({ onSubmit, onCancel, isSubmitting, assignmentToEdit }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormState);
  const [existingAttachments, setExistingAttachments] = useState([]);

  const [showAnswerKeyUpload, setShowAnswerKeyUpload] = useState(false);
  const [answerKeyFile, setAnswerKeyFile] = useState(null);
  const [answerKeyFilename, setAnswerKeyFilename] = useState("");
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  // const [uploadingAnswerKey, setUploadingAnswerKey] = useState(false); // This state is no longer needed here

  useEffect(() => {
    if (assignmentToEdit) {
      setFormData({
        ...initialFormState,
        ...assignmentToEdit,
        due_date: assignmentToEdit.due_date ? new Date(assignmentToEdit.due_date) : null,
        open_date: assignmentToEdit.open_date ? assignmentToEdit.open_date.slice(0, 16) : "",
        close_date: assignmentToEdit.close_date ? assignmentToEdit.close_date.slice(0, 16) : "",
        // Ensure allow_submissions defaults to true if not present in assignmentToEdit
        allow_submissions: assignmentToEdit.allow_submissions !== undefined ? assignmentToEdit.allow_submissions : true,
        attachment_file: [], // Clear new attachments when editing, they are handled separately as existing_attachments
      });

      const attachments = (assignmentToEdit.attachment_urls || []).map((url, index) => ({
        url: url,
        name: (assignmentToEdit.attachment_filenames || [])[index] || `File ${index + 1}`
      }));
      setExistingAttachments(attachments);

      if (assignmentToEdit.answer_key_url) {
        setShowAnswerKeyUpload(true);
        setAnswerKeyFilename(assignmentToEdit.answer_key_filename);
      } else {
        setShowAnswerKeyUpload(false);
        setAnswerKeyFilename("");
      }
      setAnswerKeyFile(null); // Clear any potentially selected new answer key file on edit load
    } else {
      // Reset for new assignment
      setFormData(initialFormState);
      setExistingAttachments([]);
      setAnswerKeyFile(null);
      setAnswerKeyFilename("");
      setShowAnswerKeyUpload(false);
    }
  }, [assignmentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.allow_submissions && formData.use_ai_grading && !formData.instructions?.trim()) {
      alert("Please provide grading instructions for AI grading.");
      return;
    }

    // Pass all data, including files to be uploaded and existing files, to the parent component.
    const dataToSubmit = {
      ...formData,
      existing_attachments: existingAttachments, // Array of { url, name } for existing files
      answer_key_file: answerKeyFile, // The actual File object for a new/changed answer key
      // The parent component will handle the logic for `attachment_file` (new uploads),
      // existing attachments, and determine `answer_key_url` and `answer_key_filename`
      // based on `answerKeyFile` and `assignmentToEdit` existing values.
      // `attachment_file` in formData now contains only newly selected files.
      // `answerKeyFilename` holds the name of the *original* answer key if `answerKeyFile` is null.
    };

    onSubmit(dataToSubmit);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === "use_ai_grading" && !value) {
      setAnswerKeyFile(null);
      setAnswerKeyFilename("");
      setShowAnswerKeyUpload(false);
    }

    // New logic: if submissions are disabled, disable AI grading and clear related fields
    if (field === "allow_submissions" && !value) {
      setFormData(prev => ({ ...prev, use_ai_grading: false }));
      setAnswerKeyFile(null);
      setAnswerKeyFilename("");
      setShowAnswerKeyUpload(false);
    }
  };

  const handleGenerateInstructions = async () => {
    // Strip HTML tags from description for the API call (simple approach)
    const cleanDescription = formData.description.replace(/<[^>]*>/g, '').trim();

    if (!cleanDescription) {
      alert("Please enter an assignment description first.");
      return;
    }

    setIsGeneratingInstructions(true);
    try {
      const { data, error } = await base44.functions.invoke("generateGradingInstructions", {
        title: formData.title,
        description: cleanDescription,
        subject: formData.subject,
        max_points: formData.max_points
      });

      if (error) throw new Error(error);

      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions ? prev.instructions + "\n\n" + data.instructions : data.instructions
      }));
    } catch (err) {
      console.error("Failed to generate instructions:", err);
      alert("Failed to generate grading instructions. Please try again.");
    } finally {
      setIsGeneratingInstructions(false);
    }
  };

  const removeNewAttachment = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachment_file: prev.attachment_file.filter((_, i) => i !== indexToRemove)
    }));
  };

  const removeExistingAttachment = (indexToRemove) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== indexToRemove));
  };

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
              {assignmentToEdit ? <Edit className="w-6 h-6 mr-3 text-indigo-600" /> : <Plus className="w-6 h-6 mr-3 text-indigo-600" />}
              {assignmentToEdit ? t('assignments.editAssignment') : t('assignments.createNewAssignment')}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                  {t('assignments.assignmentTitle')}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder={t('assignments.assignmentTitlePlaceholder')}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">
                  {t('assignments.subject')}
                </Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange("subject", value)}
                >
                  <SelectTrigger className="border-slate-300 focus:border-indigo-500 rounded-xl">
                    <SelectValue placeholder={t('assignments.selectSubject')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">{t('assignments.mathematics')}</SelectItem>
                    <SelectItem value="english">{t('assignments.english')}</SelectItem>
                    <SelectItem value="science">{t('assignments.science')}</SelectItem>
                    <SelectItem value="history">{t('assignments.history')}</SelectItem>
                    <SelectItem value="art">{t('assignments.art')}</SelectItem>
                    <SelectItem value="other">{t('assignments.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.allow_submissions && ( // Conditionally render Max Points
                <div className="space-y-3">
                  <Label htmlFor="max_points" className="text-sm font-semibold text-slate-700">
                    {t('assignments.maximumPoints')}
                  </Label>
                  <Input
                    id="max_points"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.max_points}
                    onChange={(e) => handleInputChange("max_points", parseInt(e.target.value))}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="due_date" className="text-sm font-semibold text-slate-700">
                  {t('assignments.dueDate')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-slate-300 hover:border-indigo-500 rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      {formData.due_date ? format(formData.due_date, "PPP") : t('assignments.selectDueDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.due_date || undefined}
                      onSelect={(date) => handleInputChange("due_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="open_date" className="text-sm font-semibold text-slate-700">
                  {t('assignments.openDateTime')}
                </Label>
                <div className="relative">
                  <Input
                    id="open_date"
                    type="datetime-local"
                    value={formData.open_date}
                    onChange={(e) => handleInputChange("open_date", e.target.value)}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl pl-10"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">{t('assignments.openDateHelp')}</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="close_date" className="text-sm font-semibold text-slate-700">
                  {t('assignments.closeDateTime')}
                </Label>
                <div className="relative">
                  <Input
                    id="close_date"
                    type="datetime-local"
                    value={formData.close_date}
                    onChange={(e) => handleInputChange("close_date", e.target.value)}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl pl-10"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">{t('assignments.closeDateHelp')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                {t('assignments.description')}
              </Label>
              <ReactQuill
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder={t('assignments.descriptionPlaceholder')}
                className="border-slate-300 focus-within:border-indigo-500 rounded-xl [&_.ql-editor]:min-h-[96px]"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">{t('assignments.assignmentFiles')}</Label>
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                {existingAttachments.map((file, index) => (
                  <div key={`existing-${index}`} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-700 font-medium">{file.name}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExistingAttachment(index)} className="h-6 w-6">
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {formData.attachment_file.map((file, index) => (
                  <div key={`new-${index}`} className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">{file.name}</span>
                      <p className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeNewAttachment(index)} className="h-6 w-6">
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <input
                  type="file"
                  id="assignment-attachment"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.mp4,.mp3,.mov,.m4a,.wav,.txt,.rtf"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    setFormData(prev => ({
                      ...prev,
                      attachment_file: [...(prev.attachment_file || []), ...files]
                    }));
                  }}
                />
                <Button asChild variant="outline" className="w-full">
                  <label htmlFor="assignment-attachment" className="cursor-pointer flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" /> {t('assignments.addMoreFiles')}
                  </label>
                </Button>
              </div>
            </div>

            {formData.allow_submissions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="instructions" className="text-sm font-semibold text-slate-700">
                    {t('assignments.gradingInstructions')} {formData.use_ai_grading && <span className="text-red-500">*</span>}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateInstructions}
                    disabled={isGeneratingInstructions || !formData.description || formData.description === '<p><br></p>'}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs"
                  >
                    {isGeneratingInstructions ? (
                      <>
                        <Brain className="w-3 h-3 mr-1.5 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="w-3 h-3 mr-1.5" />
                        Generate with ACE AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder={formData.use_ai_grading
                    ? t('assignments.gradingInstructionsPlaceholder')
                    : t('assignments.gradingInstructionsManualPlaceholder')
                  }
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl h-32"
                  required={formData.use_ai_grading}
                />
                <p className="text-xs text-slate-500">
                  {formData.use_ai_grading
                    ? t('assignments.gradingInstructionsHelp')
                    : t('assignments.gradingInstructionsManualHelp')
                  }
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="open_date" className="text-sm font-semibold text-slate-700">
                  {t('assignments.openDateTime')}
                </Label>
                <div className="relative">
                  <Input
                    id="open_date"
                    type="datetime-local"
                    value={formData.open_date}
                    onChange={(e) => handleInputChange("open_date", e.target.value)}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl pl-10"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">{t('assignments.openDateHelp')}</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="close_date" className="text-sm font-semibold text-slate-700">
                  {t('assignments.closeDateTime')}
                </Label>
                <div className="relative">
                  <Input
                    id="close_date"
                    type="datetime-local"
                    value={formData.close_date}
                    onChange={(e) => handleInputChange("close_date", e.target.value)}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl pl-10"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">{t('assignments.closeDateHelp')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                {t('assignments.visibleToStudents')}
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => handleInputChange("is_visible", checked)}
                />
                <span className="text-sm text-slate-600">
                  {formData.is_visible ? t('assignments.visible') : t('assignments.hidden')}
                </span>
              </div>
            </div>

            {/* New: Allow Submissions Switch */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                {t('assignments.allowSubmissions')}
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.allow_submissions}
                  onCheckedChange={(checked) => handleInputChange("allow_submissions", checked)}
                />
                <span className="text-sm text-slate-600">
                  {formData.allow_submissions ? t('assignments.allowSubmissionsYes') : t('assignments.allowSubmissionsNo')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t('assignments.allowSubmissionsHelp')}
              </p>
            </div>

            {formData.allow_submissions && ( // Conditionally render AI Grading section
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{t('assignments.aiGradingTitle')}</h4>
                        <p className="text-sm text-slate-600">{t('assignments.aiGradingDescription')}</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.use_ai_grading}
                      onCheckedChange={(checked) => handleInputChange("use_ai_grading", checked)}
                    />
                  </div>
                  <AnimatePresence>
                    {formData.use_ai_grading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-700">
                            {t('assignments.aiGradingEnabled')}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAnswerKeyUpload(!showAnswerKeyUpload)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {answerKeyFile ? t('assignments.changeAnswerKey') : (answerKeyFilename ? t('assignments.changeAnswerKey') : t('assignments.uploadAnswerKey'))}
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="leniency" className="text-sm font-semibold text-slate-700">
                            {t('assignments.aiLeniency')}
                          </Label>
                          <Select
                            value={formData.leniency}
                            onValueChange={(value) => handleInputChange("leniency", value)}
                          >
                            <SelectTrigger className="border-slate-300 focus:border-indigo-500 rounded-xl bg-white">
                              <SelectValue placeholder={t('assignments.selectLeniency')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Strict">{t('assignments.strict')}</SelectItem>
                              <SelectItem value="Neutral">{t('assignments.neutral')}</SelectItem>
                              <SelectItem value="Lenient">{t('assignments.lenient')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-500">
                            {t('assignments.leniencyHelp')}
                          </p>
                        </div>
                        {showAnswerKeyUpload && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              {t('assignments.answerKeyOptional')}
                            </Label>
                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.rtf"
                                onChange={(e) => setAnswerKeyFile(e.target.files[0])}
                                className="hidden"
                                id="answer-key-upload"
                              />
                              <label
                                htmlFor="answer-key-upload"
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="text-sm">{t('assignments.chooseFile')}</span>
                              </label>
                              {(answerKeyFile || answerKeyFilename) && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-green-600 font-medium">
                                    {answerKeyFile ? answerKeyFile.name : answerKeyFilename}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setAnswerKeyFile(null); setAnswerKeyFilename(""); }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              {t('assignments.answerKeyHelp')}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!formData.use_ai_grading && (
                    <p className="text-sm text-slate-600 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {t('assignments.manualGradingNote')}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-8 py-3 rounded-xl border-slate-300 hover:bg-slate-50"
              >
                {t('assignments.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting} // Removed `uploadingAnswerKey` as its handling is now external
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (assignmentToEdit ? t('assignments.updating') : t('assignments.creating')) :
                 (assignmentToEdit ? t('assignments.updateAssignment') : t('assignments.createAssignmentBtn'))}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}