import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, addMonths, addYears, format } from "date-fns";
import {
  useCreateLetter,
  getListLettersQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);

const PRESETS = [
  { label: "In a week", date: () => format(addDays(new Date(), 7), "yyyy-MM-dd") },
  { label: "In a month", date: () => format(addMonths(new Date(), 1), "yyyy-MM-dd") },
  { label: "In 6 months", date: () => format(addMonths(new Date(), 6), "yyyy-MM-dd") },
  { label: "In a year", date: () => format(addYears(new Date(), 1), "yyyy-MM-dd") },
];

export default function LetterNew() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [fromAuthor, setFromAuthor] = useState<"self" | "partner">("self");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [unsealsAt, setUnsealsAt] = useState(
    format(addMonths(new Date(), 1), "yyyy-MM-dd"),
  );

  const create = useCreateLetter({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLettersQueryKey() });
        toast({
          title: "Sealed.",
          description: "Your letter is waiting for the right day.",
        });
        navigate("/letters");
      },
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || !unsealsAt) return;
    create.mutate({
      data: {
        fromAuthor,
        subject: subject.trim() || null,
        body: body.trim(),
        unsealsAt,
      },
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-10">
        <p className="font-script text-2xl text-primary/80">A letter for later</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
          What do you want them
          <br />
          to read someday?
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Who's writing?</Label>
          <div className="flex flex-wrap gap-2">
            {(["self", "partner"] as const).map((a) => {
              const active = fromAuthor === a;
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => setFromAuthor(a)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                    active
                      ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                      : "bg-background border-border text-foreground/70 hover:text-foreground hover:bg-secondary",
                  )}
                >
                  {a === "self" ? "Me" : "My partner"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="subject"
            className="font-script text-base text-muted-foreground"
          >
            A small title (optional)
          </Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="For our first anniversary"
            className="text-xl h-auto py-3 px-4 font-serif border-0 border-b-2 border-border rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="body"
            className="font-script text-base text-muted-foreground"
          >
            Write the letter
          </Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="My love,&#10;&#10;If you're reading this, then..."
            rows={14}
            className="text-base leading-relaxed font-serif border-card-border bg-card/60 resize-none rounded-xl p-5"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="unsealsAt" className="text-sm font-medium">
            When should it be readable?
          </Label>
          <Input
            id="unsealsAt"
            type="date"
            value={unsealsAt}
            min={todayISO()}
            onChange={(e) => setUnsealsAt(e.target.value)}
            required
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setUnsealsAt(p.date())}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-background text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          {unsealsAt && unsealsAt > todayISO() && (
            <p className="font-script text-base text-primary/70">
              Sealed until {format(new Date(unsealsAt), "EEEE, MMMM d, yyyy")}
            </p>
          )}
          {unsealsAt && unsealsAt <= todayISO() && (
            <p className="text-sm text-muted-foreground">
              This letter will be readable right away.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={create.isPending}
            size="lg"
            className="rounded-full px-7"
          >
            {create.isPending ? "Sealing..." : "Seal this letter"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/letters")}
            disabled={create.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
