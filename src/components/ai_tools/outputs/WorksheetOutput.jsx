import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Printer, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WorksheetOutput({ content }) {
    const [copied, setCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Worksheet</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    @media print { 
                        body { margin: 0; } 
                        .no-print { display: none; }
                    }
                    /* Basic styling for worksheet */
                    .worksheet-content { max-width: 800px; margin: auto; }
                    h1, h2, h3 { text-align: center; }
                    .header-info { display: flex; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 0.5rem; border-bottom: 1px solid #ccc; }
                </style>
            </head>
            <body>
                <div class="worksheet-content">${content}</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <TooltipProvider>
            <div className="bg-white rounded-xl border border-slate-200 relative">
                {/* Action Buttons */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <div className="flex justify-end gap-2 flex-wrap">
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="text-slate-600 hover:text-slate-800"
                        >
                            {copied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copied ? 'Copied!' : 'Copy HTML'}
                        </Button>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="text-slate-600 hover:text-slate-800"
                                >
                                    <Printer className="w-4 h-4 mr-1" />
                                    Print / Save as PDF
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Opens your browser's print dialog.</p>
                            </TooltipContent>
                        </Tooltip>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowHelp(!showHelp)}
                            className="text-slate-500 hover:text-slate-800"
                        >
                            <HelpCircle className="w-4 h-4 mr-1" />
                            Help
                        </Button>
                    </div>

                    {showHelp && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 prose prose-sm max-w-none">
                            <h4 className="font-bold text-blue-900">How to Save as a PDF</h4>
                            <ol>
                                <li>Click the <strong>Print / Save as PDF</strong> button.</li>
                                <li>When the print preview window appears, look for the 'Destination' or 'Printer' dropdown menu.</li>
                                <li>Select <strong>'Save as PDF'</strong> from the list.</li>
                                <li>Click the 'Save' button and choose where to save the file on your computer.</li>
                            </ol>
                            <p className="mt-3">
                                <strong>Alternative:</strong> If you don't see a 'Save as PDF' option, use the 'Copy HTML' button. You can then paste the code into an online 'HTML to PDF' converter website. Please be mindful of sharing content with third-party services.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Worksheet Preview */}
                <div className="p-6 bg-white max-h-[600px] overflow-y-auto">
                    <div 
                        className="worksheet-content"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </TooltipProvider>
    );
}