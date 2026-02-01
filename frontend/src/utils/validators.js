export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  const hasAlphabet = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+{}[\]:;<>,.?]/g.test(password);

  if (!hasAlphabet || !hasDigit || !hasSpecial) {
    return { valid: false, error: 'Password must contain letters, numbers, and special characters' };
  }
  return { valid: true };
};
