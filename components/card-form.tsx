'use client';

import { useState } from 'react';
import { Card, CARD_CATEGORIES, CardCategory } from './card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Save, X, Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface CardFormProps {
    card?: Card;
    onCancel: () => void;
    onSave: (card: Card) => void;
    mode: 'add' | 'edit';
}

const emptyCard: Omit<Card, 'id' | 'created_at' | 'updated_at'> = {
    command: '',
    description: '',
    examples: [],
    qa_context: '',
    reminder: '',
    tags: [],
    favorite: false,
    generated_by_ai: false,
    category: 'other',
};

export function CardForm({ card, onCancel, onSave, mode }: CardFormProps) {
    const [formData, setFormData] = useState(
        mode === 'edit' && card
            ? card
            : { ...emptyCard, created_at: null, updated_at: null }
    );
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    const handleExampleChange = (index: number, field: 'cmd' | 'desc', value: string) => {
        const newExamples = [...formData.examples];
        newExamples[index] = { ...newExamples[index], [field]: value };
        setFormData({ ...formData, examples: newExamples });
    };

    const addExample = () => {
        setFormData({
            ...formData,
            examples: [...formData.examples, { cmd: '', desc: '' }]
        });
    };

    const removeExample = (index: number) => {
        setFormData({
            ...formData,
            examples: formData.examples.filter((_, i) => i !== index)
        });
    };

    const handleTagsChange = (value: string) => {
        setFormData({
            ...formData,
            tags: value.split(',').map(tag => tag.trim()).filter(tag => tag)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (mode === 'add') {
                const { created_at, updated_at, ...newCardData } = formData;

                const { data, error } = await supabase
                    .from('cards')
                    .insert({
                        ...newCardData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (error) throw error;
                if (data) onSave(data);
            } else {
                const { error } = await supabase
                    .from('cards')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', (formData as Card).id);
                if (error) throw error;
                const { data } = await supabase
                    .from('cards')
                    .select()
                    .eq('id', (formData as Card).id)
                    .single();
                if (data) onSave(data);
            }
        } catch (error) {
            console.error('Error saving card:', error);
            // You might want to show an error toast here
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4 gap-4">
                <div className="flex-1 space-y-4">
                    <Input
                        value={formData.command}
                        onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                        className="font-mono text-xl font-bold"
                        placeholder="Comando"
                        required
                    />
                    <Select
                        value={formData.category}
                        onValueChange={(value: CardCategory) =>
                            setFormData({ ...formData, category: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(CARD_CATEGORIES).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <span className="animate-spin">⌛</span>
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mb-4"
                placeholder="Descripción"
                required
            />

            <div className="mb-4">
                <h3 className="font-semibold mb-2">💡 Ejemplos:</h3>
                <div className="space-y-2">
                    {formData.examples.map((example, index) => (
                        <div key={index} className="flex flex-col gap-2 bg-gray-50 p-2 rounded">
                            <div className="flex gap-2">
                                <Input
                                    value={example.cmd}
                                    onChange={(e) => handleExampleChange(index, 'cmd', e.target.value)}
                                    placeholder="Comando"
                                    className="font-mono"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExample(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <Input
                                value={example.desc}
                                onChange={(e) => handleExampleChange(index, 'desc', e.target.value)}
                                placeholder="Descripción"
                                required
                            />
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExample}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar ejemplo
                    </Button>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold mb-1">🎯 Contexto:</h3>
                <Textarea
                    value={formData.qa_context}
                    onChange={(e) => setFormData({ ...formData, qa_context: e.target.value })}
                    placeholder="QA Context"
                />
            </div>

            <div className="mb-4">
                <h3 className="font-semibold mb-1">⚠️ Recuerda:</h3>
                <Textarea
                    value={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                    placeholder="Reminder"
                />
            </div>

            <div>
                <h3 className="font-semibold mb-1">Tags:</h3>
                <Input
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="Tags (comma-separated)"
                />
            </div>
        </form>
    );
} 