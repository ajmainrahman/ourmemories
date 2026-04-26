import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMemory,
  useUpdateMemory,
  getGetMemoryQueryKey,
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

export default function MemoryEdit() {
  const [, params] = useRoute("/journal/:id/edit");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params?.id ?? "";

  const { data: memory, isLoading } = useGetMemory(id, {
    query: { enabled: !!id, queryKey: getGetMemoryQueryKey(id) },
  });

  const update = useUpdateMemory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMemoryQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentMemoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMoodBreakdownQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTagCloudQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTimelineQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOnThisDayQueryKey() });
        toast({ title: "Updated.", description: "The page is saved." });
        navigate(`/journal/${id}`);
      },
    },
  });

  if (isLoading || !memory) {
    return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  }

  function handleSubmit(values: MemoryFormValues) {
    update.mutate({
      id,
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
        <p className="font-script text-2xl text-primary/80">Editing</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
          A small revision.
        </h1>
      </header>
      <MemoryForm
        initial={{
          title: memory.title,
          body: memory.body,
          memoryDate: memory.memoryDate,
          location: memory.location ?? "",
          mood: memory.mood ?? "",
          author: memory.author,
          tags: memory.tags,
          photos: memory.photos,
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/journal/${id}`)}
        isSubmitting={update.isPending}
        submitLabel="Save changes"
      />
    </div>
  );
}
