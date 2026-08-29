export function withCurrentSearch(path, search) {
  if (!search || path.includes('?')) return path;
  return `${path}${search}`;
}
