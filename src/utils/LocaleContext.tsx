'use client';
import React, { createContext, useContext, useState } from 'react';

const LocaleContext = createContext({
  locale: 'en-CA',
  setLocale: (l: string) => {},
});

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState('en-CA');
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext); 