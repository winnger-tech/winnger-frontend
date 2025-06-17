import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Address {
  streetNameNumber: string;
  appUniteNumber?: string;
  city: string;
  province: string;
  postalCode: string;
}

interface GoogleMapsPickerProps {
  label: string;
  onAddressSelect: (address: Address) => void;
  error?: string;
  required?: boolean;
}

export const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({
  label,
  onAddressSelect,
  error,
  required
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setLoadError('Google Maps API key is not configured');
      console.error('Google Maps API key is missing. Please check your .env.local file.');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load()
      .then(() => {
        setIsLoaded(true);
        setLoadError(null);
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        setLoadError('Failed to load Google Maps. Please try again later.');
      });
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current && !loadError) {
      try {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'ca' },
          fields: ['address_components', 'formatted_address']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.address_components) {
            let address: Address = {
              streetNameNumber: '',
              city: '',
              province: '',
              postalCode: ''
            };

            for (const component of place.address_components) {
              const type = component.types[0];
              switch (type) {
                case 'street_number':
                  address.streetNameNumber = component.long_name + ' ';
                  break;
                case 'route':
                  address.streetNameNumber += component.long_name;
                  break;
                case 'subpremise':
                  address.appUniteNumber = component.long_name;
                  break;
                case 'locality':
                  address.city = component.long_name;
                  break;
                case 'administrative_area_level_1':
                  address.province = component.short_name; // Using short_name for province code
                  break;
                case 'postal_code':
                  address.postalCode = component.long_name;
                  break;
              }
            }

            onAddressSelect(address);
          }
        });
      } catch (error) {
        console.error('Error initializing Google Maps Autocomplete:', error);
        setLoadError('Failed to initialize address autocomplete');
      }
    }
  }, [isLoaded, onAddressSelect, loadError]);

  return (
    <div className="mb-4">
      <label className="block text-white text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        placeholder={loadError ? 'Address lookup unavailable' : 'Start typing your address...'}
        disabled={!!loadError}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline ${
          (error || loadError) ? 'border-red-500' : 'border-gray-600'
        }`}
      />
      {(error || loadError) && (
        <p className="text-red-500 text-xs italic">{error || loadError}</p>
      )}
    </div>
  );
}; 