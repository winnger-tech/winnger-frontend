'use client';

import { useTranslation } from '../../utils/i18n';
import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const languages = {
  'en-CA': 'English',
  'fr-CA': 'French',
  'zh-CA': 'Chinese',
} as const;

export default function LanguageSelector() {
  const { locale, changeLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
        <SelectedText>{languages[locale as keyof typeof languages]}</SelectedText>
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
            {Object.entries(languages).map(([code, name]) => (
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
                {name}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 180px;
  font-family: 'Space Grotesk', sans-serif;
`;

const SelectorButton = styled.button`
  width: 100%;
  background-color: #D7C3A5;
  color: #000;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #AC9169;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(172, 145, 105, 0.7);
  }
`;

const SelectedText = styled.span`
  user-select: none;
`;

const Dropdown = styled.ul`
  position: absolute;
  width: 100%;
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

  &[aria-selected='true'] {
    background-color: #AC9169;
    color: white;
    font-weight: 700;
  }

  &:hover,
  &:focus {
    background-color: #AC9169;
    color: white;
    outline: none;
  }
`;
