export const appBase = import.meta.env.BASE_URL;

export function assetPath(path: string) {
  return `${appBase}${path.replace(/^\//, "")}`;
}
