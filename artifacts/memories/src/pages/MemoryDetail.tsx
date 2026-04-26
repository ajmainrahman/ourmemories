import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  useGetMemory,
  useToggleFavorite,
  useDeleteMemory,
  getGetMemoryQueryKey,
  getListMemoriesQueryKey,
  getGetStatsOverviewQueryKey,
  getGetRecentMemoriesQueryKey,
  getGetMoodBreakdownQueryKey,
  getGetTagCloudQueryKey,
  getGetTimelineQueryKey,
  getGetOnThisDayQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RepliesSection } from "@/components/RepliesSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Tag as TagIcon,
} from "lucide-react";
import { AUTHOR_LABELS, moodColor } from "@/lib/memory-meta";
import { useToast } from "@/hooks/use-toast";

export default function MemoryDetail() {
  const [, params] = useRoute("/journal/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params?.id ?? "";
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: memory, isLoading } = useGetMemory(id, {
    query: { enabled: !!id, queryKey: getGetMemoryQueryKey(id) },
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentMemoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMoodBreakdownQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTagCloudQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTimelineQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetOnThisDayQueryKey() });
  }

  const toggleFav = useToggleFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMemoryQueryKey(id) });
        invalidateAll();
      },
    },
  });

  const del = useDeleteMemory({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        toast({ title: "Removed.", description: "That page is gone." });
        navigate("/journal");
      },
    },
  });

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">Opening the page...</div>;
  }
  if (!memory) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h2 className="font-serif text-2xl font-semibold mb-2">Couldn't find it.</h2>
        <p className="text-muted-foreground mb-6">
          The memory you're looking for might have been removed.
        </p>
        <Link href="/journal">
          <Button>Back to journal</Button>
        </Link>
      </div>
    );
  }

  const date = parseISO(memory.memoryDate);

  return (
    <article className="max-w-3xl mx-auto">
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to journal
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <time dateTime={memory.memoryDate} className="font-medium">
            {format(date, "EEEE, MMMM d, yyyy")}
          </time>
          <span>·</span>
          <span className="font-script text-base">
            {AUTHOR_LABELS[memory.author] ?? memory.author}
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight">
          {memory.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {memory.mood && (
            <span
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium capitalize"
              style={{
                background: `color-mix(in oklab, ${moodColor(memory.mood)} 18%, transparent)`,
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
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {memory.location}
            </span>
          )}
        </div>
      </motion.header>

      {memory.photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-3 mb-10"
        >
          <div className="rounded-2xl overflow-hidden border border-card-border shadow-md">
            <img
              src={memory.photos[0]}
              alt={memory.title}
              className="w-full h-auto max-h-[520px] object-cover"
            />
          </div>
          {memory.photos.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {memory.photos.slice(1).map((url) => (
                <div
                  key={url}
                  className="aspect-square rounded-xl overflow-hidden border border-card-border"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-serif text-lg leading-[1.85] text-foreground/85 whitespace-pre-wrap"
      >
        {memory.body}
      </motion.div>

      {memory.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-border">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mr-1">
            Tagged
          </span>
          {memory.tags.map((t) => (
            <Badge key={t} variant="outline" className="gap-1 font-normal">
              <TagIcon className="w-2.5 h-2.5" />
              {t}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-10 pt-6 border-t border-border">
        <Button
          variant={memory.favorite ? "default" : "outline"}
          onClick={() => toggleFav.mutate({ id: memory.id })}
          className="rounded-full gap-2"
        >
          <Heart className={`w-4 h-4 ${memory.favorite ? "fill-current" : ""}`} />
          {memory.favorite ? "Loved" : "Love this"}
        </Button>
        <div className="flex items-center gap-2">
          <Link href={`/journal/${memory.id}/edit`}>
            <Button variant="outline" className="gap-1.5">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:text-destructive gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center font-script text-base">
        Written on {format(parseISO(memory.createdAt), "MMM d, yyyy")}
      </p>

      <RepliesSection memoryId={memory.id} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Remove this memory?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This page will be torn out for good. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => del.mutate({ id: memory.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, remove it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
