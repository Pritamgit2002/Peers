type TQueryParams = Record<string, string | undefined>;

export function buildQueryString(params: TQueryParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  }

  return searchParams.toString();
}
