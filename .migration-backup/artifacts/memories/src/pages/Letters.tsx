import { Link } from "wouter";
import { motion } from "framer-motion";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import {
  useListLetters,
  getListLettersQueryKey,
  type Letter,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, Lock, PenLine, Sparkles } from "lucide-react";
import { AUTHOR_LABELS } from "@/lib/memory-meta";

export default function Letters() {
  const { data: letters, isLoading } = useListLetters({
    query: { queryKey: getListLettersQueryKey() },
  });

  const sealed = letters?.filter((l) => l.sealed) ?? [];
  const open = letters?.filter((l) => !l.sealed) ?? [];

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <p className="font-script text-2xl text-primary/80">For the future</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
            Letters to each other,
            <br />
            <span className="italic">sealed for later.</span>
          </h1>
          <p className="text-foreground/65 max-w-xl mt-3 leading-relaxed">
            Write something today and choose the day it can be read. A note for
            an anniversary, a hard week, a quiet Tuesday a year from now.
          </p>
        </div>
        <Link href="/letters/new">
          <Button size="lg" className="rounded-full px-6 gap-2 shadow-md">
            <PenLine className="w-4 h-4" />
            Write a letter
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Looking through the post...</div>
      ) : !letters || letters.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {open.length > 0 && (
            <section>
              <SectionHeader
                kicker="Ready to read"
                title="In the mailbox"
                count={open.length}
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {open.map((l) => (
                  <OpenLetterCard key={l.id} letter={l} />
                ))}
              </div>
            </section>
          )}

          {sealed.length > 0 && (
            <section>
              <SectionHeader
                kicker="Coming someday"
                title="Still sealed"
                count={sealed.length}
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {sealed.map((l) => (
                  <SealedLetterCard key={l.id} letter={l} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  count,
}: {
  kicker: string;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="font-script text-xl text-primary/80">{kicker}</p>
        <h2 className="font-serif text-3xl font-semibold tracking-tight">{title}</h2>
      </div>
      <span className="text-sm text-muted-foreground tabular-nums pb-1">
        {count} {count === 1 ? "letter" : "letters"}
      </span>
    </div>
  );
}

function OpenLetterCard({ letter }: { letter: Letter }) {
  return (
    <Link href={`/letters/${letter.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        className="paper-card rounded-2xl p-5 cursor-pointer hover-elevate h-full flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: letter.read
                ? "color-mix(in oklab, hsl(var(--muted-foreground)) 18%, transparent)"
                : "color-mix(in oklab, hsl(var(--primary)) 18%, transparent)",
              color: letter.read ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))",
            }}
          >
            {letter.read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          </div>
          {!letter.read && (
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
          From {AUTHOR_LABELS[letter.fromAuthor]?.toLowerCase() ?? letter.fromAuthor}
        </div>
        <h3 className="font-serif text-xl font-semibold leading-snug mb-2 flex-1">
          {letter.subject || "An unnamed letter"}
        </h3>
        <p className="font-script text-base text-muted-foreground">
          Unsealed {format(parseISO(letter.unsealsAt), "MMM d, yyyy")}
        </p>
      </motion.div>
    </Link>
  );
}

function SealedLetterCard({ letter }: { letter: Letter }) {
  const days = differenceInCalendarDays(parseISO(letter.unsealsAt), new Date());

  return (
    <Link href={`/letters/${letter.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, rotate: -0.5 }}
        className="relative rounded-2xl p-5 cursor-pointer h-full flex flex-col overflow-hidden border-2 border-dashed border-border bg-gradient-to-br from-secondary/40 to-card"
      >
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-primary/8 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
              <Lock className="w-4 h-4 text-foreground/50" />
            </div>
            <span className="font-script text-base text-primary/80 tabular-nums">
              {days <= 0 ? "today" : `in ${days} ${days === 1 ? "day" : "days"}`}
            </span>
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            From {AUTHOR_LABELS[letter.fromAuthor]?.toLowerCase() ?? letter.fromAuthor}
          </div>
          <h3 className="font-serif text-xl font-semibold leading-snug mb-2 text-foreground/70">
            {letter.subject || "Sealed letter"}
          </h3>
          <p className="text-sm text-muted-foreground italic">
            Opens {format(parseISO(letter.unsealsAt), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="paper-card rounded-3xl p-12 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-serif text-2xl font-semibold mb-2">
        No letters yet.
      </h3>
      <p className="text-muted-foreground mb-6">
        Write one to be opened a year from now, or on your next anniversary.
      </p>
      <Link href="/letters/new">
        <Button size="lg" className="rounded-full px-7">
          Write the first one
        </Button>
      </Link>
    </div>
  );
}
