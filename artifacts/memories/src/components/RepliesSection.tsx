import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  useListReplies,
  useCreateReply,
  useDeleteReply,
  getListRepliesQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function RepliesSection({ memoryId }: { memoryId: string }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: replies = [], isLoading } = useListReplies(memoryId, {
    query: { queryKey: getListRepliesQueryKey(memoryId) },
  });
  const [body, setBody] = useState("");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListRepliesQueryKey(memoryId) });
  }

  const create = useCreateReply({
    mutation: {
      onSuccess: () => {
        invalidate();
        setBody("");
      },
    },
  });
  const del = useDeleteReply({
    mutation: { onSuccess: invalidate },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    create.mutate({ id: memoryId, data: { body: body.trim() } });
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="font-serif text-lg font-semibold flex items-center gap-2 mb-5">
        <MessageCircle className="w-4 h-4 text-muted-foreground" />
        Replies
        {replies.length > 0 && (
          <span className="text-sm text-muted-foreground font-normal">
            · {replies.length}
          </span>
        )}
      </h2>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading replies...</p>
      ) : (
        <ul className="space-y-3 mb-6">
          <AnimatePresence initial={false}>
            {replies.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="group rounded-xl border border-card-border bg-card px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-serif font-semibold text-sm">
                      {r.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(r.createdAt), "MMM d 'at' h:mm a")}
                    </span>
                  </div>
                  {user?.id === r.authorId && (
                    <button
                      type="button"
                      onClick={() => del.mutate({ id: r.id })}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete reply"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm mt-1.5 whitespace-pre-wrap text-foreground/85">
                  {r.body}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
          {replies.length === 0 && (
            <li className="text-sm text-muted-foreground italic">
              No replies yet — leave a sweet note.
            </li>
          )}
        </ul>
      )}

      <form onSubmit={onSubmit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={`Reply as ${user?.name ?? "you"}...`}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={create.isPending || !body.trim()}>
            {create.isPending ? "Sending..." : "Reply"}
          </Button>
        </div>
      </form>
    </section>
  );
}
