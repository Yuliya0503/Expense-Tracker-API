const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(
  username: unknown,
  email: unknown,
  password: unknown
): string | null {
  if (typeof username !== 'string') {
    return 'Username must be a string';
  }
  if (username.trim() === '') {
    return 'Username cannot be empty';
  }

  const normalizedEmail = (email as string).trim().toLowerCase();
  if (typeof email !== 'string') {
    return 'Email must be a string';
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return 'Invalid email format';
  }

  if (typeof password !== 'string') {
    return 'Password must be a string';
  }

  if (password.trim() === '') {
    return 'Password cannot be empty';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  return null;
}
