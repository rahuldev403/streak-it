// Use NEXT_PUBLIC_ for client-side access, fallback to server-side env
export const ADMIN_EMAILS = [
  (
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL
  )?.toLowerCase() || "",
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
