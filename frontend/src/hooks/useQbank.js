import { useQuery } from "@tanstack/react-query";
import { loadCatalog } from "@/lib/qbank";

export const useCatalog = () => useQuery({ queryKey: ["catalog"], queryFn: loadCatalog });

export function useSubject(sid) {
  const q = useCatalog();
  const subject = q.data?.flatMap((s) => s.subjects).find((s) => s.id === sid);
  return { ...q, subject };
}
