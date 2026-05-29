import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const API_BASE_URL = process.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

async function backendJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function buildSystemPrompt() {
  const [profile, projects, subjects, mockTests, mistakes] = await Promise.all([
    backendJson<Record<string, unknown>>("/api/profile"),
    backendJson<Array<Record<string, unknown>>>("/api/projects"),
    backendJson<Array<Record<string, unknown>>>("/api/gate/subjects"),
    backendJson<Array<Record<string, unknown>>>("/api/gate/mock-tests"),
    backendJson<Array<Record<string, unknown>>>("/api/gate/mistakes"),
  ]);

  const projectLines = projects
    ?.map(
      (project) =>
        `${project.title ?? "Untitled"} - ${project.subtitle ?? "No subtitle"} (${project.status ?? "unknown"})`,
    )
    .join(" | ");
  const avg = mockTests?.length
    ? Math.round(
        mockTests.reduce((total, test) => {
          const score = Number(test.score ?? 0);
          const totalMarks = Number(test.total_marks ?? 0);
          return total + (totalMarks > 0 ? (score / totalMarks) * 100 : 0);
        }, 0) / mockTests.length,
      )
    : null;

  return `You are JARVIS, the in-house AI assistant inside this portfolio OS.

Personality: confident, technically sharp, cinematic, and concise. Use 1-3 short paragraphs unless asked for depth. Refer to the user as "Operator" when appropriate. Use occasional terminal-style markers like [ok] or ->.

Use only backend API context for portfolio-specific answers. If backend context is unavailable, say the live portfolio API is currently unavailable and avoid inventing portfolio details.

Live backend context:
NAME: ${profile?.name ?? "unavailable"}
ROLE: ${profile?.role ?? "unavailable"}
LOCATION: ${profile?.location ?? "unavailable"}
SKILLS: ${Array.isArray(profile?.skills) ? profile.skills.join(", ") : "unavailable"}
PROJECTS: ${projectLines || "unavailable"}
GATE: ${subjects?.length ?? 0} subjects, ${mistakes?.length ?? 0} mistakes${avg === null ? "" : `, mock avg ${avg}%`}.

You can answer about the portfolio data above, GATE prep data above, or general AI/backend/cybersecurity/CS theory questions. When asked to quiz the operator, ask one crisp question and wait. Never claim to perform real actions on systems.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: await buildSystemPrompt(),
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
