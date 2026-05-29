import { useQuery } from "@tanstack/react-query";
import { apiFetch, resolveUploadUrl } from "@/lib/api";

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  verify?: string;
  imageUrl?: string;
};

type ApiCertification = {
  id: number;
  title: string;
  issuer: string;
  issue_date: string | null;
  credential_id: string | null;
  verify_url: string | null;
  image_url: string | null;
};

const mapCertification = (certification: ApiCertification): Certification => ({
  id: String(certification.id),
  title: certification.title,
  issuer: certification.issuer,
  date: certification.issue_date ?? certification.credential_id ?? "",
  verify: certification.verify_url ?? undefined,
  imageUrl: resolveUploadUrl(certification.image_url),
});

export async function fetchCertifications() {
  const certifications = await apiFetch<ApiCertification[]>("/api/certifications");
  return certifications.map(mapCertification);
}

export function useCertifications() {
  return useQuery({
    queryKey: ["certifications"],
    queryFn: fetchCertifications,
    retry: 2,
  });
}
