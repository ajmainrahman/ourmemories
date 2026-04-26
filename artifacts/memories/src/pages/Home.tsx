import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  useGetStatsOverview,
  useGetRecentMemories,
  useGetOnThisDay,
  useGetMoodBreakdown,
  getGetStatsOverviewQueryKey,
  getGetRecentMemoriesQueryKey,
  getGetOnThisDayQueryKey,
  getGetMoodBreakdownQueryKey,
} from "@workspace/api-client-react";
import { MemoryCard } from "@/components/MemoryCard";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Camera, Flame, ArrowRight, Sparkles } from "lucide-react";
import { moodColor } from "@/lib/memory-meta";

export default function Home() {
  const { data: stats } = useGetStatsOverview({
    query: { queryKey: getGetStatsOverviewQueryKey() },
  });
  const { data: recent } = useGetRecentMemories(
    { limit: 6 },
    { query: { queryKey: getGetRecentMemoriesQueryKey({ limit: 6 }) } },
  );
  const { data: onThisDay } = useGetOnThisDay({
    query: { queryKey: getGetOnThisDayQueryKey() },
  });
  const { data: moods } = useGetMoodBreakdown({
    query: { queryKey: getGetMoodBreakdownQueryKey() },
  });

  const today = new Date();
  const moodTotal = moods?.reduce((s, m) => s + m.count, 0) ?? 0;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-4 pb-2"
      >
        <p className="font-script text-2xl text-primary/80 mb-3">
          {format(today, "EEEE")}, {format(today, "MMMM do")}
        </p>
        <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight mb-4 leading-[1.05]">
          Welcome home,
          <br />
          <span className="italic text-primary">my love.</span>
        </h1>
        <p className="text-foreground/65 max-w-xl mx-auto leading-relaxed">
          A quiet little place for the two of us — the small moments, the big ones,
          and everything sweet in between.
        </p>
        <div className="flex items-center justify-center gap-3 mt-7">
          <Link href="/journal/new">
            <Button size="lg" className="rounded-full px-7 gap-2 shadow-md">
              Write today's memory
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/journal">
            <Button size="lg" variant="ghost" className="rounded-full px-6">
              Browse the journal
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* Stats strip */}
      {stats && (
        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
          }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          <StatCard
            icon={BookOpen}
            label="Memories"
            value={stats.totalMemories}
            tint="hsl(var(--primary))"
          />
          <StatCard
            icon={Heart}
            label="Favorites"
            value={stats.favoriteCount}
            tint="hsl(8 58% 48%)"
          />
          <StatCard
            icon={Camera}
            label="Photos"
            value={stats.photoCount}
            tint="hsl(32 60% 50%)"
          />
          <StatCard
            icon={Flame}
            label="Day streak"
            value={stats.streakDays}
            tint="hsl(15 70% 50%)"
          />
          <StatCard
            icon={Sparkles}
            label="Days together"
            value={stats.daysTogether}
            tint="hsl(165 30% 42%)"
          />
        </motion.section>
      )}

      {/* On this day */}
      {onThisDay && onThisDay.length > 0 && (
        <section>
          <SectionHeader
            kicker="On this day"
            title="A note from another year"
          />
          <div className="grid md:grid-cols-2 gap-5 mt-6">
            {onThisDay.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        </section>
      )}

      {/* Recent + mood breakdown */}
      <section className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between">
            <SectionHeader
              kicker="Lately"
              title="The most recent pages"
            />
            <Link href="/journal" className="text-sm text-primary hover:underline shrink-0 pb-1.5">
              See everything →
            </Link>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
            className="grid sm:grid-cols-2 gap-4 mt-6"
          >
            {recent?.map((m) => (
              <motion.div
                key={m.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <MemoryCard memory={m} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <aside className="space-y-6">
          <SectionHeader kicker="The feeling" title="How it's been" />
          <div className="paper-card rounded-2xl p-5 space-y-3 mt-6">
            {moods && moods.length > 0 ? (
              moods.slice(0, 6).map((m) => {
                const pct = moodTotal > 0 ? (m.count / moodTotal) * 100 : 0;
                return (
                  <div key={m.mood}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="capitalize font-medium">{m.mood}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {m.count}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: moodColor(m.mood) }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Add a memory to start seeing the colors of your year.
              </p>
            )}
          </div>
          {stats?.topMood && (
            <div className="paper-card rounded-2xl p-5">
              <p className="font-script text-lg text-muted-foreground mb-1">
                Mostly...
              </p>
              <p
                className="font-serif text-3xl capitalize"
                style={{ color: moodColor(stats.topMood) }}
              >
                {stats.topMood}
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="font-script text-xl text-primary/80">{kicker}</p>
      <h2 className="font-serif text-3xl font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
      className="paper-card rounded-2xl p-4 flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in oklab, ${tint} 18%, transparent)`,
          color: tint,
        }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="font-serif text-2xl font-semibold tabular-nums leading-none">
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </motion.div>
  );
}
