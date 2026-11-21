export function mediaUrl(base: string | undefined, path: string): string {
  const objectPath = path.split("/").map(encodeURIComponent).join("/");
  return `${base?.replace(/\/+$/, "") ?? ""}/${objectPath}`;
}
