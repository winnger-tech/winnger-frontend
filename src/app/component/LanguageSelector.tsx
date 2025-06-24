'use client';

import { useTranslation } from '../../utils/i18n';
import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const languages = {
  'en-CA': { abbr: 'ENG', icon: '/icons/ca.png' },
  'fr-CA': { abbr: 'FRE', icon: '/icons/fr.png' },
  'zh-CA': { abbr: 'CHN', icon: '/icons/cn.png' },
} as const;

export default function LanguageSelector() {
  const { locale, changeLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleDropdown() {
    setOpen((prev) => !prev);
  }

  function onSelect(lang: keyof typeof languages) {
    changeLanguage(lang);
    setOpen(false);
  }

  return (
    <Wrapper ref={wrapperRef}>
      <FlagButton onClick={toggleDropdown} aria-haspopup="listbox" aria-expanded={open}>
        <Image
          src={languages[locale as keyof typeof languages].icon}
          alt={languages[locale as keyof typeof languages].abbr}
          width={32}
          height={32}
          style={{ borderRadius: '50%' }}
        />
      </FlagButton>

      <AnimatePresence>
        {open && (
          <Dropdown
            as={motion.ul}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="listbox"
          >
            {Object.entries(languages).map(([code, { abbr }]) => (
              <DropdownItem
                key={code}
                onClick={() => onSelect(code as keyof typeof languages)}
                aria-selected={locale === code}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelect(code as keyof typeof languages);
                  }
                }}
              >
                {abbr}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

// Styled Components

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  font-family: 'Space Grotesk', sans-serif;
`;

const FlagButton = styled.button`
  width: 40px;
  height: 40px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;

  &:focus {
    outline: 2px solid #ac9169;
  }
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 8px 16px rgb(0 0 0 / 0.15);
  list-style: none;
  padding: 0.5rem 0;
  z-index: 1000;
`;

const DropdownItem = styled.li`
  text-align: center;
  padding: 0.5rem 0;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  user-select: none;

  &[aria-selected='true'] {
    background-color: #ac9169;
    color: white;
    font-weight: 700;
  }

  &:hover,
  &:focus {
    background-color: #ac9169;
    color: white;
    outline: none;
  }
`;
