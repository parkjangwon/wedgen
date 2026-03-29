"use client";

import { useState, useCallback } from "react";

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (validate) {
      const validationErrors = validate({ ...values, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
    }
  }, [values, validate]);

  const setTouchedField = useCallback(<K extends keyof T>(field: K, isTouched: boolean = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleChange = useCallback(<K extends keyof T>(field: K) => (value: T[K]) => {
    setValue(field, value);
  }, [setValue]);

  const handleBlur = useCallback(<K extends keyof T>(field: K) => () => {
    setTouchedField(field);
  }, [setTouchedField]);

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(
      Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      )
    );

    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validateForm, onSubmit, values]);

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
    setValue,
    setValues,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    reset,
  };
}
