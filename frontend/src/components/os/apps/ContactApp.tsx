import { useProfile } from "@/data/profile";
import { Mail, Github, Linkedin, FileText } from "lucide-react";
import { useState } from "react";

export function ContactApp() {
  const [sent, setSent] = useState(false);
  const { data: profile, isLoading, isError, error, refetch } = useProfile();

  if (isLoading) return <Message>loading contact channels...</Message>;
  if (isError)
    return (
      <Message action={() => refetch()}>contact channels unavailable: {error.message}</Message>
    );
  if (!profile) return <Message action={() => refetch()}>contact channels are empty.</Message>;

  return (
    <div className="grid gap-4 text-xs md:grid-cols-2">
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Open a channel</h2>
        <p className="text-muted-foreground">All transmissions are end-to-end relayed.</p>
        <ul className="mt-3 space-y-2">
          {profile.email && (
            <ContactRow
              icon={<Mail className="h-3.5 w-3.5" />}
              label="email"
              value={profile.email}
              href={`mailto:${profile.email}`}
            />
          )}
          {profile.githubUrl && (
            <ContactRow
              icon={<Github className="h-3.5 w-3.5" />}
              label="github"
              value={profile.githubUrl}
              href={profile.githubUrl}
            />
          )}
          {profile.linkedinUrl && (
            <ContactRow
              icon={<Linkedin className="h-3.5 w-3.5" />}
              label="linkedin"
              value={profile.linkedinUrl}
              href={profile.linkedinUrl}
            />
          )}
          {profile.resumeUrl && (
            <ContactRow
              icon={<FileText className="h-3.5 w-3.5" />}
              label="resume"
              value={profile.resumeUrl}
              href={profile.resumeUrl}
            />
          )}
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="space-y-2 rounded-lg border border-border/60 bg-white/[0.02] p-3"
      >
        <div className="text-[10px] uppercase tracking-widest text-cyan">// transmit</div>
        <input
          required
          placeholder="callsign / name"
          className="w-full rounded-md border border-border/60 bg-black/30 px-2 py-1.5 outline-none focus:border-cyan/60"
        />
        <input
          required
          type="email"
          placeholder="email"
          className="w-full rounded-md border border-border/60 bg-black/30 px-2 py-1.5 outline-none focus:border-cyan/60"
        />
        <textarea
          required
          rows={5}
          placeholder="message"
          className="w-full resize-none rounded-md border border-border/60 bg-black/30 px-2 py-1.5 outline-none focus:border-cyan/60"
        />
        <button
          type="submit"
          className="w-full rounded-md border border-cyan/50 bg-cyan/10 px-3 py-1.5 font-mono uppercase tracking-widest text-cyan transition hover:bg-cyan/20 hover:glow-cyan"
        >
          {sent ? "✓ transmitted" : "transmit"}
        </button>
      </form>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-md border border-border/60 bg-white/[0.02] px-3 py-2 transition hover:border-cyan/40"
      >
        <span className="flex items-center gap-2 text-cyan">
          {icon}
          <span className="text-[10px] uppercase tracking-widest">{label}</span>
        </span>
        <span className="font-mono text-foreground/80">{value}</span>
      </a>
    </li>
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
