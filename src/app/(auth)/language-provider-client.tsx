
'use client';
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import type { ReactNode } from "react";

interface LanguageProviderClientComponentProps {
  children: (props: { t: (key: TranslationKey, params?: Record<string, string | number>) => string }) => ReactNode;
}

export function LanguageProviderClientComponent({ children }: LanguageProviderClientComponentProps) {
  const { t } = useLanguage();
  return <>{children({ t })}</>;
}
