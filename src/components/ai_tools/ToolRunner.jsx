import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MarkdownOutput from './outputs/MarkdownOutput';
import WorksheetOutput from './outputs/WorksheetOutput';
import FileUpload from './inputs/FileUpload';
import { useTranslation } from '../i18n/useTranslation';
import { base44 } from '@/api/base44Client';

export default function ToolRunner({ tool }) {
    const { t, language } = useTranslation();
    const [formState, setFormState] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Get the input schema - supports both old inputSchema array and new getInputSchema function
    const inputSchema = tool.getInputSchema ? tool.getInputSchema(t) : (tool.inputSchema || []);

    // Determines if the form is valid based on required fields in the inputSchema
    const isFormValid = inputSchema.every(field => field.required ? !!formState[field.id] : true);

    // Effect to pre-fill the form state if an initial message is provided in the tool props
    useEffect(() => {
        if (tool.initialMessage) {
            // Attempts to find the first Textarea or Input component in the schema to populate
            const targetField = inputSchema.find(
                f => f.component && (f.component.name === 'Textarea' || f.component.name === 'Input' || f.component.displayName === 'Textarea' || f.component.displayName === 'Input')
            );
            if (targetField) {
                setFormState(prev => ({...prev, [targetField.id]: tool.initialMessage}));
            }
        }
    }, [tool.initialMessage, inputSchema]);

    // Handles changes to form inputs, including standard inputs, selects, and file inputs
    const handleInputChange = (id, value) => {
        // Checks if the 'value' is an event object from a file input (e.g., <input type="file" />)
        if (value && typeof value === 'object' && 'target' in value && value.target && value.target.files instanceof FileList) {
            setFormState(prev => ({ ...prev, [id]: value.target.files[0] || null }));
        } 
        // Checks if the 'value' is an event object from a standard input (e.g., text, textarea, number)
        else if (value && typeof value === 'object' && 'target' in value && value.target && 'value' in value.target) {
            setFormState(prev => ({ ...prev, [id]: value.target.value }));
        } 
        // Handles direct values passed (e.g., from a Select component's onValueChange,
        // or a custom component like FileUpload passing a File object directly)
        else {
            setFormState(prev => ({ ...prev, [id]: value }));
        }
    };

    // Main function to handle the generation process
    const handleGenerate = async () => {
        setIsLoading(true);
        setOutput(null); // Clear any previous output

        try {
            let currentFormState = { ...formState }; // Create a mutable copy of the form state for processing
            let file_urls = [];

            // Identify if there's a file input field with a selected File object in the form state
            const fileInputId = inputSchema.find(f => currentFormState[f.id] instanceof File)?.id;
            let uploadedFileUrl = null;

            // Process file upload if a file is present in the form state
            if (fileInputId && currentFormState[fileInputId] instanceof File) {
                const fileToUpload = currentFormState[fileInputId];
                
                try {
                    // Upload the file to the backend
                    const { file_url } = await UploadFile({ file: fileToUpload });
                    uploadedFileUrl = file_url;

                    // Special handling for the 'ai-detector' tool: extract text from the uploaded file
                    if (tool.id === 'ai-detector') {
                        const extraction = await ExtractDataFromUploadedFile({
                            file_url,
                            json_schema: { type: "object", properties: { content: { type: "string" } } }
                        });

                        if (extraction.status === 'success' && extraction.output?.content) {
                            // Update the current form state with the extracted text content
                            currentFormState.text_content = extraction.output.content; 
                        } else {
                            // If text extraction fails, set an error output and stop the process
                            setOutput({ type: 'error', content: 'Could not extract text from the uploaded file. Please try copying and pasting the text instead.' });
                            setIsLoading(false);
                            return;
                        }
                    } else {
                        // For other tools, add the file URL to the LLM payload
                        file_urls.push(file_url);
                    }
                } catch (uploadError) {
                    console.error("File processing failed:", uploadError);
                    setOutput({ type: 'error', content: 'File processing failed. Please try again.' });
                    setIsLoading(false);
                    return;
                }
            }
            
            // Specific validation for the 'ai-detector' tool after file processing
            if (tool.id === 'ai-detector' && !currentFormState.text_content?.trim() && !uploadedFileUrl) {
                setOutput({ type: 'error', content: 'Please provide text to analyze either by pasting it in the text area or uploading a document.' });
                setIsLoading(false);
                return;
            }

            // Call the backend function
            const { data, error } = await base44.functions.invoke('runAITool', {
                toolId: tool.id,
                inputs: currentFormState,
                file_urls: file_urls,
                language: language
            });

            if (error) {
                throw new Error(error.response?.data?.error || "Unknown error from backend");
            }
            
            setOutput({ type: 'success', content: data.result }); // Set successful output
        } catch (error) {
            console.error("AI Tool Generation failed:", error);
            
            // Provide more user-friendly error messages based on the error type
            let errorMessage = 'An error occurred while generating the response.';
            if (error.message?.includes('429') || error.message?.toLowerCase().includes('rate limit')) {
                errorMessage = 'The AI service is currently busy due to high demand. Please wait a moment and try again.';
            } else if (error.message?.includes('500')) {
                errorMessage = 'The AI service is temporarily unavailable. Please try again later.';
            } else if (error.message?.includes('too large')) {
                errorMessage = 'The content is too large to process. Please try with a smaller file or shorter text.';
            } else {
                 errorMessage = error.message || 'An unexpected error occurred.';
            }
            
            setOutput({ type: 'error', content: errorMessage }); // Set error output
        } finally {
            setIsLoading(false); // Always stop loading, regardless of success or failure
        }
    };
    
    return (
        <Card className="shadow-lg h-full flex flex-col themed-card">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)))` }}>
                        <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{tool.name}</CardTitle>
                        <CardDescription style={{ color: `rgb(var(--color-textSecondary))` }}>{tool.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-6">
                {/* Inputs Section */}
                <div className="space-y-4">
                    {inputSchema.map(field => {
                        const InputComponent = field.component;
                        
                        // Special rendering for Select components
                        if (InputComponent === Select) {
                            return (
                                <div key={field.id} className="space-y-2">
                                    <label htmlFor={field.id} className="font-medium text-slate-700">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <Select value={formState[field.id] || ''} onValueChange={(val) => handleInputChange(field.id, val)}>
                                        <SelectTrigger id={field.id} className="w-full">
                                            <SelectValue placeholder={`${t('aiTools.select')} ${field.label.toLowerCase()}...`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.props?.items?.map(item => (
                                                <SelectItem key={item} value={item}>{item}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        }

                        // Special rendering for FileUpload component to pass the correct prop
                        if (InputComponent === FileUpload) {
                            return (
                                <FileUpload
                                    key={field.id}
                                    id={field.id}
                                    label={field.label}
                                    onFileChange={(file) => handleInputChange(field.id, file)}
                                    selectedFile={formState[field.id] instanceof File ? formState[field.id] : null} // Pass selected file for display
                                    {...field.props}
                                />
                            );
                        }

                        // Default rendering for other input components (e.g., Textarea, Input, custom inputs)
                        return (
                            <div key={field.id} className="space-y-2">
                                <label htmlFor={field.id} className="font-medium" style={{ color: `rgb(var(--color-text))` }}>
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <InputComponent
                                    id={field.id}
                                    value={formState[field.id] || ''} 
                                    onChange={(e) => handleInputChange(field.id, e)} 
                                    {...field.props}
                                />
                            </div>
                        );
                    })}
                    
                    <Button onClick={handleGenerate} disabled={!isFormValid || isLoading} className="w-full py-6 text-lg themed-button">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                {t('aiTools.generating')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                {t('aiTools.generate')}
                            </>
                        )}
                    </Button>
                </div>

                {/* Output Section */}
                <div className="flex-1 flex flex-col space-y-4">
                    <h3 className="font-semibold flex-shrink-0" style={{ color: `rgb(var(--color-text))` }}>{t('aiTools.output')}</h3>
                    {isLoading && !output ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl border gap-2" style={{ backgroundColor: `rgba(var(--color-border), 0.3)`, color: `rgb(var(--color-textSecondary))`, borderColor: `rgb(var(--color-border))` }}>
                            <Loader2 className="w-8 h-8 animate-spin" />
                            {isTranslating && <p className="text-sm">{t('aiTools.translating') || 'Translating...'}</p>}
                        </div>
                    ) : output && output.type === 'error' ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 font-medium">{t('aiTools.error')}</p>
                            <p className="text-red-700 mt-1">{output.content}</p>
                            <p className="text-red-600 text-sm mt-2">
                                {t('aiTools.errorRetry')}
                            </p>
                        </div>
                    ) : output && output.type === 'success' ? (
                        <div className="flex-1 overflow-y-auto border rounded-lg" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                           {tool.outputComponent === WorksheetOutput ? (
                               <WorksheetOutput content={output.content} />
                           ) : (
                               <div className="p-4">
                                   <MarkdownOutput content={output.content} />
                               </div>
                           )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8 text-center rounded-xl border border-dashed" style={{ backgroundColor: `rgba(var(--color-border), 0.3)`, color: `rgb(var(--color-textSecondary))`, borderColor: `rgb(var(--color-border))` }}>
                            {t('aiTools.outputPlaceholder')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}