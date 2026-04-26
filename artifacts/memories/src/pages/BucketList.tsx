import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListBucketList,
  useCreateBucketListItem,
  useUpdateBucketListItem,
  useDeleteBucketListItem,
  getListBucketListQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

const CATEGORIES = [
  { value: "place", label: "Place to go" },
  { value: "restaurant", label: "Restaurant" },
  { value: "activity", label: "Activity" },
  { value: "experience", label: "Experience" },
  { value: "other", label: "Other" },
];

export default function BucketList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [], isLoading } = useListBucketList({
    query: { queryKey: getListBucketListQueryKey() },
  });

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("place");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
  }

  const create = useCreateBucketListItem({
    mutation: {
      onSuccess: () => {
        invalidate();
        setTitle("");
        setDescription("");
        setCategory("place");
        setShowAdd(false);
        toast({ title: "Added to your list." });
      },
    },
  });

  const update = useUpdateBucketListItem({
    mutation: { onSuccess: invalidate },
  });

  const del = useDeleteBucketListItem({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Removed." });
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        category,
      },
    });
  }

  const open = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1.5">
            <ListChecks className="w-4 h-4" />
            <span className="font-script text-base">Things to do together</span>
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">
            Our bucket list
          </h1>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="rounded-full gap-1.5">
            <Plus className="w-4 h-4" />
            Add an item
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
              <div className="space-y-1.5">
                <Label htmlFor="title">What is it?</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Watch the sunrise from a mountain"
                  required
                  autoFocus
                />
              </div>
              <div className="grid sm:grid-cols-[1fr_180px] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Notes (optional)</Label>
                  <Textarea
                    id="desc"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why this matters to us..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? "Adding..." : "Add to list"}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            Your bucket list is empty — what should you do together first?
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {open.map((item) => (
              <BucketItemRow
                key={item.id}
                item={item}
                onToggle={(completed) =>
                  update.mutate({ id: item.id, data: { completed } })
                }
                onDelete={() => del.mutate({ id: item.id })}
              />
            ))}
          </ul>

          {done.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Done together · {done.length}
              </h2>
              <ul className="space-y-2 opacity-70">
                {done.map((item) => (
                  <BucketItemRow
                    key={item.id}
                    item={item}
                    onToggle={(completed) =>
                      update.mutate({ id: item.id, data: { completed } })
                    }
                    onDelete={() => del.mutate({ id: item.id })}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type BucketItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  completed: boolean;
  completedAt: string | null;
  addedByName: string | null;
};

function BucketItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: BucketItem;
  onToggle: (completed: boolean) => void;
  onDelete: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.value === item.category);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-start gap-3 rounded-xl border border-card-border bg-card px-4 py-3 hover:shadow-sm transition-shadow"
    >
      <Checkbox
        checked={item.completed}
        onCheckedChange={(v) => onToggle(Boolean(v))}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}
          >
            {item.title}
          </span>
          {cat && (
            <Badge variant="outline" className="font-normal text-xs">
              {cat.label}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
            {item.description}
          </p>
        )}
        <div className="text-xs text-muted-foreground mt-1.5 font-script">
          {item.addedByName ? `added by ${item.addedByName}` : "added"}
          {item.completed && item.completedAt
            ? ` · checked off ${format(parseISO(item.completedAt), "MMM d, yyyy")}`
            : ""}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.li>
  );
}
