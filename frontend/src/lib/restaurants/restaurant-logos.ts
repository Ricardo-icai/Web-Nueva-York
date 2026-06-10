export function getRestaurantLogoCandidates(website?: string | null) {
  if (!website) return [];

  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    return [
      `https://www.google.com/s2/favicons?domain=${host}&sz=256`,
      `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
      `https://${host}/favicon.ico`,
      `https://${host}/apple-touch-icon.png`,
      `https://logo.clearbit.com/${host}`,
    ];
  } catch {
    return [];
  }
}
