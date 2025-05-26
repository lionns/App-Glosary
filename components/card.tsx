'use client';

import { useState } from 'react';
import { Check, Copy, Edit2, Trash2 } from 'lucide-react'; // Make sure to install lucide-react
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// Define categories and their colors
export const CARD_CATEGORIES = {
    terminal: {
        label: 'Terminal & Navegación',
        color: 'bg-red-50 border-red-200',
    },
    git: {
        label: 'Control de versiones (Git)',
        color: 'bg-orange-50 border-orange-200',
    },
    javascript: {
        label: 'JavaScript',
        color: 'bg-yellow-50 border-yellow-200',
    },
    playwright: {
        label: 'Playwright',
        color: 'bg-violet-50 border-violet-200',
    },
    testing: {
        label: 'Testing',
        color: 'bg-teal-50 border-teal-200',
    },  
    concepts: {
        label: 'Conceptos clave',
        color: 'bg-pink-50 border-pink-200',
    },
    other: {
        label: 'Otros',
        color: 'bg-gray-100 border-gray-300',
    },
} as const;

export type CardCategory = keyof typeof CARD_CATEGORIES;

// Define the new Example type
type Example = {
    cmd: string;
    desc: string;
};

// Update the Card type with the new examples type
export type Card = {
    id: string;
    command: string;
    description: string;
    examples: Example[];
    qa_context: string;
    reminder: string;
    tags: string[];
    favorite: boolean;
    created_at: string | null;
    updated_at: string | null;
    generated_by_ai: boolean;
    category: CardCategory;
};

// Create a CardItem component
export function CardItem({ card, onEdit, onDelete }: { card: Card; onEdit: () => void; onDelete: () => void }) {
    // Keep track of which examples have been copied
    const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});

    const copyToClipboard = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            // Set this example as copied
            setCopiedStates(prev => ({ ...prev, [index]: true }));
            // Reset the copied state after 2 seconds
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [index]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const categoryStyle = CARD_CATEGORIES[card.category]?.color || CARD_CATEGORIES.other.color;

    return (
        <div className={cn(
            "rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border",
            categoryStyle
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold font-mono">{card.command}</h2>
                    <span className="text-xs text-muted-foreground">
                        {CARD_CATEGORIES[card.category]?.label || CARD_CATEGORIES.other.label}
                    </span>
                </div>
                <div className="flex gap-2">
                    {card.favorite && (
                        <span className="text-yellow-500">★</span>
                    )}
                    {card.generated_by_ai && (
                        <span className="min-w-[40px] flex items-center justify-center bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">AI</span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-destructive hover:text-destructive/90"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <p className="text-gray-600 mb-4">{card.description}</p>

            {card.examples.length > 0 && (
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">💡 Ejemplo:</h3>
                    <div className="space-y-2">
                        {card.examples.map((example, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 p-2 rounded font-mono text-sm flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center group">
                                    <code>{example.cmd}</code>
                                    <button
                                        onClick={() => copyToClipboard(example.cmd, index)}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copiedStates[index] ? (
                                            <Check size={16} className="text-green-500" />
                                        ) : (
                                            <Copy size={16} className="opacity-0 group-hover:opacity-100" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 pl-4 border-l-2 border-gray-200">
                                    {example.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {card.qa_context && (
                <div className="mb-4">
                    <h3 className="font-semibold mb-1">🎯 Contexto QA:</h3>
                    <p className="text-sm text-gray-600">{card.qa_context}</p>
                </div>
            )}

            {card.reminder && (
                <div className="mb-4">
                    <h3 className="font-semibold mb-1">⚠️ Recuerda:</h3>
                    <p className="text-sm text-gray-600">{card.reminder}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
                {card.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}