import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, LogOut, Plane, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { parseItineraryXml } from "@/lib/itineraryXml";

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  tags: string[];
  cover_emoji: string | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [items, setItems] = useState<Itinerary[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("itineraries")
      .select("id,title,destination,start_date,end_date,tags,cover_emoji")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("itineraries")
      .insert({ user_id: user.id, title: "Untitled trip", destination: "Anywhere", cover_emoji: "🌍", tags: [] })
      .select("id").single();
    if (error) return toast.error(error.message);
    window.location.href = `/itinerary/${data.id}`;
  };

  const importXml = async (file: File) => {
    if (!user) return;
    try {
      const text = await file.text();
      const parsed = parseItineraryXml(text);
      const { data: it, error } = await supabase
        .from("itineraries")
        .insert({
          user_id: user.id,
          title: parsed.title,
          destination: parsed.destination,
          start_date: parsed.start_date ?? null,
          end_date: parsed.end_date ?? null,
          notes: parsed.notes ?? null,
          tags: parsed.tags,
          cover_emoji: parsed.cover_emoji ?? "✈️",
        })
        .select("id").single();
      if (error) throw error;
      if (parsed.activities.length) {
        await supabase.from("activities").insert(
          parsed.activities.map((a) => ({
            itinerary_id: it.id,
            user_id: user.id,
            title: a.title,
            location: a.location ?? null,
            day_number: a.day_number,
            position: a.position,
            start_time: a.start_time ?? null,
            notes: a.notes ?? null,
          })),
        );
      }
      toast.success("Itinerary imported");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const filtered = items.filter((i) => {
    const s = q.toLowerCase();
    return !s || i.title.toLowerCase().includes(s) || i.destination.toLowerCase().includes(s)
      || i.tags.some((t) => t.toLowerCase().includes(s));
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Plane className="h-5 w-5 text-primary" /> Wayfare
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl">Your trips</h1>
            <p className="text-muted-foreground mt-1">Plan, organize, and export your itineraries.</p>
          </div>
          <div className="flex gap-2">
            <label className="inline-flex">
              <input type="file" accept=".xml,application/xml" className="hidden" onChange={(e) => e.target.files && importXml(e.target.files[0])} />
              <Button variant="outline" asChild><span><Upload className="h-4 w-4 mr-2" /> Import XML</span></Button>
            </label>
            <Button onClick={create}><Plus className="h-4 w-4 mr-2" /> New trip</Button>
          </div>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search title, destination, or tag" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-16 text-center">
            <p className="text-muted-foreground">No trips yet. Create your first itinerary.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it, idx) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.4 }}
              >
                <Link to={`/itinerary/${it.id}`}>
                  <Card className="hover:shadow-elegant transition-smooth hover:-translate-y-0.5 cursor-pointer h-full">
                    <CardHeader>
                      <div className="text-3xl mb-2">{it.cover_emoji ?? "✈️"}</div>
                      <CardTitle className="text-lg">{it.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{it.destination}</p>
                    </CardHeader>
                    <CardContent>
                      {(it.start_date || it.end_date) && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {it.start_date} {it.end_date ? `→ ${it.end_date}` : ""}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {it.tags.slice(0, 4).map((t) => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
