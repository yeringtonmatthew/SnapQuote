'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  /** Render the dropdown as a fixed-position portal (escapes modal/sheet clipping) */
  portal?: boolean;
  /** Render suggestions inline (in normal flow) so they push content down instead of overlapping */
  inline?: boolean;
}

interface Suggestion {
  description: string;
  place_id: string;
}

/**
 * AddressAutocomplete — NO Google Maps widget.
 *
 * Uses the Places Autocomplete REST API via our own proxy endpoint,
 * with a custom dropdown we fully control.
 */
export default function AddressAutocomplete({ value, onChange, placeholder, className, id, portal, inline }: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click — check BOTH container and portal dropdown
  useEffect(() => {
    function handleClickOutside(e: Event) {
      const target = e.target as Node;
      const inContainer = containerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inContainer && !inDropdown) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Keep portal position in sync with input
  const updateRect = useCallback(() => {
    if (portal && inputRef.current) {
      setRect(inputRef.current.getBoundingClientRect());
    }
  }, [portal]);

  useEffect(() => {
    if (showDropdown && portal) {
      updateRect();
      // Also update on scroll/resize since fixed positioning
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [showDropdown, portal, updateRect]);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
      if (!res.ok) { setSuggestions([]); return; }
      const data = await res.json();
      if (data.predictions?.length > 0) {
        setSuggestions(data.predictions.map((p: any) => ({
          description: p.description,
          place_id: p.place_id,
        })));
        setShowDropdown(true);
        setActiveIndex(-1);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch {
      setSuggestions([]);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleSelect(suggestion: Suggestion) {
    setInputValue(suggestion.description);
    onChange(suggestion.description);
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }

  // Compute portal style: always render ABOVE the input in portal mode
  const portalStyle: React.CSSProperties | undefined = (portal && rect) ? {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    bottom: window.innerHeight - rect.top + 4,
    maxHeight: Math.min(240, rect.top - 8),
    zIndex: 99999,
  } : undefined;

  const suggestionsList = suggestions.map((s, i) => (
    <li
      key={s.place_id}
      id={`suggestion-${i}`}
      role="option"
      aria-selected={i === activeIndex}
      className={`cursor-pointer px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 transition-colors ${
        i === activeIndex ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      } ${i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}
      onMouseDown={(e) => {
        e.preventDefault();
        handleSelect(s);
      }}
    >
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span>{s.description}</span>
      </div>
    </li>
  ));

  const dropdownClassName = inline
    ? 'mt-1 max-h-60 overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10'
    : portal
      ? 'overflow-auto rounded-xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10'
      : 'absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10';

  const dropdown = showDropdown && suggestions.length > 0 ? (
    <ul
      ref={dropdownRef}
      id={id ? `${id}-listbox` : undefined}
      role="listbox"
      className={dropdownClassName}
      style={inline ? undefined : portalStyle}
    >
      {suggestionsList}
      <li className="border-t border-gray-100 dark:border-gray-800 px-4 py-1.5 text-[10px] text-gray-300 text-right">
        Powered by Google
      </li>
    </ul>
  ) : null;

  return (
    <div ref={containerRef}>
      <div className={inline ? '' : 'relative'}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder || '123 Main St, Indianapolis, IN'}
          className={className || 'input-field pl-9'}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls={id ? `${id}-listbox` : undefined}
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
        />
        {!inline && (portal && dropdown ? createPortal(dropdown, document.body) : dropdown)}
      </div>
      {inline && dropdown}
    </div>
  );
}
