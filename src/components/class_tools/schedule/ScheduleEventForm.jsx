import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ScrollableDatePicker = ({ value, onChange }) => {
    const currentDate = value || new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 10; year++) {
        years.push(year);
    }

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const handleDateChange = (type, newValue) => {
        const newDate = new Date(currentDate);
        
        if (type === 'month') {
            newDate.setMonth(newValue);
            // Adjust day if it doesn't exist in new month
            const newDaysInMonth = getDaysInMonth(newValue, newDate.getFullYear());
            if (newDate.getDate() > newDaysInMonth) {
                newDate.setDate(newDaysInMonth);
            }
        } else if (type === 'day') {
            newDate.setDate(newValue);
        } else if (type === 'year') {
            newDate.setFullYear(newValue);
            // Adjust for leap year
            if (currentMonth === 1 && currentDay === 29 && !isLeapYear(newValue)) {
                newDate.setDate(28);
            }
        }
        
        onChange(newDate);
    };

    const isLeapYear = (year) => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };

    return (
        <div className="grid grid-cols-3 gap-4">
            <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: `rgb(var(--color-textSecondary))` }}>Month</Label>
                <Select value={currentMonth.toString()} onValueChange={(value) => handleDateChange('month', parseInt(value))}>
                    <SelectTrigger className="h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        {months.map((month, index) => (
                            <SelectItem key={index} value={index.toString()}>
                                {month}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: `rgb(var(--color-textSecondary))` }}>Day</Label>
                <Select value={currentDay.toString()} onValueChange={(value) => handleDateChange('day', parseInt(value))}>
                    <SelectTrigger className="h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        {days.map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                                {day}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: `rgb(var(--color-textSecondary))` }}>Year</Label>
                <Select value={currentYear.toString()} onValueChange={(value) => handleDateChange('year', parseInt(value))}>
                    <SelectTrigger className="h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default function ScheduleEventForm({ event, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(
        event
            ? { ...event, event_date: new Date(event.event_date.replace(/-/g, '/')) } // Fix for date parsing
            : { title: '', description: '', event_date: new Date(), event_type: 'Test/Quiz' }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Correctly format the date to YYYY-MM-DD without timezone issues
        const date = formData.event_date;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        const dataToSubmit = { 
            ...formData, 
            event_date: `${year}-${month}-${day}`
        };
        onSubmit(dataToSubmit);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>Title</Label>
                        <Input 
                            id="title" 
                            value={formData.title} 
                            onChange={(e) => handleInputChange('title', e.target.value)} 
                            placeholder="Event title"
                            className="h-10"
                            required 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>Description</Label>
                        <Textarea 
                            id="description" 
                            value={formData.description} 
                            onChange={(e) => handleInputChange('description', e.target.value)} 
                            placeholder="Event description (optional)"
                            className="min-h-[80px] resize-none"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>Date</Label>
                        <ScrollableDatePicker 
                            value={formData.event_date}
                            onChange={(date) => handleInputChange('event_date', date)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="event_type" className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>Event Type</Label>
                        <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                            <SelectTrigger className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Test/Quiz">Test/Quiz</SelectItem>
                                <SelectItem value="Homework Due">Homework Due</SelectItem>
                                <SelectItem value="Project Due">Project Due</SelectItem>
                                <SelectItem value="Holiday">Holiday</SelectItem>
                                <SelectItem value="Event">Event</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <DialogFooter className="gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel} className="px-6">
                            Cancel
                        </Button>
                        <Button type="submit" className="px-6">
                            {event ? 'Save Changes' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}