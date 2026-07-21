import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/store/useUserStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const formatDate = (date: string | number | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function getErrorMessage(error: any): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.response?.status === 429) {
    const apiError = error.response?.data?.error;
    if (typeof apiError === "string") return apiError;
    return "Too many requests. Please try again later.";
  }
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    if (typeof apiError === "string") return apiError;
    if (typeof apiError === "object") {
      const messages: string[] = [];
      for (const [key, value] of Object.entries<any>(apiError)) {
        if (key !== "_errors" && value?._errors?.length) {
          messages.push(`${key}: ${value._errors.join(", ")}`);
        }
      }
      if (messages.length) return messages.join(" | ");
      if (apiError._errors?.length) return apiError._errors.join(", ");
    }
  }
  return error.message || "An unexpected error occurred.";
}

export const isNsutOnly = (user: User | null | undefined) => {
  if (!user) return false;
  const email = user.email?.toLowerCase() || '';
  return (
    email.endsWith('nsut.ac.in')
  );
};
