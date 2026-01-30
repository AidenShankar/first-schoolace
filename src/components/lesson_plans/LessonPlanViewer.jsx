import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Edit, 
    Calendar, 
    Clock, 
    Target,
    Lightbulb,
    Users,
    Home,
    BookOpen,
    CheckSquare,
    Layers,
    Trash2,
    Copy,
    Download,
    ExternalLink,
    FileText,
    File,
    Image,
    Video,
    Music,
    Info,
    Eye,
    EyeOff
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from '../i18n/useTranslation';

export default function LessonPlanViewer({ 
    lesson, 
    onEdit, 
    onBack, 
    currentUser, 
    onUpdate, 
    onDelete, 
    onDuplicate, 
    onToggleRelease, 
    allClasses 
}) {
    const { t } = useTranslation();
    const isTeacher = currentUser?.app_role === 'teacher';
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [destinationClassId, setDestinationClassId] = useState('');
    const [isDuplicating, setIsDuplicating] = useState(false);

    const handleDelete = () => {
        onDelete(lesson.id);
    };

    const handleDuplicate = async () => {
        if (!destinationClassId) return;
        setIsDuplicating(true);
        try {
            await onDuplicate(lesson, destinationClassId);
            setShowDuplicateDialog(false);
        } catch (error) {
            console.error("Error duplicating lesson:", error);
            alert("Failed to duplicate lesson.");
        } finally {
            setIsDuplicating(false);
        }
    };

    const handleToggleRelease = () => {
        onToggleRelease(lesson.id, lesson.is_released);
    };

    // Helper function to ensure URL has proper protocol
    const formatUrl = (url) => {
        if (!url) return '';
        // If URL doesn't start with http:// or https://, add https://
        if (!/^https?:\/\//i.test(url)) {
            return `https://${url}`;
        }
        return url;
    };

    const getFileIcon = (fileName, resourceType, mimeType) => {
        // First check if we have a MIME type for more accurate detection
        if (mimeType) {
            if (mimeType.startsWith('image/')) {
                return <Image className="w-4 h-4 text-green-600" />;
            } else if (mimeType.startsWith('video/')) {
                return <Video className="w-4 h-4 text-purple-600" />;
            } else if (mimeType.startsWith('audio/')) {
                return <Music className="w-4 h-4 text-orange-600" />;
            } else if (mimeType.includes('pdf')) {
                return <FileText className="w-4 h-4 text-red-600" />;
            } else if (mimeType.includes('word') || mimeType.includes('document')) {
                return <FileText className="w-4 h-4 text-blue-600" />;
            } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
                return <FileText className="w-4 h-4 text-green-700" />;
            } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
                return <FileText className="w-4 h-4 text-orange-700" />;
            }
        }
        
        // Fallback to file extension detection
        if (resourceType === 'file' && fileName) {
            const extension = fileName.split('.').pop()?.toLowerCase();
            switch (extension) {
                case 'pdf':
                    return <FileText className="w-4 h-4 text-red-600" />;
                case 'doc':
                case 'docx':
                    return <FileText className="w-4 h-4 text-blue-600" />;
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'webp':
                    return <Image className="w-4 h-4 text-green-600" />;
                case 'mp4':
                case 'avi':
                case 'mov':
                case 'wmv':
                case 'webm':
                    return <Video className="w-4 h-4 text-purple-600" />;
                case 'mp3':
                case 'wav':
                case 'flac':
                case 'aac':
                    return <Music className="w-4 h-4 text-orange-600" />;
                case 'xls':
                case 'xlsx':
                    return <FileText className="w-4 h-4 text-green-700" />;
                case 'ppt':
                case 'pptx':
                    return <FileText className="w-4 h-4 text-orange-700" />;
                default:
                    return <File className="w-4 h-4 text-slate-600" />;
            }
        }
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
    };

    const handleDownload = async (fileUrl, fileName, mimeType) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            
            // Create a new blob with the correct MIME type if we have it
            const downloadBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;
            
            const url = window.URL.createObjectURL(downloadBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Ensure the filename has the correct extension based on MIME type if needed
            let downloadFileName = fileName;
            if (mimeType && !fileName.includes('.')) {
                const extension = getFileExtensionFromMimeType(mimeType);
                if (extension) {
                    downloadFileName = `${fileName}.${extension}`;
                }
            }
            
            a.download = downloadFileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file');
        }
    };

    const getFileExtensionFromMimeType = (mimeType) => {
        const mimeToExtension = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'audio/mp3': 'mp3',
            'audio/mpeg': 'mp3',
            'audio/wav': 'wav',
            'text/plain': 'txt'
        };
        return mimeToExtension[mimeType] || null;
    };

    const getResourceTypeColor = (type) => {
        switch (type) {
            case 'website':
                return 'bg-blue-100 text-blue-800';
            case 'video':
                return 'bg-purple-100 text-purple-800';
            case 'document':
                return 'bg-green-100 text-green-800';
            case 'book':
                return 'bg-yellow-100 text-yellow-800';
            case 'file':
                return 'bg-slate-100 text-slate-800';
            case 'image':
                return 'bg-pink-100 text-pink-800';
            case 'simulation':
                return 'bg-orange-100 text-orange-800';
            case 'article':
                return 'bg-emerald-100 text-emerald-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };
    
    const destinationClasses = allClasses?.filter(c => c.id !== lesson.class_id) || [];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('lessonPlans.back')}
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{lesson.title}</h1>
                            {isTeacher && (
                                <Badge 
                                    className={`text-sm px-3 py-1 ${
                                        lesson.is_released 
                                            ? 'bg-green-100 text-green-800 border-green-200' 
                                            : 'bg-red-100 text-red-800 border-red-200'
                                    }`}
                                    variant="outline"
                                >
                                    {lesson.is_released ? (
                                        <>
                                            <Eye className="w-3 h-3 mr-1" />
                                            {t('lessonPlans.released')}
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-3 h-3 mr-1" />
                                            {t('lessonPlans.unreleased')}
                                        </>
                                    )}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                <Calendar className="w-4 h-4" />
                                <span>{format(parseISO(lesson.lesson_date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {isTeacher && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleToggleRelease}
                            variant="outline"
                            className={`${
                                lesson.is_released
                                    ? 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
                                    : 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200'
                            }`}
                        >
                            {lesson.is_released ? (
                                <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    {t('lessonPlans.unrelease')}
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    {t('lessonPlans.release')}
                                </>
                            )}
                        </Button>
                        <Button onClick={() => setShowDuplicateDialog(true)} variant="outline">
                            <Copy className="w-4 h-4 mr-2" />
                            {t('lessonPlans.duplicate')}
                        </Button>
                        <Button onClick={() => onEdit(lesson)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('lessonPlans.edit')}
                        </Button>
                        <Button variant="destructive" size="icon" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-8">
                {/* Learning Objectives */}
                {lesson.objectives && lesson.objectives.length > 0 && (
                    <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                <Target className="w-5 h-5 text-green-600" />
                                {t('lessonPlans.learningObjectives')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="font-medium mb-3" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('lessonPlans.studentsWillBeAbleTo')}</p>
                                <ul className="space-y-2">
                                    {lesson.objectives.map((objective, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span style={{ color: `rgb(var(--color-text))` }}>{objective}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Hook/Opening */}
                {lesson.hook && (
                    <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                {t('lessonPlans.hookOpeningActivity')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: `rgb(var(--color-text))` }}>
                                {lesson.hook}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Classroom Activities */}
                {lesson.activities && lesson.activities.length > 0 && (
                    <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                <Users className="w-5 h-5 text-blue-600" />
                                {t('lessonPlans.classroomActivities')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {lesson.activities.map((activity, index) => (
                                    <div key={index} className="border rounded-lg p-6" style={{ backgroundColor: `rgba(var(--color-text), 0.02)`, borderColor: `rgb(var(--color-border))` }}>
                                        <div className="flex items-start justify-between mb-4">
                                            <h4 className="text-lg font-semibold" style={{ color: `rgb(var(--color-text))` }}>
                                                {index + 1}. {activity.title}
                                            </h4>
                                            {activity.duration && (
                                                <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: `rgb(var(--color-surface))`, color: `rgb(var(--color-textSecondary))` }}>
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        {activity.duration} {t('lessonPlans.min')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {activity.description && (
                                            <p className="mb-4 whitespace-pre-wrap leading-relaxed" style={{ color: `rgb(var(--color-text))` }}>
                                                {activity.description}
                                            </p>
                                        )}
                                        {activity.materials && activity.materials.length > 0 && activity.materials.some(m => m.trim()) && (
                                            <div>
                                                <h5 className="text-sm font-semibold mb-2" style={{ color: `rgb(var(--color-text))` }}>{t('lessonPlans.materialsNeeded')}:</h5>
                                                <ul className="list-disc list-inside space-y-1" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                                    {activity.materials.filter(m => m.trim()).map((material, materialIndex) => (
                                                        <li key={materialIndex}>{material}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Homework */}
                {lesson.homework && lesson.homework.length > 0 && lesson.homework.some(hw => hw.trim()) && (
                    <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                <Home className="w-5 h-5 text-purple-600" />
                                {t('lessonPlans.homework')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {lesson.homework.filter(hw => hw.trim()).map((hw, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <span style={{ color: `rgb(var(--color-text))` }}>{hw}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Resources */}
                    {lesson.resources && lesson.resources.length > 0 && lesson.resources.some(r => r.title?.trim() || r.file_url?.trim()) && (
                        <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                    {t('lessonPlans.resources')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {lesson.resources.filter(r => r.title?.trim() || r.file_url?.trim()).map((resource, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg border" style={{ backgroundColor: `rgba(var(--color-text), 0.02)`, borderColor: `rgb(var(--color-border))` }}>
                                            <div className="flex-shrink-0">
                                                {getFileIcon(resource.file_name, resource.type, resource.file_mime_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <p className="font-medium leading-tight" style={{ color: `rgb(var(--color-text))` }}>
                                                        {resource.title || resource.file_name || 'Untitled Resource'}
                                                    </p>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-xs whitespace-nowrap ${getResourceTypeColor(resource.type)}`}
                                                    >
                                                        {resource.type}
                                                    </Badge>
                                                </div>
                                                
                                                {/* File resource with download button */}
                                                {resource.file_url && (
                                                    <div className="space-y-2">
                                                        {resource.file_name && (
                                                            <div className="flex items-center gap-2 text-sm" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                                                <File className="w-3 h-3" />
                                                                <span className="truncate">{resource.file_name}</span>
                                                            </div>
                                                        )}
                                                        {resource.file_mime_type && (
                                                            <div className="flex items-center gap-2 text-xs" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                                                <span>Type: {resource.file_mime_type}</span>
                                                            </div>
                                                        )}
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleDownload(resource.file_url, resource.file_name || resource.title || 'download', resource.file_mime_type)}
                                                            className="text-xs h-7"
                                                        >
                                                            <Download className="w-3 h-3 mr-1" />
                                                            {t('lessonPlans.download')}
                                                        </Button>
                                                    </div>
                                                )}
                                                
                                                {/* URL resource with proper external link handling */}
                                                {resource.url && !resource.file_url && (
                                                    <div className="space-y-2">
                                                        <a 
                                                            href={formatUrl(resource.url)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-sm text-blue-600 break-all hover:underline line-clamp-2"
                                                        >
                                                            {resource.url}
                                                        </a>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => window.open(formatUrl(resource.url), '_blank', 'noopener,noreferrer')}
                                                            className="text-xs h-7"
                                                        >
                                                            <ExternalLink className="w-3 h-3 mr-1" />
                                                            {t('lessonPlans.visit')}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Assessment */}
                    {lesson.assessment && (lesson.assessment.type || lesson.assessment.description) && (
                        <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                                    {t('lessonPlans.assessment')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {lesson.assessment.type && (
                                    <div>
                                        <span className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>{t('lessonPlans.type')}: </span>
                                        <Badge variant="outline">
                                            {lesson.assessment.type.charAt(0).toUpperCase() + lesson.assessment.type.slice(1)}
                                        </Badge>
                                    </div>
                                )}
                                {lesson.assessment.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2" style={{ color: `rgb(var(--color-text))` }}>{t('lessonPlans.descriptionLabel')}</h4>
                                        <p className="whitespace-pre-wrap" style={{ color: `rgb(var(--color-text))` }}>
                                            {lesson.assessment.description}
                                        </p>
                                    </div>
                                )}
                                {lesson.assessment.rubric && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2" style={{ color: `rgb(var(--color-text))` }}>{t('lessonPlans.rubricLabel')}</h4>
                                        <p className="whitespace-pre-wrap" style={{ color: `rgb(var(--color-text))` }}>
                                            {lesson.assessment.rubric}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Differentiation */}
                {lesson.differentiation && lesson.differentiation.length > 0 && lesson.differentiation.some(d => d.trim()) && (
                    <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                <Layers className="w-5 h-5 text-orange-600" />
                                {t('lessonPlans.differentiationStrategies')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {lesson.differentiation.filter(d => d.trim()).map((strategy, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-5 h-5 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <span style={{ color: `rgb(var(--color-text))` }}>{strategy}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Information */}
                {lesson.additional_information && lesson.additional_information.trim() && (
                    <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2" style={{ color: `rgb(var(--color-text))` }}>
                                <Info className="w-5 h-5 text-teal-600" />
                                {t('lessonPlans.preMadeLessonPlan')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: `rgb(var(--color-text))` }}>
                                {lesson.additional_information}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Reflection Notes (for teachers only) */}
                {isTeacher && lesson.reflection_notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('lessonPlans.teacherReflectionNotes')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 whitespace-pre-wrap italic">
                                {lesson.reflection_notes}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Duplicate Dialog */}
            <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('lessonPlans.duplicateLessonPlan')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <p className="text-sm text-slate-600">
                            {t('lessonPlans.selectClassToCopy').replace('{title}', lesson.title)}
                        </p>
                        <Select value={destinationClassId} onValueChange={setDestinationClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('lessonPlans.chooseDestinationClass')} />
                            </SelectTrigger>
                            <SelectContent>
                                {destinationClasses.map(cls => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                                {t('lessonPlans.cancel')}
                            </Button>
                            <Button 
                                onClick={handleDuplicate} 
                                disabled={!destinationClassId || isDuplicating}
                            >
                                {isDuplicating ? t('lessonPlans.duplicating') : t('lessonPlans.duplicate')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}