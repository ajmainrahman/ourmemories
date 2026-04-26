import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { format, parse } from "date-fns";
import {
  useGetTimeline,
  useGetMoodBreakdown,
  useGetTagCloud,
  useGetStatsOverview,
  getGetTimelineQueryKey,
  getGetMoodBreakdownQueryKey,
  getGetTagCloudQueryKey,
  getGetStatsOverviewQueryKey,
} from "@workspace/api-client-react";
import { moodColor } from "@/lib/memory-meta";

export default function Insights() {
  const { data: timeline } = useGetTimeline({
    query: { queryKey: getGetTimelineQueryKey() },
  });
  const { data: moods } = useGetMoodBreakdown({
    query: { queryKey: getGetMoodBreakdownQueryKey() },
  });
  const { data: tags } = useGetTagCloud({
    query: { queryKey: getGetTagCloudQueryKey() },
  });
  const { data: stats } = useGetStatsOverview({
    query: { queryKey: getGetStatsOverviewQueryKey() },
  });

  const timelineData = (timeline ?? []).map((t) => ({
    month: t.month,
    label: format(parse(t.month, "yyyy-MM", new Date()), "MMM yy"),
    count: t.count,
  }));

  const maxTagCount = Math.max(1, ...(tags ?? []).map((t) => t.count));

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="font-script text-2xl text-primary/80">A look back</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
          What our pages are made of.
        </h1>
      </header>

      {stats && (
        <motion.section
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <BigStat label="In our journal" value={stats.totalMemories} />
          <BigStat label="Loved" value={stats.favoriteCount} />
          <BigStat
            label="Days together"
            value={stats.daysTogether}
            sub={
              stats.firstMemoryDate
                ? `since ${format(new Date(stats.firstMemoryDate), "MMM d, yyyy")}`
                : undefined
            }
          />
          <BigStat
            label="Most common feeling"
            valueText={stats.topMood ?? "—"}
            tint={moodColor(stats.topMood)}
          />
        </motion.section>
      )}

      <section className="paper-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold">By the month</h2>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            How many memories
          </span>
        </div>
        {timelineData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            Add a few memories and the months will show up here.
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--popover-border))",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="paper-card rounded-3xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold mb-6">Moods</h2>
          {!moods || moods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No moods yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={moods}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="mood"
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--popover-border))",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {moods.map((m) => (
                      <Cell key={m.mood} fill={moodColor(m.mood)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="paper-card rounded-3xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold mb-6">The little themes</h2>
          {!tags || tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tags you add to memories will gather here.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => {
                const scale = 0.85 + (t.count / maxTagCount) * 0.9;
                return (
                  <motion.span
                    key={t.tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-colors cursor-default"
                    style={{ fontSize: `${scale}rem` }}
                  >
                    {t.tag}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {t.count}
                    </span>
                  </motion.span>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  valueText,
  sub,
  tint,
}: {
  label: string;
  value?: number;
  valueText?: string;
  sub?: string;
  tint?: string;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      className="paper-card rounded-2xl p-5"
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
        {label}
      </div>
      <div
        className="font-serif text-3xl font-semibold tabular-nums capitalize"
        style={tint ? { color: tint } : undefined}
      >
        {valueText ?? value}
      </div>
      {sub && (
        <div className="font-script text-sm text-muted-foreground mt-1">
          {sub}
        </div>
      )}
    </motion.div>
  );
}
