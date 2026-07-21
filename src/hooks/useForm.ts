import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

type Values = Record<string, unknown>;
type Errors = Record<string, string>;
type ValidationRules<V extends Values> = Partial<Record<keyof V, (value: unknown) => string>>;

export function useForm<V extends Values>(initialValues: V, validationRules: ValidationRules<V> = {}) {
  const [values, setValues] = useState<V>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const rule = validationRules[name as keyof V];
    if (rule) {
      const error = rule(values[name as keyof V]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validationRules, values]);

  const validate = useCallback(() => {
    const newErrors: Errors = {};
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof V];
      const error = rule?.(values[field as keyof V]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, values]);

  const handleSubmit = useCallback((onSubmit: (values: V) => unknown | Promise<unknown>) => async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validate()) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [validate, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setValues,
  };
}
