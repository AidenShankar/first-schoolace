import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Users, Award, Trash2, Copy, MoreVertical, Eye, EyeOff, Edit } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "../i18n/useTranslation";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";

const subjectColors = {
  math: "bg-blue-100 text-blue-800 border-blue-200",
  english: "bg-green-100 text-green-800 border-green-200",
  science: "bg-purple-100 text-purple-800 border-purple-200",
  history: "bg-amber-100 text-amber-800 border-amber-200",
  art: "bg-pink-100 text-pink-800 border-pink-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function AssignmentCard({ assignment, submissionCount, onClick, onDelete, onDuplicate, allClasses, currentClass, onToggleVisibility, onEdit }) {
  const { t } = useTranslation();
  const subject = assignment.subject || 'other';
  const isValidDate = assignment.due_date && !isNaN(new Date(assignment.due_date).getTime());

  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [destinationClassId, setDestinationClassId] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);

  const getDisplayStatus = (assignment) => {
    const now = new Date();
    const openDate = assignment.open_date ? new Date(assignment.open_date) : null;
    const closeDate = assignment.close_date ? new Date(assignment.close_date) : null;
    
    if (!assignment.is_visible) {
        return { text: 'Hidden', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
    if (openDate && now < openDate) {
        return { text: `Scheduled`, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
    }
    if (closeDate && now > closeDate) {
        return { text: 'Closed', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    // Added condition: if it's active and has a future close date
    if (closeDate && now < closeDate) {
        return { text: 'Active', color: 'bg-green-100 text-green-800 border-green-200', closeInfo: `Closes ${format(closeDate, 'MMM d, p')}` };
    }
    return { text: 'Active', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const displayStatus = getDisplayStatus(assignment);

  const handleDuplicate = async () => {
    if (!destinationClassId) return;
    
    setIsDuplicating(true);
    try {
      await onDuplicate(assignment, destinationClassId);
      setShowDuplicateDialog(false);
      setDestinationClassId('');
    } catch (error) {
      console.error("Error duplicating assignment:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const destinationClasses = allClasses?.filter(c => c.id !== currentClass?.id) || [];

  const renderVisibilityToggle = () => {
    // If it's closed, the action should be to re-open it
    if (displayStatus.text === 'Closed') {
      return (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // This re-opens the assignment by setting is_visible to true and clearing the close date
            onToggleVisibility(assignment.id, true, true);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          {t('assignments.reopenAssignment')}
        </DropdownMenuItem>
      );
    }

    // Default behavior: Toggle is_visible state
    return (
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(assignment.id, !assignment.is_visible);
        }}
      >
        {assignment.is_visible ? 
          <><EyeOff className="h-4 w-4 mr-2" />{t('assignments.hideFromStudents')}</> : 
          <><Eye className="h-4 w-4 mr-2" />{t('assignments.showToStudents')}</>
        }
      </DropdownMenuItem>
    );
  };

  return (
    <>
      <Card 
        className="backdrop-blur-sm hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] flex flex-col themed-card"
        style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}
      >
        <CardHeader className="pb-3 cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold transition-colors line-clamp-2" style={{ color: `rgb(var(--color-text))` }}>
                {assignment.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${subjectColors[subject]} text-xs px-2 py-1 rounded-full`}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </Badge>
                <Badge className={`${displayStatus.color} text-xs px-2 py-1 rounded-full`}>
                    {displayStatus.text}
                    {displayStatus.text === 'Scheduled' && ` for ${format(new Date(assignment.open_date), 'MMM d, p')}`}
                    {displayStatus.closeInfo && ` • ${displayStatus.closeInfo}`}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 transition-colors" style={{ color: `rgb(var(--color-textSecondary))` }} onMouseEnter={(e) => e.currentTarget.style.color = `rgb(var(--color-primary))`} onMouseLeave={(e) => e.currentTarget.style.color = `rgb(var(--color-textSecondary))`} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    style={{ color: `rgb(var(--color-textSecondary))` }}
                    onMouseEnter={(e) => e.currentTarget.style.color = `rgb(var(--color-text))`}
                    onMouseLeave={(e) => e.currentTarget.style.color = `rgb(var(--color-textSecondary))`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Assignment options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(assignment);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                   )}
                  {renderVisibilityToggle()}
                  {onDuplicate && destinationClasses.length > 0 && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDuplicateDialog(true);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t('assignments.duplicateToAnotherClass')}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(assignment.id);
                      }}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 cursor-pointer flex-grow" onClick={onClick}>
          {assignment.description && (
            <div 
              className="text-sm line-clamp-2 prose prose-sm max-w-none [&>*]:my-0"
              style={{ color: `rgb(var(--color-textSecondary))` }}
              dangerouslySetInnerHTML={{ __html: assignment.description }}
            />
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center" style={{ color: `rgb(var(--color-textSecondary))` }}>
              <Clock className="w-4 h-4 mr-2" style={{ color: `rgb(var(--color-textSecondary))` }} />
              <div>
                <p className="font-medium">Due Date</p>
                <p className="text-xs">
                  {isValidDate ? format(new Date(assignment.due_date), 'MMM d, yyyy') : 'No due date'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center" style={{ color: `rgb(var(--color-textSecondary))` }}>
              <Award className="w-4 h-4 mr-2" style={{ color: `rgb(var(--color-textSecondary))` }} />
              <div>
                <p className="font-medium">Max Points</p>
                <p className="text-xs">{assignment.max_points} pts</p>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="flex items-center justify-between pt-2 border-t p-4" style={{ borderColor: `rgb(var(--color-border))` }}>
          <div className="flex items-center" style={{ color: `rgb(var(--color-textSecondary))` }}>
            <Users className="w-4 h-4 mr-2" style={{ color: `rgb(var(--color-textSecondary))` }} />
            <span className="text-sm font-medium">
              {submissionCount} {submissionCount !== 1 ? t('assignments.submissions') : t('assignments.submission')}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg px-3 py-1 transition-colors"
            style={{ color: `rgb(var(--color-primary))` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = `rgb(var(--color-primaryHover))`;
              e.currentTarget.style.backgroundColor = `rgba(var(--color-primary), 0.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = `rgb(var(--color-primary))`;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={onClick}
          >
            {t('assignments.viewDetails')}
          </Button>
        </div>
      </Card>

      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('assignments.duplicateAssignment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm" style={{ color: `rgb(var(--color-textSecondary))` }}>
              {t('assignments.selectDestinationClass')} "{assignment.title}":
            </p>
            <Select value={destinationClassId} onValueChange={setDestinationClassId}>
              <SelectTrigger>
                <SelectValue placeholder={t('assignments.chooseDestinationClass')} />
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
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleDuplicate} 
                disabled={!destinationClassId || isDuplicating}
                className="text-white transition-colors"
                style={{ backgroundColor: `rgb(var(--color-primary))` }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = `rgb(var(--color-primaryHover))`)}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = `rgb(var(--color-primary))`)}
              >
                {isDuplicating ? t('assignments.duplicating') : t('assignments.duplicate')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}