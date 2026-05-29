import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useProfile } from "@/data/profile";
import { useProjects } from "@/data/projects";

type Props = { onOpen?: (id: string) => void };

const banner = [
  "Neural Terminal v2.6.1 - JARVIS uplink active",
  "type 'help' for commands - or ask anything in natural language",
];

const help = [
  "help                show this menu",
  "whoami              identity probe",
  "projects            list active projects",
  "open <app>          open an app (pdfcraft|soc|gate|notes|projects|about)",
  "clear               clear screen",
  "-  or just ask: 'summarize my projects' or 'quiz me on TCP'  -",
];

export function TerminalApp({ onOpen }: Props) {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile();
  const { data: projects = [], isLoading: projectsLoading, isError: projectsError } = useProjects();
  const [local, setLocal] = useState<{ kind: "in" | "out" | "ai"; text: string }[]>(
    banner.map((b) => ({ kind: "out" as const, text: b })),
  );
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const promptUser = profile?.name?.split(/\s+/)[0]?.toLowerCase() || "operator";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [local, messages, status]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function pushOut(...lines: string[]) {
    setLocal((l) => [...l, ...lines.map((t) => ({ kind: "out" as const, text: t }))]);
  }

  function handleLocal(raw: string): boolean {
    const cmd = raw.trim();
    setLocal((l) => [...l, { kind: "in", text: cmd }]);
    if (!cmd) return true;
    const [head, ...rest] = cmd.split(/\s+/);
    switch (head) {
      case "help":
        pushOut(...help);
        return true;
      case "clear":
        setLocal([]);
        return true;
      case "whoami":
        if (profileLoading) pushOut("loading profile from backend...");
        else if (profileError || !profile)
          pushOut("profile unavailable - backend offline or empty");
        else pushOut(`${profile.name}${profile.role ? ` - ${profile.role}` : ""}`);
        return true;
      case "projects":
        if (projectsLoading) pushOut("loading projects from backend...");
        else if (projectsError) pushOut("projects unavailable - backend offline");
        else if (projects.length === 0) pushOut("no projects found");
        else
          pushOut(
            ...projects.map(
              (project) => `${project.title}${project.subtitle ? ` - ${project.subtitle}` : ""}`,
            ),
          );
        return true;
      case "open": {
        const map: Record<string, string> = {
          pdfcraft: "pdfcraft",
          soc: "soc",
          gate: "gate",
          notes: "notes",
          projects: "projects",
          about: "about",
        };
        const t = rest[0];
        if (t && map[t]) {
          onOpen?.(map[t]);
          pushOut(`-> launching ${t}...`);
        } else {
          pushOut(`unknown app: ${t ?? "(none)"}`);
        }
        return true;
      }
    }
    return false;
  }

  function submit() {
    const raw = input;
    setInput("");
    const handled = handleLocal(raw);
    if (!handled) {
      setLocal((l) => [...l, { kind: "ai", text: "__JARVIS_STREAM__" }]);
      void sendMessage({ text: raw });
    }
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const aiText = lastAssistant?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
  const thinking = status === "submitted";

  return (
    <div
      className="flex h-full flex-col font-mono text-[12px]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-auto rounded-md bg-black/40 p-3">
        {local.map((l, i) => {
          if (l.kind === "in")
            return (
              <div key={i} className="text-foreground">
                <span className="text-cyan">{promptUser}@neural-os</span>
                <span className="text-muted-foreground">:~$</span> {l.text}
              </div>
            );
          if (l.kind === "ai")
            return (
              <div key={i} className="my-1 border-l-2 border-purple/60 pl-2 text-foreground/90">
                <span className="text-[10px] uppercase tracking-widest text-purple">jarvis</span>{" "}
                {thinking && !aiText ? (
                  <span className="text-muted-foreground">
                    thinking<span className="blink">...</span>
                  </span>
                ) : null}
                {aiText && <span className="whitespace-pre-wrap">{aiText}</span>}
              </div>
            );
          return (
            <div key={i} className="text-foreground/80">
              {l.text}
            </div>
          );
        })}
        <div className="flex items-center text-foreground">
          <span className="text-cyan">{promptUser}@neural-os</span>
          <span className="text-muted-foreground">:~$</span>&nbsp;
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            className="flex-1 bg-transparent outline-none"
            disabled={status === "streaming"}
            autoFocus
          />
          <span className="blink text-cyan">|</span>
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
