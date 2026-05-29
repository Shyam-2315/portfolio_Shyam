import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, Send, X } from "lucide-react";

const suggestions = [
  "Summarize my projects",
  "Quiz me on TCP congestion control",
  "Explain MITRE ATT&CK in 3 lines",
  "What's my weakest GATE subject?",
];

export function JarvisWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Listen for global "open jarvis" event
  useEffect(() => {
    const fn = () => setOpen(true);
    window.addEventListener("neural:open-jarvis", fn);
    return () => window.removeEventListener("neural:open-jarvis", fn);
  }, []);

  function send(text: string) {
    if (!text.trim()) return;
    void sendMessage({ text });
    setInput("");
  }

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="pointer-events-auto absolute right-4 top-12 z-40 max-w-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass-strong flex items-center gap-2 rounded-full border-border/60 px-3 py-1.5 font-mono text-[11px] text-cyan glow-cyan transition hover:bg-white/5"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
        </span>
        <Sparkles className="h-3 w-3" /> JARVIS
        <span className="text-muted-foreground">· {busy ? "thinking…" : "online"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="glass-strong mt-2 flex w-[360px] max-w-[92vw] flex-col rounded-2xl border-border/60 shadow-2xl glow-cyan"
            style={{ height: 440 }}
          >
            <header className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan">
                <Sparkles className="h-3 w-3" /> JARVIS · ai uplink
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-3 text-xs">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Ask me anything about the live portfolio data, or just nerd out.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-md border border-cyan/40 bg-cyan/5 px-2 py-1 text-[11px] text-cyan transition hover:bg-cyan/15"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-lg bg-cyan/15 px-3 py-1.5 text-foreground">
                        {text}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="border-l-2 border-purple/60 pl-2 text-foreground/90">
                    <div className="text-[10px] uppercase tracking-widest text-purple">jarvis</div>
                    <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
                  </div>
                );
              })}

              {status === "submitted" && (
                <div className="border-l-2 border-purple/60 pl-2 font-mono text-muted-foreground">
                  thinking<span className="blink">…</span>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-destructive-foreground">
                  uplink failure — {error.message}
                </div>
              )}
            </div>

            <form
              className="flex items-center gap-2 border-t border-border/60 p-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
                placeholder="ask jarvis…"
                className="flex-1 rounded-md border border-border/60 bg-black/30 px-2 py-1.5 font-mono text-[11px] outline-none focus:border-cyan/60 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-7 w-7 place-items-center rounded-md border border-cyan/50 bg-cyan/10 text-cyan transition hover:bg-cyan/20 disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
