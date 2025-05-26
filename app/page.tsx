'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from "@/components/search-bar";
import { Card, CardItem } from "@/components/card";
import { CardForm } from "@/components/card-form";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
        return;
      }

      // If authenticated, fetch cards
      const { data } = await supabase.from("cards").select("*");
      if (data) {
        setCards(data);
        setFilteredCards(data);
      }
    };

    fetchData();
  }, [router]);

  const handleSaveCard = (savedCard: Card) => {
    if (editingCard) {
      // Update existing card
      setCards(cards.map(c => c.id === savedCard.id ? savedCard : c));
      setFilteredCards(filteredCards.map(c => c.id === savedCard.id ? savedCard : c));
      setEditingCard(null);
    } else {
      // Add new card
      setCards([...cards, savedCard]);
      setFilteredCards([...filteredCards, savedCard]);
      setIsAddingCard(false);
    }
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
      const newCards = cards.filter(c => c.id !== deletingCard.id);
      setCards(newCards);
      setFilteredCards(filteredCards.filter(c => c.id !== deletingCard.id));
    } catch (error) {
      console.error('Error deleting card:', error);
      // You might want to show an error toast here
    } finally {
      setDeletingCard(null);
    }
  };

  return (
    <>
      <main className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center gap-4">
          <SearchBar
            cards={cards}
            onFilter={setFilteredCards}
          />
          <Button
            onClick={() => setIsAddingCard(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isAddingCard && (
          <CardForm
            mode="add"
            onCancel={() => setIsAddingCard(false)}
            onSave={handleSaveCard}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card: Card) => (
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
      </main>

      <AlertDialog open={!!deletingCard} onOpenChange={() => setDeletingCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el comando{' '}
              <code className="font-mono">{deletingCard?.command}</code> y toda su información.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
