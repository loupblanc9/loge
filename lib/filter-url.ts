import type { FilterState } from "@/types/filters";

export function parseFilters(sp: URLSearchParams): FilterState {
  const status = sp.getAll("status") as FilterState["status"];
  const activity = sp.getAll("activity") as FilterState["activity"];
  const tagIds = sp.getAll("tagId").length ? sp.getAll("tagId") : (sp.get("tagIds")?.split(",").filter(Boolean) ?? []);
  return {
    status: status.length ? status : [],
    activity: activity.length ? activity : [],
    missingDocuments: sp.get("missingDocuments") === "true" ? true : null,
    dossierComplet: sp.get("dossierComplet") === "true" ? true : null,
    tagIds,
    createdFrom: sp.get("createdFrom") ?? "",
    createdTo: sp.get("createdTo") ?? "",
    updatedFrom: sp.get("updatedFrom") ?? "",
    updatedTo: sp.get("updatedTo") ?? "",
    sort: sp.get("sort") ?? "updatedAt:desc",
    q: sp.get("q") ?? "",
  };
}

export function filtersToSearchParams(f: FilterState, preserve: URLSearchParams, pathname: string) {
  const sp = new URLSearchParams();
  const id = preserve.get("id");
  if (id && pathname.includes("/vue")) sp.set("id", id);
  f.status.forEach((s) => sp.append("status", s));
  f.activity.forEach((a) => sp.append("activity", a));
  if (f.missingDocuments === true) sp.set("missingDocuments", "true");
  if (f.dossierComplet === true) sp.set("dossierComplet", "true");
  f.tagIds.forEach((t) => sp.append("tagId", t));
  if (f.createdFrom) sp.set("createdFrom", f.createdFrom);
  if (f.createdTo) sp.set("createdTo", f.createdTo);
  if (f.updatedFrom) sp.set("updatedFrom", f.updatedFrom);
  if (f.updatedTo) sp.set("updatedTo", f.updatedTo);
  if (f.sort) sp.set("sort", f.sort);
  if (f.q) sp.set("q", f.q);
  sp.set("page", "1");
  return sp;
}

/** Paramètres pour GET /api/dossiers (sans `id` UI). */
export function toApiListParams(sp: URLSearchParams): string {
  const p = new URLSearchParams(sp.toString());
  p.delete("id");
  return p.toString();
}
