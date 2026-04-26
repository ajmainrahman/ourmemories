import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListMemories,
  useToggleFavorite,
  useGetTagCloud,
  getListMemoriesQueryKey,
  getGetTagCloudQueryKey,
  getGetStatsOverviewQueryKey,
  getGetMoodBreakdownQueryKey,
  getGetRecentMemoriesQueryKey,
  getGetTimelineQueryKey,
  getGetOnThisDayQueryKey,
} from "@workspace/api-client-react";
import { MemoryCard } from "@/components/MemoryCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, LayoutGrid, Rows3, Heart, BookOpen } from "lucide-react";
import { MOODS, moodColor } from "@/lib/memory-meta";
import { Link } from "wouter";

export default function Journal() {
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [favorite, setFavorite] = useState(false);
  const [view, setView] = useState<"grid" | "timeline">("grid");

  const queryClient = useQueryClient();

  const params = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(mood !== "all" ? { mood } : {}),
      ...(tag !== "all" ? { tag } : {}),
      ...(year !== "all" ? { year: Number(year) } : {}),
      ...(favorite ? { favorite: true } : {}),
    }),
    [search, mood, tag, year, favorite],
  );

  const { data: memories, isLoading } = useListMemories(params, {
    query: { queryKey: getListMemoriesQueryKey(params) },
  });

  const { data: tags } = useGetTagCloud({
    query: { queryKey: getGetTagCloudQueryKey() },
  });

  const toggleFav = useToggleFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentMemoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMoodBreakdownQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTimelineQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOnThisDayQueryKey() });
      },
    },
  });

  const years = useMemo(() => {
    const set = new Set<number>();
    memories?.forEach((m) => set.add(new Date(m.memoryDate).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [memories]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-script text-2xl text-primary/80">Our journal</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
          Every page, every page-break,
          <br />
          <span className="italic">all in one place.</span>
        </h1>
      </header>

      {/* Filters */}
      <div className="paper-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, stories, places..."
              className="pl-10 bg-background"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any mood</SelectItem>
                {MOODS.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any tag</SelectItem>
                {tags?.map((t) => (
                  <SelectItem key={t.tag} value={t.tag}>
                    {t.tag} ({t.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any year</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant={favorite ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => setFavorite(!favorite)}
            >
              <Heart className={`w-3.5 h-3.5 ${favorite ? "fill-current" : ""}`} />
              Favorites only
            </Button>
            {(search || mood !== "all" || tag !== "all" || year !== "all" || favorite) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setSearch("");
                  setMood("all");
                  setTag("all");
                  setYear("all");
                  setFavorite(false);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full border bg-background">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition ${
                view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setView("timeline")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition ${
                view === "timeline" ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Reading the pages...</div>
      ) : !memories || memories.length === 0 ? (
        <EmptyState />
      ) : view === "grid" ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } },
          }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {memories.map((m) => (
              <motion.div
                key={m.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <MemoryCard
                  memory={m}
                  onToggleFavorite={(id) => toggleFav.mutate({ id })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="max-w-2xl mx-auto pl-2">
          <AnimatePresence>
            {memories.map((m) => (
              <MemoryCard key={m.id} memory={m} variant="timeline" />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mood legend (uses moodColor, looks intentional) */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2">
        <span className="font-medium uppercase tracking-wider">Moods —</span>
        {MOODS.map((m) => (
          <span key={m} className="inline-flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: moodColor(m) }}
            />
            <span className="capitalize">{m}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="paper-card rounded-3xl p-12 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <BookOpen className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-serif text-2xl font-semibold mb-2">
        The first page is the hardest.
      </h3>
      <p className="text-muted-foreground mb-6">
        Or maybe just adjust the filters — there might be something hiding.
      </p>
      <Link href="/journal/new">
        <Button size="lg" className="rounded-full px-7">
          Write the first one
        </Button>
      </Link>
    </div>
  );
}
