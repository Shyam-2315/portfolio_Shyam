import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Formula = {
  id: string;
  title: string;
  category: string;
  expr: string;
  note: string;
};

type ApiFormula = {
  id: number;
  title: string;
  subject: string | null;
  formula: string;
  explanation: string | null;
  tags: string[];
};

const mapFormula = (formula: ApiFormula): Formula => ({
  id: String(formula.id),
  title: formula.title,
  category: formula.subject ?? formula.tags[0] ?? "",
  expr: formula.formula,
  note: formula.explanation ?? "",
});

export async function fetchFormulas() {
  const formulas = await apiFetch<ApiFormula[]>("/api/formulas");
  return formulas.map(mapFormula);
}

export function useFormulas() {
  return useQuery({
    queryKey: ["formulas"],
    queryFn: fetchFormulas,
    retry: 2,
  });
}
