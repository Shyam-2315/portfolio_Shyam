import { useQuery } from "@tanstack/react-query";
import { apiFetch, resolveUploadUrl } from "@/lib/api";

export type Note = {
  id: string;
  title: string;
  category: string;
  tag: string;
  preview: string;
  fileUrl?: string;
};

type ApiNote = {
  id: number;
  title: string;
  subject: string | null;
  description: string | null;
  file_url: string | null;
  tags: string[];
  is_important: boolean;
};

const mapNote = (note: ApiNote): Note => ({
  id: String(note.id),
  title: note.title,
  category: note.subject ?? "",
  tag: note.is_important ? "high" : (note.tags[0] ?? ""),
  preview: note.description ?? "",
  fileUrl: resolveUploadUrl(note.file_url),
});

export async function fetchNotes() {
  const notes = await apiFetch<ApiNote[]>("/api/notes");
  return notes.map(mapNote);
}

export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    retry: 2,
  });
}
