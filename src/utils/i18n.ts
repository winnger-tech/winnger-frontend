'use client';
import { useLocale } from './LocaleContext';
import messages from '../messages';

export function useTranslation() {
  const { locale, setLocale } = useLocale();

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = messages[locale as keyof typeof messages];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    return value || key;
  };

  const changeLanguage = (newLocale: string) => {
    setLocale(newLocale);
  };

  return {
    t,
    locale,
    changeLanguage,
  };
} 