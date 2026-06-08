export const isValidPhone = (value: string): boolean => {
  if (!value) return true;
  return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(value.trim());
};

export const isValidCep = (value: string): boolean => {
  if (!value) return true;
  return /^\d{5}-?\d{3}$/.test(value.trim());
};

export const isValidCnpj = (value: string): boolean => {
  if (!value) return false;
  return /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(value.trim());
};
