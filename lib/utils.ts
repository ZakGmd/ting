import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This utility function merges tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 