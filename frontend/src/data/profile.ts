import { useQuery } from "@tanstack/react-query";
import { apiFetch, resolveUploadUrl } from "@/lib/api";

export type Profile = {
  id: number;
  name: string;
  role: string;
  intro: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  profileImageUrl?: string;
  education: string[];
  location?: string;
  interests: string[];
  skills: Record<string, string[]>;
};

type ApiProfile = {
  id: number;
  name: string | null;
  role?: string | null;
  intro?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  resume_url?: string | null;
  profile_image_url?: string | null;
  education?: string | null;
  location?: string | null;
  interests?: string[] | null;
  skills?: string[] | null;
};

const splitLines = (value: string | null) =>
  value
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean) ?? [];

const mapProfile = (profile: ApiProfile): Profile => ({
  id: profile.id,
  name: profile.name ?? "",
  role: profile.role ?? "",
  intro: profile.intro ?? "",
  email: profile.email ?? undefined,
  linkedinUrl: profile.linkedin_url ?? undefined,
  githubUrl: profile.github_url ?? undefined,
  resumeUrl: resolveUploadUrl(profile.resume_url),
  profileImageUrl: resolveUploadUrl(profile.profile_image_url),
  education: splitLines(profile.education ?? null),
  location: profile.location ?? undefined,
  interests: Array.isArray(profile.interests) ? profile.interests : [],
  skills: { skills: Array.isArray(profile.skills) ? profile.skills : [] },
});

export async function fetchProfile() {
  const profile = await apiFetch<ApiProfile | null>("/api/profile");
  return profile ? mapProfile(profile) : null;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    retry: 2,
  });
}
