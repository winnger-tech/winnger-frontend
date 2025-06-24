'use client';

import { useTranslation } from '../../utils/i18n';
import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
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
      <SelectorButton onClick={toggleDropdown} aria-haspopup="listbox" aria-expanded={open}>
        <Image
          src={languages[locale as keyof typeof languages].icon}
          alt={languages[locale as keyof typeof languages].abbr}
          width={24}
          height={24}
          style={{ borderRadius: '2px' }}
        />
        <FiChevronDown size={20} />
      </SelectorButton>

      <AnimatePresence>
        {open && (
          <Dropdown
            as={motion.ul}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="listbox"
          >
            {Object.entries(languages).map(([code, { abbr, icon }]) => (
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
                <Image
                  src={icon}
                  alt={abbr}
                  width={24}
                  height={24}
                  style={{ marginRight: '8px', borderRadius: '2px' }}
                />
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
  width: 60px;
  font-family: 'Space Grotesk', sans-serif;
`;

const SelectorButton = styled.button`
  width: 100%;
  background-color: #d7c3a5;
  color: #000;
  border: none;
  border-radius: 0.5rem;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ac9169;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(172, 145, 105, 0.7);
  }
`;

const Dropdown = styled.ul`
  position: absolute;
  width: 200%;
  background: #fff;
  border-radius: 0 0 0.5rem 0.5rem;
  margin-top: 4px;
  box-shadow: 0 8px 16px rgb(0 0 0 / 0.15);
  list-style: none;
  padding: 0.5rem 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

const DropdownItem = styled.li`
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;

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
