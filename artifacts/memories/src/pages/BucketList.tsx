import { useEffect, useMemo, useState } from "react";
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
import { Plus, Trash2, ListChecks, Pencil, X, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

const BUILT_IN_CATEGORIES = [
  { value: "place", label: "Place to go" },
  { value: "restaurant", label: "Restaurant" },
  { value: "activity", label: "Activity" },
  { value: "experience", label: "Experience" },
  { value: "trip", label: "Trip" },
  { value: "movie", label: "Movie / show" },
  { value: "book", label: "Book" },
  { value: "recipe", label: "Recipe to cook" },
  { value: "concert", label: "Concert / event" },
  { value: "milestone", label: "Milestone" },
  { value: "gift", label: "Gift idea" },
  { value: "home", label: "Home project" },
  { value: "other", label: "Other" },
];

const ADD_CUSTOM_VALUE = "__add_custom__";
const NO_CATEGORY_VALUE = "__none__";
const CUSTOM_CATEGORIES_KEY = "om_bucket_custom_categories";

function loadCustomCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(values: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(values));
  } catch {
    /* ignore */
  }
}

function categoryLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const built = BUILT_IN_CATEGORIES.find((c) => c.value === value);
  return built ? built.label : value;
}

type BucketItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  completed: boolean;
  completedAt: string | null;
  addedByName: string | null;
};

type FormValues = {
  title: string;
  description: string;
  category: string;
  deadline: string;
};

