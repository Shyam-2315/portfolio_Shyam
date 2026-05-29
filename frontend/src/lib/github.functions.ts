import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ repoUrl: z.string().url().optional() }).optional();

function repoPath(repoUrl?: string) {
  if (!repoUrl) return null;
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== "github.com") return null;
    const [owner, repo] = url.pathname.replace(/^\/|\/$/g, "").split("/");
    if (!owner || !repo) return null;
    return `${owner}/${repo.replace(/\.git$/, "")}`;
  } catch {
    return null;
  }
}

export const getGitHubRepo = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => (d ? Input.parse(d) : undefined))
  .handler(async ({ data }) => {
    const path = repoPath(data?.repoUrl);
    if (!path) return { stars: null, forks: null };

    try {
      const r = await fetch(`https://api.github.com/repos/${path}`, {
        headers: { "User-Agent": "neural-os" },
      });
      if (!r.ok) return { stars: null, forks: null };
      const j = (await r.json()) as { stargazers_count: number; forks_count: number };
      return { stars: j.stargazers_count, forks: j.forks_count };
    } catch {
      return { stars: null, forks: null };
    }
  });
