import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Check, X } from 'lucide-react';

interface LocationSelectorProps {
  onLocationSelect: (location: {address: string; latitude: number; longitude: number}) => void;
  initialValue?: string;
  required?: boolean;
}

interface MapboxFeature {
  place_name: string;
  center: [number, number];
  geometry: {
    coordinates: [number, number];
  };
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationSelect, 
  initialValue = '', 
  required = false 
}) => {
  const [input, setInput] = useState(initialValue);
const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOtherOption, setShowOtherOption] = useState(false);
const [isLoading, setIsLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'manual'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mapbox access token (you should move this to environment variables in production)
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXNzb25mYWNrMDc2IiwiYSI6ImNtYjJqNm4wNTFjNmgyanF6aGpud3RxNXIifQ.yF3adq05mgzMPUGSztaKJQ';

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowOtherOption(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=CM&proximity=11.5174,3.8480&types=place,locality,neighborhood,address&limit=5&access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      console.log('=== MAPBOX GEOCODING RESPONSE ===');
      console.log('Query:', query);
      console.log('Features found:', data.features?.length || 0);
      console.log('Raw response:', data);
      console.log('=== END MAPBOX RESPONSE ===');
      
      if (data.features && data.features.length > 0) {
        setSuggestions(data.features);
        setShowSuggestions(true);
        setShowOtherOption(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setShowOtherOption(query.length > 3);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      setShowOtherOption(query.length > 3);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (input.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(input);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowOtherOption(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [input]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowOtherOption(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (location: MapboxFeature) => {
    setInput(location.place_name);
    setShowSuggestions(false);
    setShowOtherOption(false);
    setVerificationStatus('verified');

console.log('=== LOCATION SELECTED FROM MAPBOX ===');
    console.log('Selected location:', JSON.stringify(location, null, 2));
    console.log('Coordinates:', location.center);
    console.log('=== END LOCATION SELECTION ===');
    
    onLocationSelect({
 address: location.place_name,
      latitude: location.center[1], // Mapbox returns [lng, lat]
      longitude: location.center[0]
    });
  };

const handleOtherOptionClick = () => {
    setIsManualMode(true);
setShowSuggestions(false);
    setShowOtherOption(false);
    setVerificationStatus('manual');
    
    console.log('=== MANUAL LOCATION ENTRY ===');
    console.log('Manual location entered:', input);
    console.log('Note: This location will be sent without coordinates for backend processing');
    console.log('=== END MANUAL LOCATION ===');
    
    // Send with dummy coordinates (0,0) to indicate manual entry
    onLocationSelect({
      address: input,
      latitude: 0,
      longitude: 0
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
if (isManualMode && value !== input) {
      setIsManualMode(false);
      setVerificationStatus('idle');
    }
  };

  const handleInputFocus = () => {
if (input.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'manual':
        return <MapPin className="h-4 w-4 text-orange-500" />;
      default:
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Searching locations...';
    
    switch (verificationStatus) {
      case 'verified':
return 'Location verified from map data';
      case 'manual':
        return 'Manual location (will be processed by backend)';
      default:
return 'Type to search locations in Cameroon...';
    }
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="location" className="flex items-center gap-2">
        Shop/Station Location {required && '*'}
        {getStatusIcon()}
      </Label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id="location"
          type="text"
          placeholder="Start typing location name (e.g., Yaoundé, Douala...)"
          value={input}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          required={required}
          className={`${
            verificationStatus === 'verified' ? 'border-green-500' : 
            verificationStatus === 'manual' ? 'border-orange-500' : ''
          }`}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
        
        {(showSuggestions || showOtherOption) && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {/* Map-based suggestions */}
            {suggestions.map((location, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-2 border-b border-border/50 last:border-b-0"
                onClick={() => handleSuggestionClick(location)}
              >
                <MapPin className="h-4 w-4 text-primary" />
           <span>{location.place_name}</span>
              </button>
            ))}
            
            {/* Other option */}
            {showOtherOption && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-2 border-t border-border/50 bg-secondary/50"
                onClick={handleOtherOptionClick}
              >
                <MapPin className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="font-medium">Other: "{input}"</div>
                  <div className="text-xs text-muted-foreground">
                    Use this location (coordinates will be determined later)
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
 
      <p className="text-xs text-muted-foreground">
        {getStatusText()}
      </p>
      
      {isManualMode && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <p className="text-sm text-orange-700">
            <strong>Manual Location:</strong> "{input}" will be sent to the backend for coordinate determination.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;