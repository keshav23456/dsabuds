export const validators = {
  required: (value: string) => !value ? 'This field is required' : '',

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Invalid email address' : '';
  },

  minLength: (min: number) => (value: string) => {
    return value.length < min ? `Must be at least ${min} characters` : '';
  },

  maxLength: (max: number) => (value: string) => {
    return value.length > max ? `Must be at most ${max} characters` : '';
  },

  password: (value: string) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return '';
  },

  username: (value: string) => {
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  },
};
