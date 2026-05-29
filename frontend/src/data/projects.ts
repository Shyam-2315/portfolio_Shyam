import { useQuery } from "@tanstack/react-query";
import { apiFetch, resolveUploadUrl } from "@/lib/api";

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  stack: string[];
  status: string;
  github?: string;
  demo?: string;
  screenshots: string[];
  architectureImageUrl?: string;
};

type ApiProject = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: string | null;
  tech_stack: string[];
  features: string[];
  github_url: string | null;
  live_url: string | null;
  screenshots: string[];
  architecture_image_url: string | null;
};

const mapProject = (project: ApiProject): Project => ({
  id: String(project.id),
  title: project.title,
  subtitle: project.subtitle ?? "",
  description: project.description ?? "",
  status: project.status ?? "unknown",
  stack: project.tech_stack,
  features: project.features,
  github: project.github_url ?? undefined,
  demo: project.live_url ?? undefined,
  screenshots: project.screenshots.map(resolveUploadUrl).filter(Boolean) as string[],
  architectureImageUrl: resolveUploadUrl(project.architecture_image_url),
});

export async function fetchProjects() {
  const projects = await apiFetch<ApiProject[]>("/api/projects");
  return projects.map(mapProject);
}

export async function fetchProject(id: string) {
  const project = await apiFetch<ApiProject>(`/api/projects/${id}`);
  return mapProject(project);
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    retry: 2,
  });
}
