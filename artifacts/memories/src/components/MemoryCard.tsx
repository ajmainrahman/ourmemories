import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, MapPin, Tag as TagIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AUTHOR_LABELS,
  moodColor,
} from "@/lib/memory-meta";
import { cn } from "@/lib/utils";
import type { Memory } from "@workspace/api-client-react";

interface Props {
  memory: Memory;
  onToggleFavorite?: (id: string) => void;
  variant?: "card" | "timeline";
}

export function MemoryCard({ memory, onToggleFavorite, variant = "card" }: Props) {
  const date = parseISO(memory.memoryDate);
  const photo = memory.photos[0];

  if (variant === "timeline") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative pl-10 pb-10 last:pb-0"
      >
        <div className="absolute left-0 top-1.5 flex flex-col items-center h-full">
          <div
            className="w-3 h-3 rounded-full ring-4 ring-background"
            style={{ background: moodColor(memory.mood) }}
          />
          <div className="flex-1 w-px bg-border mt-1" />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          {format(date, "EEEE, MMMM d, yyyy")}
        </div>
        <Link href={`/journal/${memory.id}`}>
          <div className="paper-card rounded-xl p-5 hover-elevate cursor-pointer">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-serif text-xl font-semibold leading-snug">
                {memory.title}
              </h3>
              {memory.favorite && (
                <Heart className="w-4 h-4 text-primary fill-primary shrink-0 mt-1" />
              )}
            </div>
            <p className="text-sm text-foreground/75 leading-relaxed line-clamp-3">
              {memory.body}
            </p>
            <MemoryMeta memory={memory} className="mt-4" />
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32 }}
      whileHover={{ y: -3 }}
      className="paper-card rounded-2xl overflow-hidden flex flex-col group"
    >
      <Link href={`/journal/${memory.id}`} className="contents">
        {photo ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={photo}
              alt={memory.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <div className="text-[0.7rem] uppercase tracking-wider opacity-90">
                {format(date, "MMM d, yyyy")}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="px-5 pt-5 pb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground font-medium"
          >
            <span>{format(date, "EEE, MMM d, yyyy")}</span>
            <span className="font-script normal-case text-base text-foreground/60">
              {AUTHOR_LABELS[memory.author] ?? memory.author}
            </span>
          </div>
        )}
        <div className="flex-1 flex flex-col p-5 pt-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl font-semibold leading-snug">
              {memory.title}
            </h3>
          </div>
          <p className="text-sm text-foreground/75 leading-relaxed mt-2 line-clamp-3 flex-1">
            {memory.body}
          </p>
          <MemoryMeta memory={memory} className="mt-4" />
        </div>
      </Link>
      {onToggleFavorite && (
        <div className="px-5 pb-4 -mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(memory.id);
            }}
            className="rounded-full h-8 px-2.5 gap-1.5"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                memory.favorite ? "fill-primary text-primary" : "text-muted-foreground",
              )}
            />
            <span className="text-xs">
              {memory.favorite ? "Loved" : "Love this"}
            </span>
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function MemoryMeta({
  memory,
  className,
}: {
  memory: Memory;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {memory.mood && (
        <span
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background: `color-mix(in oklab, ${moodColor(memory.mood)} 15%, transparent)`,
            color: moodColor(memory.mood),
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: moodColor(memory.mood) }}
          />
          {memory.mood}
        </span>
      )}
      {memory.location && (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {memory.location}
        </span>
      )}
      {memory.tags.slice(0, 3).map((t) => (
        <Badge
          key={t}
          variant="outline"
          className="text-xs font-normal gap-1"
        >
          <TagIcon className="w-2.5 h-2.5" />
          {t}
        </Badge>
      ))}
      {memory.tags.length > 3 && (
        <span className="text-xs text-muted-foreground">
          +{memory.tags.length - 3}
        </span>
      )}
    </div>
  );
}
