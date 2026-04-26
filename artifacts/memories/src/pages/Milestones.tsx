import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO, differenceInDays, addYears } from "date-fns";
import {
  useListMilestones,
  useCreateMilestone,
  useDeleteMilestone,
  getListMilestonesQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Heart, CalendarHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUGGESTED_ICONS = ["💞", "💍", "💋", "🌹", "✈️", "🏠", "🎂", "🥂", "🌟", "🎁"];

export default function Milestones() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: milestones = [], isLoading } = useListMilestones({
    query: { queryKey: getListMilestonesQueryKey() },
  });

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("💞");
  const [description, setDescription] = useState("");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListMilestonesQueryKey() });
  }

  const create = useCreateMilestone({
    mutation: {
      onSuccess: () => {
        invalidate();
        setTitle("");
        setDate("");
        setIcon("💞");
        setDescription("");
        setShowAdd(false);
        toast({ title: "Milestone added." });
      },
    },
  });

  const del = useDeleteMilestone({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Removed." });
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    create.mutate({
      data: {
        title: title.trim(),
        date,
        icon: icon || null,
        description: description.trim() || null,
      },
    });
  }

  const enriched = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return milestones.map((m) => {
      const d = parseISO(m.date);
      const daysSince = differenceInDays(today, d);

      // Find next anniversary occurrence
      let nextAnniv = new Date(d);
      while (nextAnniv < today) {
        nextAnniv = addYears(nextAnniv, 1);
      }
      const daysUntilAnniv = differenceInDays(nextAnniv, today);
      const upcomingYears =
        nextAnniv.getFullYear() - d.getFullYear();

      return { ...m, daysSince, daysUntilAnniv, upcomingYears, dateObj: d };
    });
  }, [milestones]);

  const sorted = [...enriched].sort((a, b) => a.daysUntilAnniv - b.daysUntilAnniv);

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
            <CalendarHeart className="w-4 h-4" />
            <span className="font-script text-base">The dates we never forget</span>
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">
            Our milestones
          </h1>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="rounded-full gap-1.5">
            <Plus className="w-4 h-4" />
            Add milestone
          </Button>
        )}
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            onSubmit={onSubmit}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
              <div className="grid sm:grid-cols-[1fr_180px] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="First date"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-10 h-10 text-lg rounded-full border transition-colors ${
                        icon === emoji
                          ? "border-primary bg-primary/10"
                          : "border-card-border hover:bg-secondary"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="desc">Description (optional)</Label>
                <Textarea
                  id="desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A note about why this day matters..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? "Saving..." : "Add milestone"}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Add your first milestone — first date, first kiss, the day you moved
            in...
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map((m) => (
            <MilestoneCard key={m.id} m={m} onDelete={() => del.mutate({ id: m.id })} />
          ))}
        </div>
      )}
    </div>
  );
}

type EnrichedMilestone = {
  id: string;
  title: string;
  date: string;
  description: string | null;
  icon: string | null;
  daysSince: number;
  daysUntilAnniv: number;
  upcomingYears: number;
  dateObj: Date;
};

function MilestoneCard({
  m,
  onDelete,
}: {
  m: EnrichedMilestone;
  onDelete: () => void;
}) {
  const isToday = m.daysUntilAnniv === 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-2xl border p-5 hover:shadow-sm transition-shadow ${
        isToday
          ? "border-primary/40 bg-primary/5"
          : "border-card-border bg-card"
      }`}
    >
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="text-3xl leading-none">{m.icon ?? "💞"}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold leading-tight">
            {m.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(m.dateObj, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-secondary/50 py-2.5">
          <div className="font-serif text-2xl font-semibold">
            {m.daysSince >= 0 ? m.daysSince.toLocaleString() : "—"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            days since
          </div>
        </div>
        <div
          className={`rounded-lg py-2.5 ${
            isToday ? "bg-primary text-primary-foreground" : "bg-secondary/50"
          }`}
        >
          <div className="font-serif text-2xl font-semibold">
            {isToday ? "Today!" : m.daysUntilAnniv.toLocaleString()}
          </div>
          <div
            className={`text-[10px] uppercase tracking-wider ${
              isToday ? "opacity-90" : "text-muted-foreground"
            }`}
          >
            {isToday
              ? `${m.upcomingYears} year${m.upcomingYears === 1 ? "" : "s"}`
              : `days till year ${m.upcomingYears}`}
          </div>
        </div>
      </div>

      {m.description && (
        <p className="mt-3 text-sm text-muted-foreground italic">
          {m.description}
        </p>
      )}
    </motion.div>
  );
}
