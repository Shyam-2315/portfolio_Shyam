import { useCertifications } from "@/data/certifications";
import { BadgeCheck } from "lucide-react";

export function CertificationsApp() {
  const { data: certifications = [], isLoading, isError, error, refetch } = useCertifications();

  if (isLoading) return <Message>loading certifications...</Message>;
  if (isError)
    return <Message action={() => refetch()}>certifications unavailable: {error.message}</Message>;

  return (
    <div className="space-y-3 text-xs">
      <header>
        <h2 className="text-base font-semibold text-foreground">Certifications</h2>
        <p className="text-muted-foreground">Verified credentials</p>
      </header>
      {certifications.length === 0 && (
        <Message action={() => refetch()}>no certifications found.</Message>
      )}
      <div className="grid gap-2 md:grid-cols-2">
        {certifications.map((c) => (
          <div
            key={c.id}
            className="group relative overflow-hidden rounded-lg border border-border/60 bg-white/[0.02] p-3 transition hover:border-cyan/40"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan/40 bg-cyan/10 text-cyan">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{c.title}</div>
                <div className="text-[10px] text-muted-foreground">
                  {c.issuer}
                  {c.date ? ` - ${c.date}` : ""}
                </div>
                {c.verify && (
                  <a
                    href={c.verify}
                    className="mt-1 inline-block text-[11px] text-cyan hover:underline"
                  >
                    verify -&gt;
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
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