export default function BucketList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [], isLoading } = useListBucketList({
    query: { queryKey: getListBucketListQueryKey() },
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    setCustomCategories(loadCustomCategories());
  }, []);

  // Surface any user-saved categories already attached to existing items so
  // they show up in the dropdown even on a fresh device.
  useEffect(() => {
    const fromItems = items
      .map((i) => i.category)
      .filter(
        (c): c is string =>
          typeof c === "string" &&
          c.length > 0 &&
          !BUILT_IN_CATEGORIES.some((b) => b.value === c),
      );
    if (fromItems.length === 0) return;
    setCustomCategories((prev) => {
      const merged = Array.from(new Set([...prev, ...fromItems]));
      if (merged.length === prev.length) return prev;
      saveCustomCategories(merged);
      return merged;
    });
  }, [items]);

  function addCustomCategory(label: string): string | null {
    const trimmed = label.trim();
    if (!trimmed) return null;
    if (BUILT_IN_CATEGORIES.some((b) => b.label.toLowerCase() === trimmed.toLowerCase())) {
      const match = BUILT_IN_CATEGORIES.find(
        (b) => b.label.toLowerCase() === trimmed.toLowerCase(),
      )!;
      return match.value;
    }
    setCustomCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed];
      saveCustomCategories(next);
      return next;
    });
    return trimmed;
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
  }

  const create = useCreateBucketListItem({
    mutation: {
      onSuccess: () => {
        invalidate();
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

  function handleCreate(values: FormValues) {
    create.mutate({
      data: {
        title: values.title.trim(),
        description: values.description.trim() || null,
        category: values.category || null,
        deadline: values.deadline || null,
      },
    });
  }

  function handleEditSave(id: string, values: FormValues) {
    update.mutate(
      {
        id,
        data: {
          title: values.title.trim(),
          description: values.description.trim() || null,
          category: values.category || null,
          deadline: values.deadline || null,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          toast({ title: "Updated." });
        },
      },
    );
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
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <BucketItemForm
              mode="create"
              initial={{ title: "", description: "", category: "place", deadline: "" }}
              customCategories={customCategories}
              addCustomCategory={addCustomCategory}
              submitting={create.isPending}
              onSubmit={handleCreate}
              onCancel={() => setShowAdd(false)}
            />
          </motion.div>
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
            {open.map((item) =>
              editingId === item.id ? (
                <li key={item.id}>
                  <BucketItemForm
                    mode="edit"
                    initial={{
                      title: item.title,
                      description: item.description ?? "",
                      category: item.category ?? "",
                      deadline: item.deadline ?? "",
                    }}
                    customCategories={customCategories}
                    addCustomCategory={addCustomCategory}
                    submitting={update.isPending}
                    onSubmit={(v) => handleEditSave(item.id, v)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <BucketItemRow
                  key={item.id}
                  item={item}
                  onToggle={(completed) =>
                    update.mutate({ id: item.id, data: { completed } })
                  }
                  onDelete={() => del.mutate({ id: item.id })}
                  onEdit={() => setEditingId(item.id)}
                />
              ),
            )}
          </ul>

          {done.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Done together · {done.length}
              </h2>
              <ul className="space-y-2 opacity-70">
                {done.map((item) =>
                  editingId === item.id ? (
                    <li key={item.id}>
                      <BucketItemForm
                        mode="edit"
                        initial={{
                          title: item.title,
                          description: item.description ?? "",
                          category: item.category ?? "",
                          deadline: item.deadline ?? "",
                        }}
                        customCategories={customCategories}
                        addCustomCategory={addCustomCategory}
                        submitting={update.isPending}
                        onSubmit={(v) => handleEditSave(item.id, v)}
                        onCancel={() => setEditingId(null)}
                      />
                    </li>
                  ) : (
                    <BucketItemRow
                      key={item.id}
                      item={item}
                      onToggle={(completed) =>
                        update.mutate({ id: item.id, data: { completed } })
                      }
                      onDelete={() => del.mutate({ id: item.id })}
                      onEdit={() => setEditingId(item.id)}
                    />
                  ),
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BucketItemForm({
  mode,
  initial,
  customCategories,
  addCustomCategory,
  submitting,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial: FormValues;
  customCategories: string[];
  addCustomCategory: (label: string) => string | null;
  submitting: boolean;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [deadline, setDeadline] = useState(initial.deadline);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  function handleSelectChange(value: string) {
    if (value === ADD_CUSTOM_VALUE) {
      setShowCustomInput(true);
      return;
    }
    if (value === NO_CATEGORY_VALUE) {
      setCategory("");
      return;
    }
    setCategory(value);
  }

  function commitCustomCategory() {
    const created = addCustomCategory(customLabel);
    if (created) {
      setCategory(created);
      setShowCustomInput(false);
      setCustomLabel("");
    }
  }

  const allOptions = useMemo(() => {
    const merged = [
      ...BUILT_IN_CATEGORIES,
      ...customCategories.map((c) => ({ value: c, label: c })),
    ];
    // If the current category isn't in the merged list (e.g. legacy value),
    // surface it so the trigger label renders correctly.
    if (category && !merged.some((m) => m.value === category)) {
      merged.push({ value: category, label: category });
    }
    return merged;
  }, [customCategories, category]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, category, deadline });
  }

  return (
    <form onSubmit={handleSubmit}>
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
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            {showCustomInput ? (
              <div className="flex gap-2">
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="New category name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitCustomCategory();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={commitCustomCategory}>
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomLabel("");
                  }}
                  aria-label="Cancel custom category"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Select
                value={category || NO_CATEGORY_VALUE}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY_VALUE}>No category</SelectItem>
                  {allOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={ADD_CUSTOM_VALUE}>+ Add custom...</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              {deadline && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeadline("")}
                  aria-label="Clear deadline"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? mode === "create"
                ? "Adding..."
                : "Saving..."
              : mode === "create"
                ? "Add to list"
                : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function deadlineDisplay(
  deadline: string | null,
  completed: boolean,
): { label: string; tone: "default" | "soon" | "overdue" | "muted" } | null {
  if (!deadline) return null;
  const target = parseISO(deadline);
  if (completed) {
    return { label: `was due ${format(target, "MMM d, yyyy")}`, tone: "muted" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = differenceInCalendarDays(target, today);
  if (days < 0) {
    const n = Math.abs(days);
    return {
      label: `${n} day${n === 1 ? "" : "s"} overdue`,
      tone: "overdue",
    };
  }
  if (days === 0) return { label: "Due today", tone: "soon" };
  if (days === 1) return { label: "1 day remaining", tone: "soon" };
  if (days <= 7) return { label: `${days} days remaining`, tone: "soon" };
  return { label: `${days} days remaining`, tone: "default" };
}

function BucketItemRow({
  item,
  onToggle,
  onDelete,
  onEdit,
}: {
  item: BucketItem;
  onToggle: (completed: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const catLabel = categoryLabel(item.category);
  const dl = deadlineDisplay(item.deadline, item.completed);
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
          {catLabel && (
            <Badge variant="outline" className="font-normal text-xs">
              {catLabel}
            </Badge>
          )}
          {dl && (
            <Badge
              variant={dl.tone === "overdue" ? "destructive" : "secondary"}
              className={`font-normal text-xs gap-1 ${
                dl.tone === "soon"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : dl.tone === "muted"
                    ? "opacity-70"
                    : ""
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              {dl.label}
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
          {item.deadline && !item.completed
            ? ` · target ${format(parseISO(item.deadline), "MMM d, yyyy")}`
            : ""}
          {item.completed && item.completedAt
            ? ` · checked off ${format(parseISO(item.completedAt), "MMM d, yyyy")}`
            : ""}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Edit"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.li>
  );
}
