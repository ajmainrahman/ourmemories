import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, parseISO } from "date-fns";
import { Link } from "wouter";
import {
  useListMemories,
  getListMemoriesQueryKey,
} from "@workspace/api-client-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Heart, MapPin } from "lucide-react";
import { moodColor } from "@/lib/memory-meta";

export default function CalendarPage() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const { data: memories } = useListMemories(undefined, {
    query: { queryKey: getListMemoriesQueryKey() },
  });

  const memoryDates = useMemo(
    () => memories?.map((m) => parseISO(m.memoryDate)) ?? [],
    [memories],
  );

  const moodByDay = useMemo(() => {
    const map = new Map<string, string>();
    memories?.forEach((m) => {
      if (m.mood) map.set(m.memoryDate, m.mood);
    });
    return map;
  }, [memories]);

  const onSelectedDay = useMemo(
    () =>
      memories?.filter((m) =>
        selected ? isSameDay(parseISO(m.memoryDate), selected) : false,
      ) ?? [],
    [memories, selected],
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-script text-2xl text-primary/80">A view from above</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
          The calendar of us.
        </h1>
      </header>

      <div className="grid lg:grid-cols-[auto,1fr] gap-8 items-start">
        <div className="paper-card rounded-2xl p-4 sm:p-6 mx-auto">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            modifiers={{
              hasMemory: memoryDates,
            }}
            modifiersClassNames={{
              hasMemory: "memory-day",
            }}
            components={{
              DayButton: (props) => {
                const date = props.day.date;
                const iso = format(date, "yyyy-MM-dd");
                const mood = moodByDay.get(iso);
                const has = memoryDates.some((d) => isSameDay(d, date));
                return (
                  <button
                    {...props}
                    className={`relative ${props.className ?? ""}`}
                  >
                    {date.getDate()}
                    {has && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                        style={{ background: mood ? moodColor(mood) : "hsl(var(--primary))" }}
                      />
                    )}
                  </button>
                );
              },
            }}
            className="bg-transparent"
          />
        </div>

        <div className="space-y-4 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold">
              {selected ? format(selected, "EEEE, MMM d, yyyy") : "Pick a day"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {onSelectedDay.length} {onSelectedDay.length === 1 ? "memory" : "memories"}
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {onSelectedDay.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="paper-card rounded-2xl p-10 text-center"
              >
                <p className="font-script text-2xl text-muted-foreground mb-4">
                  Nothing written for this day yet.
                </p>
                <Link href="/journal/new">
                  <Button variant="outline" className="rounded-full">
                    Add a memory for this day
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06 } },
                }}
                className="space-y-3"
              >
                {onSelectedDay.map((m) => (
                  <motion.div
                    key={m.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link href={`/journal/${m.id}`}>
                      <div className="paper-card rounded-xl p-5 hover-elevate cursor-pointer">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-serif text-xl font-semibold">
                            {m.title}
                          </h3>
                          {m.favorite && (
                            <Heart className="w-4 h-4 text-primary fill-primary shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-foreground/75 leading-relaxed line-clamp-2">
                          {m.body}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          {m.mood && (
                            <span
                              className="capitalize font-medium"
                              style={{ color: moodColor(m.mood) }}
                            >
                              {m.mood}
                            </span>
                          )}
                          {m.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {m.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
