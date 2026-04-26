import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateMemory,
  getListMemoriesQueryKey,
  getGetStatsOverviewQueryKey,
  getGetRecentMemoriesQueryKey,
  getGetMoodBreakdownQueryKey,
  getGetTagCloudQueryKey,
  getGetTimelineQueryKey,
  getGetOnThisDayQueryKey,
} from "@workspace/api-client-react";
import { MemoryForm, type MemoryFormValues } from "@/components/MemoryForm";
import { useToast } from "@/hooks/use-toast";

export default function MemoryNew() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = useCreateMemory({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentMemoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMoodBreakdownQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTagCloudQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTimelineQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOnThisDayQueryKey() });
        toast({ title: "Saved.", description: "One more page kept." });
        navigate(`/journal/${data.id}`);
      },
    },
  });

  function handleSubmit(values: MemoryFormValues) {
    create.mutate({
      data: {
        title: values.title,
        body: values.body,
        memoryDate: values.memoryDate,
        location: values.location || null,
        mood: values.mood || null,
        author: values.author,
        tags: values.tags,
        photos: values.photos,
      },
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-10">
        <p className="font-script text-2xl text-primary/80">A new page</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
          What do you want to remember?
        </h1>
      </header>
      <MemoryForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/journal")}
        isSubmitting={create.isPending}
        submitLabel="Keep this memory"
      />
    </div>
  );
}
