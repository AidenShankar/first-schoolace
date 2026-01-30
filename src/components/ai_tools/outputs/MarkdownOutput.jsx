import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle } from 'lucide-react';

export default function MarkdownOutput({ content }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Check if this is AI detector output
    const isAIDetectorOutput = content.includes('AI Likelihood:') || content.includes('Human Likelihood:');

    return (
        <div className="rounded-xl border p-6 relative prose max-w-none" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))`, color: `rgb(var(--color-text))` }}>
            {isAIDetectorOutput && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">⚠️ Important Disclaimer</p>
                        <p>AI detection is not 100% accurate and should not be the sole basis for academic decisions. This tool provides an educated estimate based on writing patterns, but many factors can affect accuracy including writing skill, editing, and topic complexity. Use this as one data point among others when evaluating student work.</p>
                    </div>
                </div>
            )}
            
            <Button 
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="absolute top-4 right-4"
                style={{ color: `rgb(var(--color-textSecondary))` }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `rgb(var(--color-border))`;
                    e.currentTarget.style.color = `rgb(var(--color-text))`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = `rgb(var(--color-textSecondary))`;
                }}
            >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}