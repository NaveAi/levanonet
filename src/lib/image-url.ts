/** S3 / external URLs — Next.js image optimizer needs public read or unoptimized */
export function isRemoteImage(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
