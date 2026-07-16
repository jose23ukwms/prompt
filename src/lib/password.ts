import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string | null | undefined
): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export type PasswordValidation = {
  valid: boolean;
  errors: string[];
  strength: "weak" | "fair" | "good" | "strong";
};

export function validatePassword(pw: string): PasswordValidation {
  const errors: string[] = [];
  if (!pw || pw.length < 8) errors.push("Password minimal 8 karakter.");
  if (!/[A-Za-z]/.test(pw)) errors.push("Password harus mengandung huruf.");
  if (!/[0-9]/.test(pw)) errors.push("Password harus mengandung angka.");

  let strength: PasswordValidation["strength"] = "weak";
  if (pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) strength = "fair";
  if (pw.length >= 10 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw)) strength = "good";
  if (pw.length >= 12 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) strength = "strong";

  return { valid: errors.length === 0, errors, strength };
}
