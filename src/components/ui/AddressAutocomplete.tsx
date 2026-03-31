'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function AddressAutocomplete({ value, onChange, placeholder, className, id }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load Google Places script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    // Already loaded
    if (window.google?.maps?.places) {
      setLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          setLoaded(true);
          clearInterval(check);
        }
      }, 100);
      return () => clearInterval(check);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!loaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [loaded, onChange]);

  // Prevent form submission on Enter when selecting from dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // If the pac-container (Google dropdown) is visible, prevent form submit
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && pacContainer.querySelector('.pac-item-selected')) {
        e.preventDefault();
      }
    }
  }, []);

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder || '123 Main St, Indianapolis, IN'}
      className={className || 'input-field pl-9'}
      autoComplete="off"
    />
  );
}
