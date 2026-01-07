import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Poll } from '@/entities/Poll';
import { useTranslation } from '../../i18n/useTranslation';

export default function PollCreateForm({ currentClass, onCreated, onCancel }) {
    const { t } = useTranslation();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (!question.trim() || validOptions.length < 2) {
            alert("Please enter a question and at least two options.");
            return;
        }
        await Poll.create({
            class_id: currentClass.id,
            teacher_id: currentClass.teacher_id,
            question,
            options: validOptions
        });
        onCreated();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">{t('classTools.createNewPoll')}</h3>
            <div>
                <Label>{t('classTools.pollQuestion')}</Label>
                <Input value={question} onChange={e => setQuestion(e.target.value)} required />
            </div>
            <div>
                <Label>{t('classTools.options')}</Label>
                {options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <Input value={opt} onChange={e => handleOptionChange(index, e.target.value)} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}><Plus className="w-4 h-4 mr-1" /> {t('classTools.addOption')}</Button>
            </div>
            <div className="flex gap-2">
                <Button type="submit">{t('classTools.createPoll')}</Button>
                <Button type="button" variant="ghost" onClick={onCancel}>{t('classTools.cancel')}</Button>
            </div>
        </form>
    );
}