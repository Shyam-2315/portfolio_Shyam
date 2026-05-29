import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Update this to your real GitHub username
const GITHUB_USER = "shyam-patel";

const Input = z.object({ repo: z.string().min(1).max(100) }).optional();

export const getGitHubRepo = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => (d ? Input.parse(d) : undefined))
  .handler(async ({ data }) => {
    const repo = data?.repo;
    try {
      if (repo) {
        const r = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}`, {
          headers: { "User-Agent": "neural-os" },
        });
        if (!r.ok) return { stars: null, forks: null };
        const j = await r.json() as { stargazers_count: number; forks_count: number };
        return { stars: j.stargazers_count, forks: j.forks_count };
      }
      // user-level summary
      const r = await fetch(`https://api.github.com/users/${GITHUB_USER}`, {
        headers: { "User-Agent": "neural-os" },
      });
      if (!r.ok) return { stars: null, repos: null };
      const j = await r.json() as { public_repos: number; followers: number };
      return { repos: j.public_repos, followers: j.followers };
    } catch {
      return { stars: null };
    }
  });
