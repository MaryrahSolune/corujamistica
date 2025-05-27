
'use client';
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import type { ReactNode } from "react";

interface LanguageProviderClientComponentAppProps {
  children: (props: { t: (key: TranslationKey, params?: Record<string, string | number>) => string }) => ReactNode;
}

export function LanguageProviderClientComponentApp({ children }: LanguageProviderClientComponentAppProps) {
  const { t } = useLanguage();
  return <>{children({ t })}</>;
}
