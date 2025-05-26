import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardItem } from "../../components/card";

export default async function CardsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to sign-in if not authenticated
    if (!user) {
        return redirect("/sign-in");
    }

    const { data: cards } = await supabase.from("cards").select("*");

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Cards</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards?.map((card: Card) => (
                    <CardItem key={card.id} card={card} />
                ))}
            </div>
        </div>
    );
}