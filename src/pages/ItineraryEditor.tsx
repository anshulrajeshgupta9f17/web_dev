import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Download, Eye, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadXml, renderItineraryHtml, type XmlActivity } from "@/lib/itineraryXml";

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  tags: string[];
  cover_emoji: string | null;
}

interface Activity {
  id: string;
  title: string;
  location: string | null;
  day_number: number;
  position: number;
  start_time: string | null;
  notes: string | null;
}

const SortableActivity = ({ a, onRemove, onChange }: {
  a: Activity;
  onRemove: () => void;
  onChange: (patch: Partial<Activity>) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: a.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardContent className="p-4 flex items-start gap-3">
          <button {...attributes} {...listeners} className="mt-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <Input value={a.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Activity title" />
            <Input className="sm:w-44" value={a.location ?? ""} onChange={(e) => onChange({ location: e.target.value })} placeholder="Location" />
            <Input className="sm:w-28" type="time" value={a.start_time ?? ""} onChange={(e) => onChange({ start_time: e.target.value })} />
            <Textarea className="sm:col-span-3" rows={2} value={a.notes ?? ""} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Notes" />
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
        </CardContent>
      </Card>
    </div>
  );
};

const ItineraryEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [it, setIt] = useState<Itinerary | null>(null);
  const [acts, setActs] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    (async () => {
      if (!id) return;
      const [{ data: i }, { data: a }] = await Promise.all([
        supabase.from("itineraries").select("*").eq("id", id).maybeSingle(),
        supabase.from("activities").select("*").eq("itinerary_id", id).order("day_number").order("position"),
      ]);
      if (!i) { toast.error("Not found"); navigate("/dashboard"); return; }
      setIt(i as Itinerary);
      setActs((a ?? []) as Activity[]);
      setLoading(false);
    })();
  }, [id, navigate]);

  const saveItinerary = async () => {
    if (!it) return;
    setSaving(true);
    const { error } = await supabase
      .from("itineraries")
      .update({
        title: it.title, destination: it.destination,
        start_date: it.start_date, end_date: it.end_date,
        notes: it.notes, tags: it.tags, cover_emoji: it.cover_emoji,
      })
      .eq("id", it.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const addActivity = async (day: number) => {
    if (!user || !it) return;
    const position = acts.filter((x) => x.day_number === day).length;
    const { data, error } = await supabase
      .from("activities")
      .insert({ user_id: user.id, itinerary_id: it.id, title: "New activity", day_number: day, position })
      .select("*").single();
    if (error) return toast.error(error.message);
    setActs((p) => [...p, data as Activity]);
  };

  const updateActivity = (idA: string, patch: Partial<Activity>) => {
    setActs((p) => p.map((x) => (x.id === idA ? { ...x, ...patch } : x)));
  };

  const persistActivity = async (a: Activity) => {
    await supabase.from("activities").update({
      title: a.title, location: a.location, start_time: a.start_time, notes: a.notes,
      day_number: a.day_number, position: a.position,
    }).eq("id", a.id);
  };

  const removeActivity = async (idA: string) => {
    setActs((p) => p.filter((x) => x.id !== idA));
    await supabase.from("activities").delete().eq("id", idA);
  };

  const onDragEnd = async (e: DragEndEvent, day: number) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const dayActs = acts.filter((a) => a.day_number === day);
    const oldIdx = dayActs.findIndex((a) => a.id === active.id);
    const newIdx = dayActs.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(dayActs, oldIdx, newIdx).map((a, i) => ({ ...a, position: i }));
    setActs((p) => [...p.filter((a) => a.day_number !== day), ...reordered]);
    await Promise.all(reordered.map((a) => supabase.from("activities").update({ position: a.position }).eq("id", a.id)));
  };

  const days = Array.from(new Set(acts.map((a) => a.day_number))).sort((x, y) => x - y);
  if (days.length === 0) days.push(1);

  const buildXmlPayload = () => ({
    title: it!.title, destination: it!.destination,
    start_date: it!.start_date ?? undefined, end_date: it!.end_date ?? undefined,
    notes: it!.notes ?? undefined, tags: it!.tags,
    cover_emoji: it!.cover_emoji ?? undefined,
    activities: acts.map<XmlActivity>((a) => ({
      title: a.title, location: a.location ?? undefined,
      day_number: a.day_number, position: a.position,
      start_time: a.start_time ?? undefined, notes: a.notes ?? undefined,
    })),
  });

  const openPreview = () => {
    if (!it) return;
    setPreviewHtml(renderItineraryHtml(buildXmlPayload()));
    setPreviewOpen(true);
  };

  const exportXml = () => { if (it) downloadXml(buildXmlPayload()); };

  const deleteTrip = async () => {
    if (!it) return;
    if (!confirm("Delete this itinerary?")) return;
    await supabase.from("itineraries").delete().eq("id", it.id);
    navigate("/dashboard");
  };

  if (loading || !it) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between py-3">
          <Button variant="ghost" size="sm" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> Trips</Link></Button>
          <div className="flex gap-2">
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm" onClick={openPreview}><Eye className="h-4 w-4 mr-2" /> XSLT preview</Button></DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Rendered from XML via XSLT</DialogTitle></DialogHeader>
                <div className="xslt-output" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={exportXml}><Download className="h-4 w-4 mr-2" /> Export XML</Button>
            <Button size="sm" onClick={saveItinerary} disabled={saving}><Save className="h-4 w-4 mr-2" /> Save</Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="grid gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Input className="text-3xl h-14 w-20 text-center" maxLength={2} value={it.cover_emoji ?? ""} onChange={(e) => setIt({ ...it, cover_emoji: e.target.value })} />
            <Input className="text-2xl h-14 font-semibold" value={it.title} onChange={(e) => setIt({ ...it, title: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>Destination</Label><Input value={it.destination} onChange={(e) => setIt({ ...it, destination: e.target.value })} /></div>
            <div><Label>Start</Label><Input type="date" value={it.start_date ?? ""} onChange={(e) => setIt({ ...it, start_date: e.target.value || null })} /></div>
            <div><Label>End</Label><Input type="date" value={it.end_date ?? ""} onChange={(e) => setIt({ ...it, end_date: e.target.value || null })} /></div>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag and press enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    e.preventDefault();
                    setIt({ ...it, tags: [...it.tags, tagInput.trim()] });
                    setTagInput("");
                  }
                }} />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {it.tags.map((t, i) => (
                <button key={i} onClick={() => setIt({ ...it, tags: it.tags.filter((_, j) => j !== i) })}
                  className="text-xs bg-secondary text-secondary-foreground rounded-full px-3 py-1 hover:bg-destructive hover:text-destructive-foreground transition-smooth">
                  {t} ✕
                </button>
              ))}
            </div>
          </div>
          <div><Label>Notes</Label><Textarea rows={3} value={it.notes ?? ""} onChange={(e) => setIt({ ...it, notes: e.target.value })} /></div>
        </div>

        <div className="space-y-8">
          {days.map((day) => {
            const dayActs = acts.filter((a) => a.day_number === day).sort((a, b) => a.position - b.position);
            return (
              <section key={day}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Day {day}</h2>
                  <Button size="sm" variant="ghost" onClick={() => addActivity(day)}><Plus className="h-4 w-4 mr-1" /> Activity</Button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onDragEnd(e, day)}>
                  <SortableContext items={dayActs.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {dayActs.map((a) => (
                        <SortableActivity key={a.id} a={a}
                          onChange={(p) => { updateActivity(a.id, p); persistActivity({ ...a, ...p }); }}
                          onRemove={() => removeActivity(a.id)} />
                      ))}
                      {dayActs.length === 0 && <p className="text-sm text-muted-foreground italic">No activities yet for this day.</p>}
                    </div>
                  </SortableContext>
                </DndContext>
              </section>
            );
          })}
          <Button variant="outline" onClick={() => addActivity(Math.max(...days) + 1)}><Plus className="h-4 w-4 mr-2" /> Add day</Button>
        </div>

        <div className="mt-12 pt-6 border-t">
          <Button variant="destructive" onClick={deleteTrip}><Trash2 className="h-4 w-4 mr-2" /> Delete itinerary</Button>
        </div>
      </main>

      <style>{`
        .xslt-output .xslt-itinerary { font-family: inherit; }
        .xslt-output .xslt-header { text-align: center; margin-bottom: 2rem; }
        .xslt-output .xslt-emoji { font-size: 48px; }
        .xslt-output .xslt-header h1 { font-size: 28px; margin: 8px 0; }
        .xslt-output .xslt-dest { color: hsl(var(--primary)); margin: 0; }
        .xslt-output .xslt-dates { color: hsl(var(--muted-foreground)); font-size: 14px; }
        .xslt-output .xslt-tag { display: inline-block; background: hsl(var(--secondary)); padding: 2px 10px; border-radius: 999px; margin: 2px; font-size: 12px; }
        .xslt-output .xslt-activity { display: flex; gap: 16px; padding: 14px; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 12px; margin-bottom: 10px; }
        .xslt-output .xslt-day { font-weight: 600; color: hsl(var(--primary)); min-width: 60px; }
        .xslt-output .xslt-activity h3 { margin: 0 0 4px; font-size: 16px; }
        .xslt-output .xslt-activity p { margin: 2px 0; font-size: 13px; color: hsl(var(--muted-foreground)); }
      `}</style>
    </div>
  );
};

export default ItineraryEditor;
