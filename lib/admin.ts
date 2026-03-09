const parseEnvEmails = (...rawValues: Array<string | undefined>) => {
  const values = rawValues.filter(Boolean).flatMap((value) =>
    String(value)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );

  return Array.from(new Set(values));
};

// Client can only read NEXT_PUBLIC_* values; server can read both.
export const ADMIN_EMAILS = parseEnvEmails(
  process.env.NEXT_PUBLIC_ADMIN_EMAILS,
  process.env.ADMIN_EMAILS,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  process.env.ADMIN_EMAIL,
);

export const SUPER_ADMIN_EMAILS = parseEnvEmails(
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS,
  process.env.SUPER_ADMIN_EMAILS,
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL,
  process.env.SUPER_ADMIN_EMAIL,
);

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isAdminByMetadata(flag: unknown): boolean {
  return flag === true;
}

export function hasAdminAccess(
  email: string | null | undefined,
  metadataFlag?: unknown,
): boolean {
  return (
    isSuperAdmin(email) || isAdmin(email) || isAdminByMetadata(metadataFlag)
  );
}
