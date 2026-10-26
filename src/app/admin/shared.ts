export type UploadKind = "project" | "logo" | "font";

export async function uploadFile(file: File, kind: UploadKind, slug = "") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  fd.append("slug", slug);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data as { path: string; family?: string };
}

/** Move one item in a list from index `from` to index `to`. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}
