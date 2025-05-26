'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Card, CARD_CATEGORIES, CardCategory } from './card';
import { Button } from './ui/button';
import { Check, Filter, Tag, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from './ui/dropdown-menu';

type SearchBarProps = {
    cards: Card[];
    onFilter: (filteredCards: Card[]) => void;
};

export function SearchBar({ cards, onFilter }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<CardCategory[]>([]);
    const [tagSearch, setTagSearch] = useState('');

    // Get unique tags from all cards
    const allTags = Array.from(new Set(cards.flatMap(card => card.tags))).sort();

    // Filter tags based on search
    const filteredTags = allTags.filter(tag =>
        tag.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const handleSearch = (term: string, tags: string[] = selectedTags, categories: CardCategory[] = selectedCategories) => {
        setSearchTerm(term);

        let filtered = cards;

        // Filter by search term
        if (term.trim()) {
            const searchTermLower = term.toLowerCase();
            filtered = filtered.filter(card => {
                if (card.command.toLowerCase().includes(searchTermLower)) return true;
                if (card.description.toLowerCase().includes(searchTermLower)) return true;
                if (card.examples.some(example => {
                    return example.cmd.toLowerCase().includes(searchTermLower) ||
                        example.desc.toLowerCase().includes(searchTermLower);
                })) return true;
                if (card.qa_context.toLowerCase().includes(searchTermLower)) return true;
                return false;
            });
        }

        // Filter by selected tags
        if (tags.length > 0) {
            filtered = filtered.filter(card =>
                tags.every(tag => card.tags.includes(tag))
            );
        }

        // Filter by selected categories
        if (categories.length > 0) {
            filtered = filtered.filter(card =>
                categories.includes(card.category)
            );
        }

        onFilter(filtered);
    };

    const toggleTag = (tag: string) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(newTags);
        handleSearch(searchTerm, newTags);
    };

    const toggleCategory = (category: CardCategory) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];
        setSelectedCategories(newCategories);
        handleSearch(searchTerm, selectedTags, newCategories);
    };

    const clearFilters = () => {
        setSelectedTags([]);
        setSelectedCategories([]);
        handleSearch(searchTerm, [], []);
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4">
            <div className="flex gap-2">
                <Input
                    type="search"
                    placeholder="Buscar por comandos, descripciones, ejemplos o contexto..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="shrink-0">
                            <Tag className="mr-2 h-4 w-4" />
                            Tags
                            {selectedTags.length > 0 && (
                                <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">
                                    {selectedTags.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]" align="end">
                        <div className="px-2 py-2">
                            <Input
                                placeholder="Search tags..."
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-auto">
                            {filteredTags.map(tag => (
                                <DropdownMenuItem
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className="flex items-center justify-between cursor-pointer"
                                >
                                    <span>{tag}</span>
                                    {selectedTags.includes(tag) && (
                                        <Check className="h-4 w-4" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                            {filteredTags.length === 0 && (
                                <div className="px-2 py-2 text-sm text-muted-foreground">
                                    No tags found
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="shrink-0">
                            <Filter className="mr-2 h-4 w-4" />
                            Categorías
                            {selectedCategories.length > 0 && (
                                <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">
                                    {selectedCategories.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]" align="end">
                        <DropdownMenuLabel>Categorías</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.entries(CARD_CATEGORIES).map(([key, value]) => (
                            <DropdownMenuItem
                                key={key}
                                onClick={() => toggleCategory(key as CardCategory)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <span>{value.label}</span>
                                {selectedCategories.includes(key as CardCategory) && (
                                    <Check className="h-4 w-4" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Selected filters display */}
            {(selectedTags.length > 0 || selectedCategories.length > 0) && (
                <div className="flex flex-wrap gap-2 items-center">
                    {selectedTags.map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                        >
                            {tag}
                            <button
                                onClick={() => toggleTag(tag)}
                                className="hover:text-primary/80"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                    {selectedCategories.map(category => (
                        <span
                            key={category}
                            className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                        >
                            {CARD_CATEGORIES[category].label}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="hover:text-primary/80"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={clearFilters}
                        className="text-sm text-muted-foreground hover:text-primary"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
} 