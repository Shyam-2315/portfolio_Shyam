import { useProjects } from "@/data/projects";
import { Github, ExternalLink, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getGitHubRepo } from "@/lib/github.functions";
import { TiltCard } from "../TiltCard";

const statusColor: Record<string, string> = {
  live: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
  "in-dev": "bg-cyan/15 text-cyan border-cyan/40",
  research: "bg-purple/15 text-purple border-purple/40",
};

export function ProjectsApp() {
  const { data: projects = [], isLoading, isError, error, refetch } = useProjects();

  if (isLoading) return <Message>loading projects...</Message>;
  if (isError)
    return <Message action={() => refetch()}>projects unavailable: {error.message}</Message>;
  if (projects.length === 0) return <Message action={() => refetch()}>no projects found.</Message>;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {projects.map((p) => (
        <TiltCard key={p.id} className="rounded-xl">
          <Link
            to="/projects/$id"
            params={{ id: p.id }}
            className="relative block overflow-hidden rounded-xl border border-border/70 bg-white/[0.02] p-4 transition hover:border-cyan/40 hover:bg-white/[0.04]"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan/10 blur-3xl opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                <p className="text-xs text-cyan">{p.subtitle}</p>
              </div>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusColor[p.status]}`}
              >
                {p.status}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/75">
              {p.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.stack.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <RepoStars id={p.id} repoUrl={p.github} />
              <span className="font-mono text-[10px] text-cyan">open module →</span>
            </div>
          </Link>
        </TiltCard>
      ))}
    </div>
  );
}

function Message({ children, action }: { children: React.ReactNode; action?: () => void }) {
  return (
    <div className="space-y-3 font-mono text-xs text-muted-foreground">
      <p>{children}</p>
      {action && (
        <button
          onClick={action}
          className="rounded-md border border-cyan/40 px-3 py-1 text-cyan hover:bg-cyan/10"
        >
          retry
        </button>
      )}
    </div>
  );
}

function RepoStars({ id, repoUrl }: { id: string; repoUrl?: string }) {
  const fn = useServerFn(getGitHubRepo);
  const { data } = useQuery({
    queryKey: ["gh-repo", id, repoUrl],
    queryFn: () => fn({ data: { repoUrl } }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: Boolean(repoUrl),
  });
  if (!data || data.stars === null || data.stars === undefined) {
    return <span className="font-mono text-[10px] text-muted-foreground">★ —</span>;
  }
  return (
    <span className="flex items-center gap-1 font-mono text-[10px] text-foreground/70">
      <Star className="h-3 w-3 text-cyan" />
      {data.stars} · forks {data.forks ?? 0}
    </span>
  );
}

// re-export so old imports still work
export { Github, ExternalLink };
