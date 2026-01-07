import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Save,
    X,
    Plus,
    Bot,
    Calendar as CalendarIcon,
    Clock,
    Target,
    Lightbulb,
    BookOpen,
    Home,
    Users,
    Trash2,
    GripVertical,
    Info,
    Eye,
    EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { useTranslation } from '../i18n/useTranslation';

export default function LessonPlanEditor({ lesson, onSave, onCancel, onGenerateAI, currentClass }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        lesson_date: new Date(),
        objectives: [''],
        hook: '',
        activities: [{ title: '', description: '', duration: 30, materials: [''] }],
        homework: [''],
        resources: [{ title: '', url: '', type: 'website', file_url: '', file_name: '', file_mime_type: '' }],
        assessment: { type: '', description: '', rubric: '' },
        differentiation: [''],
        additional_information: '',
        is_released: false
    });

    const [aiPrompt, setAiPrompt] = useState('');
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false); // Renamed from showTextImport
    const [importText, setImportText] = useState(''); // Renamed from textImportContent
    const [isImportingStructured, setIsImportingStructured] = useState(false);
    const [isImportingAsIs, setIsImportingAsIs] = useState(false);
    const [uploadingResourceIndex, setUploadingResourceIndex] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title || '',
                lesson_date: lesson.lesson_date ? new Date(lesson.lesson_date) : new Date(),
                objectives: lesson.objectives || [''],
                hook: lesson.hook || '',
                activities: lesson.activities || [{ title: '', description: '', duration: 30, materials: [''] }],
                homework: lesson.homework || [''],
                resources: lesson.resources ? lesson.resources.map(res => ({
                    title: res.title || '',
                    url: res.url || '',
                    type: res.type || 'website',
                    file_url: res.file_url || '',
                    file_name: res.file_name || '',
                    file_mime_type: res.file_mime_type || ''
                })) : [{ title: '', url: '', type: 'website', file_url: '', file_name: '', file_mime_type: '' }],
                assessment: lesson.assessment || { type: '', description: '', rubric: '' },
                differentiation: lesson.differentiation || [''],
                additional_information: lesson.additional_information || '',
                is_released: lesson.is_released || false
            });
        }
    }, [lesson]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (field, defaultValue) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleActivityChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.map((activity, i) =>
                i === index ? { ...activity, [field]: value } : activity
            )
        }));
    };

    const handleMaterialChange = (activityIndex, materialIndex, value) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.map((activity, i) =>
                i === activityIndex
                ? {
                    ...activity,
                    materials: activity.materials.map((material, j) =>
                        j === materialIndex ? value : material
                    )
                  }
                : activity
            )
        }));
    };

    const addMaterial = (activityIndex) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.map((activity, i) =>
                i === activityIndex
                ? { ...activity, materials: [...activity.materials, ''] }
                : activity
            )
        }));
    };

    const removeMaterial = (activityIndex, materialIndex) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.map((activity, i) =>
                i === activityIndex
                ? {
                    ...activity,
                    materials: activity.materials.filter((_, j) => j !== materialIndex)
                  }
                : activity
            )
        }));
    };

    const handleResourceChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.map((resource, i) =>
                i === index ? { ...resource, [field]: value } : resource
            )
        }));
    };

    const handleResourceFileChange = async (index, file) => {
        if (!file) return;

        setUploadingResourceIndex(index);
        try {
            const { file_url, file_name } = await UploadFile({ file });
            
            // Get the correct MIME type from the file
            const mimeType = file.type || 'application/octet-stream';
            
            // Determine the appropriate type based on MIME type
            let resourceType = 'file';
            if (mimeType.startsWith('image/')) {
                resourceType = 'image';
            } else if (mimeType.startsWith('video/')) {
                resourceType = 'video';
            } else if (mimeType.includes('pdf')) {
                resourceType = 'document';
            } else if (mimeType.includes('word') || mimeType.includes('document')) {
                resourceType = 'document';
            }

            const updatedResource = {
                ...formData.resources[index],
                file_url,
                file_name: file_name || file.name,
                file_mime_type: mimeType,
                url: '', // Clear URL when file is uploaded
                type: resourceType,
                title: formData.resources[index].title || file_name || file.name
            };
            
            setFormData(prev => ({
                ...prev,
                resources: prev.resources.map((resource, i) =>
                    i === index ? updatedResource : resource
                )
            }));
        } catch (error) {
            console.error('Error uploading resource file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploadingResourceIndex(null);
        }
    };

    const removeResourceFile = (index) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.map((resource, i) =>
                i === index ? {
                    ...resource,
                    file_url: '',
                    file_name: '',
                    file_mime_type: '',
                    type: 'website' // Reset to default type
                } : resource
            )
        }));
    };

    const handleAssessmentChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            assessment: { ...prev.assessment, [field]: value }
        }));
    };

    const generateAILesson = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        try {
            const aiData = await onGenerateAI(aiPrompt);

            setFormData(prev => ({
                ...prev,
                title: aiData.title || prev.title,
                objectives: aiData.objectives || prev.objectives,
                hook: aiData.hook || prev.hook,
                activities: aiData.activities || prev.activities,
                homework: aiData.homework || prev.homework,
                resources: aiData.resources ? aiData.resources.map(res => ({
                    ...res,
                    file_url: '',
                    file_name: '',
                    file_mime_type: ''
                })) : prev.resources,
                assessment: aiData.assessment || prev.assessment,
                differentiation: aiData.differentiation || prev.differentiation,
                additional_information: aiData.additional_information || prev.additional_information
            }));

            setShowAIGenerator(false);
            setAiPrompt('');
        } catch (error) {
            console.error('Error generating AI lesson:', error);
            alert('Failed to generate lesson. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImportFromText = async () => {
        if (!importText.trim()) {
            alert('Please enter some text to import');
            return;
        }

        setIsImportingStructured(true);
        try {
            const prompt = `Parse this lesson plan text and extract information into these sections. Format as JSON:
{
    "title": "lesson title",
    "objectives": ["objective 1", "objective 2"],
    "hook": "opening activity",
    "activities": [{"title": "activity name", "description": "what students do", "duration": 15, "materials": ["item1", "item2"]}],
    "homework": ["homework item 1", "homework item 2"],
    "resources": [{"title": "resource name", "url": "http://...", "type": "website"}],
    "assessment": {"assessment_type": "formative", "description": "how to assess", "rubric": "rubric details"},
    "differentiation": ["strategy 1", "strategy 2"],
    "additional_information": "any extra notes"
}

Additional information should include:
- Contact information and office hours
- Special instructions for students or parents  
- Parent communication notes (e.g., "Parent conference requests", "Progress reports available")
- Additional resources or support information
- Classroom expectations or reminders
- Biblical Integration Goals
If there are Unit Learning Outcomes or Unit Standards, put them into the learning objectives, or anything else that looks like it is a goal.


If some sections are missing, leave them as empty strings or arrays. Here is the text: 

${importText}`;

            const result = await InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        objectives: { type: "array", items: { type: "string" } },
                        hook: { type: "string" },
                        activities: { 
                            type: "array", 
                            items: { 
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    duration: { type: "number" },
                                    materials: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        homework: { type: "array", items: { type: "string" } },
                        resources: { 
                            type: "array", 
                            items: { 
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    url: { type: "string" },
                                    type: { type: "string" }
                                }
                            }
                        },
                        assessment: { 
                            type: "object",
                            properties: {
                                assessment_type: { type: "string" }, // Changed 'type' to 'assessment_type'
                                description: { type: "string" },
                                rubric: { type: "string" }
                            }
                        },
                        differentiation: { type: "array", items: { type: "string" } },
                        additional_information: { type: "string" }
                    }
                }
            });

            // Update form data with imported content
            setFormData(prev => ({
                ...prev,
                title: result.title || prev.title,
                objectives: result.objectives || [],
                hook: result.hook || '',
                activities: result.activities || [],
                homework: result.homework || [],
                resources: result.resources || [],
                assessment: {
                    type: result.assessment?.assessment_type || '', // Changed 'result.assessment?.type' to 'result.assessment?.assessment_type'
                    description: result.assessment?.description || '',
                    rubric: result.assessment?.rubric || ''
                },
                differentiation: result.differentiation || [],
                additional_information: result.additional_information || ''
            }));

            setShowImportModal(false);
            setImportText('');
        } catch (error) {
            console.error('Error importing lesson:', error);
            alert('Failed to import lesson. Please try again.');
        } finally {
            setIsImportingStructured(false);
        }
    };

    const handleUseAsIs = async () => {
        if (!importText.trim()) {
            alert('Please enter some text to use');
            return;
        }

        setIsImportingAsIs(true);
        try {
            const prompt = `Please format this lesson plan text to look professional and readable. Make it look better with proper line breaks, spacing, and formatting, but don't remove any content or restructure it into sections. Just improve the readability and presentation while keeping everything exactly as the teacher wrote it. Do not say here is your lesson plan or let me know if you need anything else or anything like that, just give the lesson plan. Here is the text:

${importText}`;

            const result = await InvokeLLM({
                prompt: prompt
            });

            // Create a simple lesson plan with just the formatted text in additional_information
            setFormData(prev => ({
                ...prev,
                title: prev.title || "Imported Lesson Plan",
                objectives: [],
                hook: '',
                activities: [],
                homework: [],
                resources: [],
                assessment: { type: '', description: '', rubric: '' },
                differentiation: [],
                additional_information: result || importText
            }));

            setShowImportModal(false);
            setImportText('');
            setShowSuccessDialog(true);

        } catch (error) {
            console.error('Error formatting lesson:', error);
            // If AI fails, just use the raw text
            setFormData(prev => ({
                ...prev,
                title: prev.title || "Imported Lesson Plan",
                objectives: [],
                hook: '',
                activities: [],
                homework: [],
                resources: [],
                assessment: { type: '', description: '', rubric: '' },
                differentiation: [],
                additional_information: importText
            }));

            setShowImportModal(false);
            setImportText('');
            setShowSuccessDialog(true);
        } finally {
            setIsImportingAsIs(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Please enter a lesson title.');
            return;
        }

        // Check for uploaded files without titles
        const resourcesWithFiles = formData.resources.filter(resource => resource.file_url && !resource.title.trim());
        if (resourcesWithFiles.length > 0) {
            alert('Please provide names for all uploaded files before saving.');
            return;
        }

        setIsSaving(true);
        try {
            // Explicitly preserve ALL non-array fields
            const cleanedData = {
                title: formData.title,
                lesson_date: formData.lesson_date,
                hook: formData.hook,
                assessment: formData.assessment,
                additional_information: formData.additional_information,
                is_released: formData.is_released,
                // Filter array fields to remove empty entries
                objectives: formData.objectives.filter(obj => obj && obj.trim()),
                homework: formData.homework.filter(hw => hw && hw.trim()),
                differentiation: formData.differentiation.filter(diff => diff && diff.trim()),
                activities: formData.activities.filter(act => act && act.title && act.title.trim()),
                resources: formData.resources.filter(res => 
                    (res.title && res.title.trim()) || 
                    (res.file_url && res.file_url.trim()) || 
                    (res.url && res.url.trim())
                )
            };

            await onSave(cleanedData);
            // Go back to calendar view after successful save
            onCancel();
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Failed to save lesson plan. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'activities') {
            const newActivities = Array.from(formData.activities);
            const [reorderedItem] = newActivities.splice(source.index, 1);
            newActivities.splice(destination.index, 0, reorderedItem);

            setFormData(prev => ({ ...prev, activities: newActivities }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {lesson ? t('lessonPlans.editLessonPlan') : t('lessonPlans.createNewLessonPlan')}
                    </h2>
                    <p className="text-slate-600 mt-1">{t('lessonPlans.class')}: {currentClass.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowImportModal(true)}
                    >
                        {t('lessonPlans.importFromText')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowAIGenerator(!showAIGenerator)}
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                        <Bot className="w-4 h-4 mr-2" />
                        {t('lessonPlans.aiAssistant')}
                    </Button>
                    <Button variant="outline" onClick={onCancel}>
                        <X className="w-4 h-4 mr-2" />
                        {t('lessonPlans.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? t('lessonPlans.saving') : t('lessonPlans.saveLesson')}
                    </Button>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('lessonPlans.importSuccessful')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('lessonPlans.lessonImported')}</p>
                    <DialogFooter>
                        <Button onClick={() => setShowSuccessDialog(false)}>
                            {t('lessonPlans.gotIt')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Generator */}
            <AnimatePresence>
                {showAIGenerator && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8"
                    >
                        <Card className="border-indigo-200 bg-indigo-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-800">
                                    <Bot className="w-5 h-5" />
                                    {t('lessonPlans.aiLessonGenerator')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder={t('lessonPlans.aiPlaceholder')}
                                    className="h-20 resize-none"
                                />
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        {t('lessonPlans.aiNote')}
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAIGenerator(false)}
                                    >
                                        {t('lessonPlans.cancel')}
                                    </Button>
                                    <Button
                                        onClick={generateAILesson}
                                        disabled={isGenerating || !aiPrompt.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                {t('lessonPlans.generating')}
                                            </>
                                        ) : (
                                            <>
                                                <Bot className="w-4 h-4 mr-2" />
                                                {t('lessonPlans.generateLesson')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text Import Dialog */}
             <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('lessonPlans.importLessonFromText')}</DialogTitle>
                        <p className="text-sm text-slate-600">
                            {t('lessonPlans.importDesc')}
                        </p>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder={t('lessonPlans.pasteHere')}
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            className="min-h-64 text-sm"
                        />
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowImportModal(false)}
                            >
                                {t('lessonPlans.cancel')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleUseAsIs}
                                disabled={isImportingAsIs || !importText.trim()}
                            >
                                {isImportingAsIs ? t('lessonPlans.processing') : t('lessonPlans.useLessonAsIs')}
                            </Button>
                            <div className="flex flex-col items-end gap-2">
                                <Button
                                    onClick={handleImportFromText}
                                    disabled={isImportingStructured || !importText.trim()}
                                >
                                    {isImportingStructured ? t('lessonPlans.processing') : t('lessonPlans.importStructure')}
                                </Button>
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                    {t('lessonPlans.beta')}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Main Form */}
            <div className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            {t('lessonPlans.basicInformation')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('lessonPlans.lessonTitle')}</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder={t('lessonPlans.enterLessonTitle')}
                                    className="text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('lessonPlans.lessonDate')}</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(formData.lesson_date, 'PPP')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.lesson_date}
                                            onSelect={(date) => handleInputChange('lesson_date', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        
                        {/* Release Status Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                {formData.is_released ? (
                                    <Eye className="w-5 h-5 text-green-600" />
                                ) : (
                                    <EyeOff className="w-5 h-5 text-red-600" />
                                )}
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {formData.is_released ? t('lessonPlans.lessonIsReleased') : t('lessonPlans.lessonIsUnreleased')}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        {formData.is_released 
                                            ? t('lessonPlans.studentsCanView')
                                            : t('lessonPlans.studentsCannotView')}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.is_released}
                                onCheckedChange={(checked) => handleInputChange('is_released', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Learning Objectives */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" />
                            {t('lessonPlans.learningObjectives')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.objectives.map((objective, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={objective}
                                    onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                                    placeholder={`${t('lessonPlans.learningObjective')} ${index + 1}...`}
                                    className="flex-1"
                                />
                                {formData.objectives.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeArrayItem('objectives', index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => addArrayItem('objectives', '')}
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('lessonPlans.addObjective')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Hook/Opening */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-600" />
                            {t('lessonPlans.hookOpeningActivity')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.hook}
                            onChange={(e) => handleInputChange('hook', e.target.value)}
                            placeholder={t('lessonPlans.hookPlaceholder')}
                            className="h-24 resize-none"
                        />
                    </CardContent>
                </Card>

                {/* Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            {t('lessonPlans.classroomActivities')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="activities" type="activities">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                        {formData.activities.map((activity, index) => (
                                            <Draggable key={index} draggableId={`activity-${index}`} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="mt-2 text-slate-400 hover:text-slate-600 cursor-grab"
                                                            >
                                                                <GripVertical className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 space-y-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <Input
                                                                        value={activity.title}
                                                                        onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                                                                        placeholder={t('lessonPlans.activityTitle')}
                                                                        className="font-medium"
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-4 h-4 text-slate-500" />
                                                                        <Input
                                                                            type="number"
                                                                            value={activity.duration}
                                                                            onChange={(e) => handleActivityChange(index, 'duration', parseInt(e.target.value, 10))}
                                                                            placeholder={t('lessonPlans.duration')}
                                                                            className="w-32"
                                                                        />
                                                                        <span className="text-sm text-slate-500">{t('lessonPlans.minutes')}</span>
                                                                    </div>
                                                                </div>
                                                                <Textarea
                                                                    value={activity.description}
                                                                    onChange={(e) => handleActivityChange(index, 'description', e.target.value)}
                                                                    placeholder={t('lessonPlans.describeActivity')}
                                                                    className="h-20 resize-none"
                                                                />
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-slate-700">{t('lessonPlans.materialsNeeded')}</label>
                                                                    {activity.materials.map((material, materialIndex) => (
                                                                        <div key={materialIndex} className="flex gap-2">
                                                                            <Input
                                                                                value={material}
                                                                                onChange={(e) => handleMaterialChange(index, materialIndex, e.target.value)}
                                                                                placeholder={t('lessonPlans.material')}
                                                                                className="flex-1"
                                                                            />
                                                                            {activity.materials.length > 1 && (
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    onClick={() => removeMaterial(index, materialIndex)}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addMaterial(index)}
                                                                    >
                                                                        <Plus className="w-3 h-3 mr-1" />
                                                                        {t('lessonPlans.addMaterial')}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => removeArrayItem('activities', index)}
                                                                className="text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <Button
                            variant="outline"
                            onClick={() => addArrayItem('activities', { title: '', description: '', duration: 30, materials: [''] })}
                            className="w-full mt-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('lessonPlans.addActivity')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Homework */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-purple-600" />
                            {t('lessonPlans.homework')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.homework.map((hw, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={hw}
                                    onChange={(e) => handleArrayChange('homework', index, e.target.value)}
                                    placeholder={`${t('lessonPlans.homeworkAssignment')} ${index + 1}...`}
                                    className="flex-1"
                                />
                                {formData.homework.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeArrayItem('homework', index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => addArrayItem('homework', '')}
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('lessonPlans.addHomework')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Resources & Assessment combined for space */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Resources */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('lessonPlans.resources')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.resources.map((resource, index) => (
                                <div key={index} className="space-y-3 border border-slate-200 rounded p-3">
                                    <Input
                                        value={resource.title}
                                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                                        placeholder={t('lessonPlans.resourceTitle')}
                                    />
                                    
                                    {!resource.file_url && (
                                        <Input
                                            value={resource.url}
                                            onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                                            placeholder={t('lessonPlans.urlPlaceholder')}
                                        />
                                    )}

                                    {!resource.file_url && <div className="text-center text-sm text-slate-500">{t('lessonPlans.or')}</div>}
                                    
                                    {resource.file_url ? (
                                        <div className="bg-green-50 border border-green-200 rounded p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-green-800">{t('lessonPlans.fileUploaded')}</p>
                                                    <p className="text-sm text-green-700">{resource.file_name}</p>
                                                    {resource.file_mime_type && (
                                                        <p className="text-xs text-green-600">{t('lessonPlans.type')}: {resource.file_mime_type}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeResourceFile(index)}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                id={`resource-file-${index}`}
                                                className="hidden"
                                                onChange={(e) => handleResourceFileChange(index, e.target.files[0])}
                                            />
                                            <Button asChild variant="outline" className="w-full">
                                                <label htmlFor={`resource-file-${index}`} className="cursor-pointer">
                                                    {uploadingResourceIndex === index ? (
                                                        <>
                                                            <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full mr-2"></div>
                                                            {t('lessonPlans.uploading')}
                                                        </>
                                                    ) : (
                                                        t('lessonPlans.uploadFile')
                                                    )}
                                                </label>
                                            </Button>
                                        </>
                                    )}

                                    <div className="flex justify-between items-center pt-2">
                                        <Select
                                            value={resource.type}
                                            onValueChange={(value) => handleResourceChange(index, 'type', value)}
                                            disabled={!!resource.file_url}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder={t('lessonPlans.type')}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="website">{t('lessonPlans.website')}</SelectItem>
                                                <SelectItem value="video">{t('lessonPlans.video')}</SelectItem>
                                                <SelectItem value="document">{t('lessonPlans.document')}</SelectItem>
                                                <SelectItem value="book">{t('lessonPlans.book')}</SelectItem>
                                                <SelectItem value="file">{t('lessonPlans.file')}</SelectItem>
                                                <SelectItem value="image">{t('lessonPlans.image')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formData.resources.length > 1 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeArrayItem('resources', index)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => addArrayItem('resources', { title: '', url: '', type: 'website', file_url: '', file_name: '', file_mime_type: '' })}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t('lessonPlans.addResource')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Assessment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('lessonPlans.assessment')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select
                                value={formData.assessment.type}
                                onValueChange={(value) => handleAssessmentChange('type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('lessonPlans.assessmentType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="formative">{t('lessonPlans.formative')}</SelectItem>
                                    <SelectItem value="summative">{t('lessonPlans.summative')}</SelectItem>
                                    <SelectItem value="peer">{t('lessonPlans.peerAssessment')}</SelectItem>
                                    <SelectItem value="self">{t('lessonPlans.selfAssessment')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Textarea
                                value={formData.assessment.description}
                                onChange={(e) => handleAssessmentChange('description', e.target.value)}
                                placeholder={t('lessonPlans.describeAssessment')}
                                className="h-20 resize-none"
                            />
                            <Textarea
                                value={formData.assessment.rubric}
                                onChange={(e) => handleAssessmentChange('rubric', e.target.value)}
                                placeholder={t('lessonPlans.rubric')}
                                className="h-20 resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>
                
                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-teal-600" />
                            {t('lessonPlans.preMadeLessonPlan')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.additional_information}
                            onChange={(e) => handleInputChange('additional_information', e.target.value)}
                            placeholder={t('lessonPlans.additionalInfoPlaceholder')}
                            className="h-24 resize-none"
                        />
                        <div className="mt-3 text-xs text-slate-500">
                        </div>
                    </CardContent>
                </Card>

                {/* Differentiation */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('lessonPlans.differentiationStrategies')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.differentiation.map((strategy, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={strategy}
                                    onChange={(e) => handleArrayChange('differentiation', index, e.target.value)}
                                    placeholder={`${t('lessonPlans.differentiationStrategy')} ${index + 1}...`}
                                    className="flex-1"
                                />
                                {formData.differentiation.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeArrayItem('differentiation', index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => addArrayItem('differentiation', '')}
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('lessonPlans.addStrategy')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}