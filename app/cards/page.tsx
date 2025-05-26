'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { Card, CardItem } from "../../components/card";
import { CardForm } from "@/components/card-form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CardsPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [deletingCard, setDeletingCard] = useState<Card | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // Redirect to sign-in if not authenticated
            if (!user) {
                return redirect("/sign-in");
            }

            // If authenticated, fetch cards
            const { data } = await supabase.from("cards").select("*");
            if (data) {
                setCards(data);
            }
        };

        fetchData();
    }, []);

    const handleSaveCard = (savedCard: Card) => {
        setCards(cards.map(c => c.id === savedCard.id ? savedCard : c));
        setEditingCard(null);
    };

    const handleDeleteCard = async () => {
        if (!deletingCard) return;

        try {
            const { error } = await supabase
                .from('cards')
                .delete()
                .eq('id', deletingCard.id);

            if (error) throw error;

            // Remove card from state
            setCards(cards.filter(c => c.id !== deletingCard.id));
        } catch (error) {
            console.error('Error deleting card:', error);
            // You might want to show an error toast here
        } finally {
            setDeletingCard(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Cards</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards?.map((card: Card) => (
                    editingCard?.id === card.id ? (
                        <CardForm
                            key={card.id}
                            mode="edit"
                            card={card}
                            onCancel={() => setEditingCard(null)}
                            onSave={handleSaveCard}
                        />
                    ) : (
                        <CardItem
                            key={card.id}
                            card={card}
                            onEdit={() => setEditingCard(card)}
                            onDelete={() => setDeletingCard(card)}
                        />
                    )
                ))}
            </div>

            <AlertDialog open={!!deletingCard} onOpenChange={(open) => {
                if (!open) setDeletingCard(null);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el comando{' '}
                            <code className="font-mono">{deletingCard?.command}</code> y toda su información.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingCard(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCard}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}