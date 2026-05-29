import { useEffect } from "react";
import { toast } from "sonner";
import { useGateData } from "@/data/gate";
import { useProfile } from "@/data/profile";
import { useProjects } from "@/data/projects";

export function LiveNotifications() {
  const { data: profile, isError: profileError } = useProfile();
  const { data: projects = [], isError: projectsError } = useProjects();
  const { data: gate, isError: gateError } = useGateData();

  useEffect(() => {
    const t0 = setTimeout(() => {
      if (profile) {
        toast.success(`Welcome back, ${profile.name}`, {
          description: profile.role || "Profile loaded from backend",
          className: "font-mono",
        });
      } else if (profileError) {
        toast.error("Portfolio API unavailable", {
          description: "Live profile data could not be loaded",
          className: "font-mono",
        });
      }
    }, 1200);

    return () => clearTimeout(t0);
  }, [profile, profileError]);

  useEffect(() => {
    const items = [
      projects.length > 0
        ? { title: "projects", desc: `${projects.length} projects loaded from backend` }
        : projectsError
          ? { title: "projects", desc: "backend unavailable" }
          : null,
      gate
        ? {
            title: "gate nexus",
            desc: `${gate.subjects.length} subjects - ${gate.mistakeCount} open mistakes`,
          }
        : gateError
          ? { title: "gate nexus", desc: "backend unavailable" }
          : null,
    ].filter(Boolean) as { title: string; desc: string }[];

    if (items.length === 0) return;
    let i = 0;
    const id = setInterval(() => {
      const n = items[i % items.length];
      toast(n.title, { description: n.desc, className: "font-mono" });
      i++;
    }, 22000);
    return () => clearInterval(id);
  }, [gate, gateError, projects, projectsError]);

  return null;
}
