'use client';

import { useTranslation } from '../../utils/i18n';
import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

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
        <FlagTextWrapper>
          <Image
            src={languages[locale as keyof typeof languages].icon}
            alt={languages[locale as keyof typeof languages].abbr}
            width={32}
            height={32}
            style={{ borderRadius: '50%' }}
          />
          <LangText>{languages[locale as keyof typeof languages].abbr}</LangText>
        </FlagTextWrapper>
        <ChevronIcon
          as={motion.div}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} color="#f4f4f4" />
        </ChevronIcon>
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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: 2px solid #ac9169;
  }
`;

const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
`;

const FlagTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LangText = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #f4f4f4;
  margin-top: 2px;
  letter-spacing: 0.5px;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 70px;
  transform: translateX(-50%);
  width: 110px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
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
  transition: all 0.2s ease;

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
    transform: scale(1.05);
  }
`;
