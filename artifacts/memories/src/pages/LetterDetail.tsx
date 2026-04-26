import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  format,
  parseISO,
  differenceInCalendarDays,
  differenceInDays,
} from "date-fns";
import {
  useGetLetter,
  useDeleteLetter,
  useMarkLetterRead,
  getGetLetterQueryKey,
  getListLettersQueryKey,
  type Letter,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Trash2, Lock, Mail } from "lucide-react";
import { AUTHOR_LABELS } from "@/lib/memory-meta";
import { useToast } from "@/hooks/use-toast";

export default function LetterDetail() {
  const [, params] = useRoute("/letters/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params?.id ?? "";
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [opening, setOpening] = useState(false);

  const { data: letter, isLoading } = useGetLetter(id, {
    query: { enabled: !!id, queryKey: getGetLetterQueryKey(id) },
  });

  const markRead = useMarkLetterRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLetterQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListLettersQueryKey() });
      },
    },
  });

  const del = useDeleteLetter({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLettersQueryKey() });
        toast({ title: "Letter removed.", description: "It's gone now." });
        navigate("/letters");
      },
    },
  });

  // Auto-mark as read once unsealed and opened (one-shot)
  useEffect(() => {
    if (letter && !letter.sealed && !letter.read && !markRead.isPending) {
      markRead.mutate({ id: letter.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter?.id, letter?.sealed, letter?.read]);

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">Finding the letter...</div>;
  }

  if (!letter) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h2 className="font-serif text-2xl font-semibold mb-2">Couldn't find it.</h2>
        <p className="text-muted-foreground mb-6">
          Maybe it was already torn up.
        </p>
        <Link href="/letters">
          <Button>Back to letters</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto">
      <Link
        href="/letters"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to letters
      </Link>

      {letter.sealed ? (
        <SealedView letter={letter} onDelete={() => setConfirmDelete(true)} />
      ) : (
        <OpenView letter={letter} opening={opening} setOpening={setOpening} onDelete={() => setConfirmDelete(true)} />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Tear up this letter?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {letter.sealed
                ? "It hasn't even been read yet. This can't be undone."
                : "This letter will be gone for good. Are you sure?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => del.mutate({ id: letter.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, tear it up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

function SealedView({
  letter,
  onDelete,
}: {
  letter: Letter;
  onDelete: () => void;
}) {
  const days = differenceInCalendarDays(parseISO(letter.unsealsAt), new Date());
  const totalWait = Math.max(
    1,
    differenceInDays(parseISO(letter.unsealsAt), parseISO(letter.createdAt)),
  );
  const waited = totalWait - days;
  const pct = Math.max(0, Math.min(100, (waited / totalWait) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-10"
    >
      <motion.div
        initial={{ rotate: -3, scale: 0.95 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-md aspect-[5/3] rounded-2xl bg-gradient-to-br from-card to-secondary border-2 border-dashed border-border shadow-lg flex items-center justify-center mb-8"
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <div className="text-center px-6">
          <p className="font-script text-lg text-muted-foreground mb-2">
            From {AUTHOR_LABELS[letter.fromAuthor]?.toLowerCase()}
          </p>
          <h2 className="font-serif text-2xl font-semibold mb-3">
            {letter.subject || "A sealed letter"}
          </h2>
          <p className="text-sm text-muted-foreground italic">
            Sealed on {format(parseISO(letter.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </motion.div>

      <p className="font-script text-3xl text-primary mb-2">
        {days === 1 ? "Just one more day." : `${days} days to wait.`}
      </p>
      <p className="text-foreground/70 mb-8">
        Opens on{" "}
        <span className="font-medium">
          {format(parseISO(letter.unsealsAt), "EEEE, MMMM d, yyyy")}
        </span>
      </p>

      <div className="max-w-xs mx-auto mb-12">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
          <span>Sealed</span>
          <span>{Math.round(pct)}% there</span>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={onDelete}
        className="text-destructive hover:text-destructive gap-1.5"
      >
        <Trash2 className="w-4 h-4" />
        Tear it up instead
      </Button>
    </motion.div>
  );
}

function OpenView({
  letter,
  opening,
  setOpening,
  onDelete,
}: {
  letter: Letter;
  opening: boolean;
  setOpening: (b: boolean) => void;
  onDelete: () => void;
}) {
  const wasFirstOpen = !letter.read;

  return (
    <div>
      {wasFirstOpen && !opening ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <motion.div
            whileHover={{ y: -4, rotate: -1 }}
            className="relative mx-auto w-full max-w-md aspect-[5/3] rounded-2xl bg-gradient-to-br from-card to-secondary border border-card-border shadow-xl flex items-center justify-center mb-8"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <Mail className="w-7 h-7" />
            </div>
            <div className="text-center px-6">
              <p className="font-script text-lg text-muted-foreground mb-2">
                From {AUTHOR_LABELS[letter.fromAuthor]?.toLowerCase()}
              </p>
              <h2 className="font-serif text-2xl font-semibold">
                {letter.subject || "A letter for you"}
              </h2>
            </div>
          </motion.div>

          <p className="font-script text-3xl text-primary mb-6">
            It's time. Open it?
          </p>
          <Button
            size="lg"
            className="rounded-full px-8 shadow-md"
            onClick={() => setOpening(true)}
          >
            Open the letter
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="mb-8">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <span className="font-script text-base">
                From {AUTHOR_LABELS[letter.fromAuthor]?.toLowerCase()}
              </span>
              <span>·</span>
              <span>
                Sealed{" "}
                {format(parseISO(letter.createdAt), "MMM d, yyyy")}, opened{" "}
                {format(parseISO(letter.unsealsAt), "MMM d, yyyy")}
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight">
              {letter.subject || "A letter for you"}
            </h1>
          </header>

          <div className="font-serif text-lg leading-[1.85] text-foreground/85 whitespace-pre-wrap">
            {letter.body}
          </div>

          <div className="flex items-center justify-end mt-12 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={onDelete}
              className="text-destructive hover:text-destructive gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
