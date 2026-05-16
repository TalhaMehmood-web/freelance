/**
 * Transform image URLs — extend here to route through a CDN (e.g. CloudFront).
 * Currently a passthrough; swap `transformedUrl` logic when a CDN is configured.
 */
export function transformUrl(src?: string): string {
  if (!src) return ""
  return src
}
