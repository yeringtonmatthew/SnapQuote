'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

declare global {
  interface Window {
    __googleMapsCallback?: () => void;
  }
}

export default function AddressAutocomplete({ value, onChange, placeholder, className, id }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const [loaded, setLoaded] = useState(false);

  // Keep onChange ref current without re-running effects
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Load Google Places script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('[AddressAutocomplete] No NEXT_PUBLIC_GOOGLE_MAPS_API_KEY set');
      return;
    }

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
      // Timeout after 10s
      const timeout = setTimeout(() => {
        clearInterval(check);
        console.error('[AddressAutocomplete] Google Maps script timed out');
      }, 10000);
      return () => { clearInterval(check); clearTimeout(timeout); };
    }

    // Set up callback
    window.__googleMapsCallback = () => {
      setLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
      console.error('[AddressAutocomplete] Failed to load Google Maps:', e);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize autocomplete (only once when loaded + input ready)
  useEffect(() => {
    if (!loaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) {
          onChangeRef.current(place.formatted_address);
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (err) {
      console.error('[AddressAutocomplete] Failed to init autocomplete:', err);
    }
  }, [loaded]);

  // Prevent form submission on Enter when selecting from dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
