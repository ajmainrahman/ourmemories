import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import { MOODS, AUTHOR_LABELS, moodColor } from "@/lib/memory-meta";
import { cn } from "@/lib/utils";

export interface MemoryFormValues {
  title: string;
  body: string;
  memoryDate: string;
  location: string;
  mood: string;
  author: "self" | "partner" | "both";
  tags: string[];
  photos: string[];
}

interface Props {
  initial?: Partial<MemoryFormValues>;
  submitLabel?: string;
  onSubmit: (values: MemoryFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function MemoryForm({
  initial,
  submitLabel = "Keep this memory",
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [memoryDate, setMemoryDate] = useState(initial?.memoryDate ?? todayISO());
  const [location, setLocation] = useState(initial?.location ?? "");
  const [mood, setMood] = useState(initial?.mood ?? "");
  const [author, setAuthor] = useState<MemoryFormValues["author"]>(
    initial?.author ?? "both",
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [photoInput, setPhotoInput] = useState("");

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  }

  function addPhoto() {
    const p = photoInput.trim();
    if (p && !photos.includes(p)) {
      setPhotos([...photos, p]);
    }
    setPhotoInput("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSubmit({
      title: title.trim(),
      body: body.trim(),
      memoryDate,
      location,
      mood,
      author,
      tags,
      photos,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label className="font-script text-base text-muted-foreground" htmlFor="title">
          Give it a name
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The afternoon we got caught in the rain"
          className="text-2xl md:text-3xl h-auto py-3 px-4 font-serif border-0 border-b-2 border-border rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="font-script text-base text-muted-foreground" htmlFor="body">
          Tell the story
        </Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing — describe what happened, what it felt like, what you want to remember most..."
          rows={12}
          className="text-base leading-relaxed font-serif border-card-border bg-card/60 resize-none rounded-xl p-5"
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">When did it happen?</Label>
          <Input
            id="date"
            type="date"
            value={memoryDate}
            onChange={(e) => setMemoryDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">Where were you?</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Our kitchen, Cannon Beach..."
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">How did it feel?</Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const active = mood === m;
            return (
              <button
                type="button"
                key={m}
                onClick={() => setMood(active ? "" : m)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                  active
                    ? "border-transparent shadow-sm scale-[1.03]"
                    : "border-border bg-background text-foreground/70 hover:text-foreground hover:bg-secondary",
                )}
                style={
                  active
                    ? {
                        background: `color-mix(in oklab, ${moodColor(m)} 18%, white)`,
                        color: moodColor(m),
                      }
                    : undefined
                }
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Who's writing?</Label>
        <div className="flex flex-wrap gap-2">
          {(["self", "partner", "both"] as const).map((a) => {
            const active = author === a;
            return (
              <button
                type="button"
                key={a}
                onClick={() => setAuthor(a)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  active
                    ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                    : "bg-background border-border text-foreground/70 hover:text-foreground hover:bg-secondary",
                )}
              >
                {AUTHOR_LABELS[a]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="weekend, cooking, anniversary..."
          />
          <Button type="button" variant="outline" onClick={addTag} className="gap-1">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="gap-1 pl-2.5 pr-1 py-1 font-normal"
              >
                {t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="hover:bg-background/60 rounded-full p-0.5"
                  aria-label={`Remove ${t}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Photos</Label>
        <div className="flex gap-2">
          <Input
            value={photoInput}
            onChange={(e) => setPhotoInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhoto();
              }
            }}
            placeholder="Paste an image URL..."
          />
          <Button type="button" variant="outline" onClick={addPhoto} className="gap-1">
            <ImageIcon className="w-4 h-4" />
            Add
          </Button>
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((url) => (
              <div
                key={url}
                className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((p) => p !== url))}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={isSubmitting} size="lg" className="rounded-full px-7">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
