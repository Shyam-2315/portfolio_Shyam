import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { fetchProject, type Project } from "@/data/projects";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/projects/$id")({
  loader: async ({ params }) => {
    try {
      const project = await fetchProject(params.id);
      return { project };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  head: ({ loaderData }) => {
    const proj = loaderData?.project;
    const title = proj ? `${proj.title} - Project` : "Project";
    const desc = proj?.description ?? "Project detail";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: ProjectPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-foreground">project not found</div>
  ),
});

const statusColor: Record<string, string> = {
  live: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
  "in-dev": "bg-cyan/15 text-cyan border-cyan/40",
  research: "bg-purple/15 text-purple border-purple/40",
  unknown: "bg-white/5 text-muted-foreground border-border/60",
};

function ProjectPage() {
  const { project: p } = Route.useLoaderData() as { project: Project };
  return (
    <div className="relative min-h-screen overflow-auto">
      <div className="absolute inset-0 grid-bg" />
      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-mono text-xs text-cyan hover:underline"
        >
          <ArrowLeft className="h-3 w-3" /> back to desktop
        </Link>

        <header className="mt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan">
            // module
          </div>
          <h1 className="mt-1 text-4xl font-semibold text-foreground">{p.title}</h1>
          {p.subtitle && <p className="mt-1 text-cyan">{p.subtitle}</p>}
          <span
            className={`mt-3 inline-block rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusColor[p.status] ?? statusColor.unknown}`}
          >
            {p.status}
          </span>
        </header>

        {p.description && (
          <p className="mt-6 leading-relaxed text-foreground/85">{p.description}</p>
        )}

        {p.features.length > 0 && (
          <section className="mt-8">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              // features
            </div>
            <ul className="mt-2 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="mt-2 h-1 w-1 rounded-full bg-cyan" /> {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.stack.length > 0 && (
          <section className="mt-8">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              // stack
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-cyan/30 bg-cyan/5 px-2 py-1 font-mono text-xs text-foreground/90"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-wrap gap-2">
          {p.github && (
            <a
              href={p.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-cyan/40 bg-cyan/5 px-3 py-1.5 text-sm text-cyan hover:bg-cyan/15"
            >
              <Github className="h-4 w-4" /> source
            </a>
          )}
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-purple/40 bg-purple/5 px-3 py-1.5 text-sm text-purple hover:bg-purple/15"
            >
              <ExternalLink className="h-4 w-4" /> live demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
