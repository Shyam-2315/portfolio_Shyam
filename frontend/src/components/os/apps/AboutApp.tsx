import { useProfile } from "@/data/profile";
import { Github, Linkedin, Mail, FileText } from "lucide-react";

export function AboutApp() {
  const { data: profile, isLoading, isError, error, refetch } = useProfile();

  if (isLoading) return <Message>loading profile...</Message>;
  if (isError)
    return <Message action={() => refetch()}>profile unavailable: {error.message}</Message>;
  if (!profile) return <Message action={() => refetch()}>profile is empty.</Message>;

  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5 font-mono text-sm">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-cyan/40 glow-cyan">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-cyan/30 to-purple/30 text-2xl font-bold text-foreground">
              {initials}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            user_profile
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">{profile.name}</h2>
          <p className="text-cyan">{profile.role}</p>
          {profile.location && <p className="text-xs text-muted-foreground">{profile.location}</p>}
        </div>
      </div>

      {profile.intro && <p className="text-foreground/80 leading-relaxed">{profile.intro}</p>}

      {profile.education.length > 0 && (
        <Section title="Education">
          {profile.education.map((item) => (
            <div key={item} className="border-b border-border/40 py-1.5">
              <span>{item}</span>
            </div>
          ))}
        </Section>
      )}

      {Object.values(profile.skills).some((skills) => skills.length > 0) && (
        <Section title="Skills">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(profile.skills).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-cyan">{k}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {v.map((s) => (
                    <span key={s} className="rounded-md bg-white/5 px-2 py-0.5 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {profile.interests.length > 0 && (
        <Section title="Interests">
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((i) => (
              <span
                key={i}
                className="rounded-md border border-purple/40 bg-purple/10 px-2 py-1 text-xs text-purple"
              >
                {i}
              </span>
            ))}
          </div>
        </Section>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {profile.githubUrl && (
          <LinkBtn href={profile.githubUrl} icon={<Github className="h-3.5 w-3.5" />}>
            GitHub
          </LinkBtn>
        )}
        {profile.linkedinUrl && (
          <LinkBtn href={profile.linkedinUrl} icon={<Linkedin className="h-3.5 w-3.5" />}>
            LinkedIn
          </LinkBtn>
        )}
        {profile.email && (
          <LinkBtn href={`mailto:${profile.email}`} icon={<Mail className="h-3.5 w-3.5" />}>
            Email
          </LinkBtn>
        )}
        {profile.resumeUrl && (
          <LinkBtn href={profile.resumeUrl} icon={<FileText className="h-3.5 w-3.5" />}>
            Resume
          </LinkBtn>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        // {title}
      </div>
      {children}
    </div>
  );
}
function LinkBtn({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-md border border-cyan/40 bg-cyan/5 px-3 py-1.5 text-xs text-cyan transition hover:bg-cyan/15 hover:glow-cyan"
    >
      {icon}
      {children}
    </a>
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
