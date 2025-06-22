import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, MapPin } from 'lucide-react';

interface MapComponentProps {
  searchResults?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'gas' | 'petrol';
    bottleMark?: string;
    bottleSize?: string;
    fuelType?: string;
  }>;
  searchType: 'gas' | 'petrol';
}

const MapComponent = ({ searchResults = [], searchType }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const shopMarkers = useRef<mapboxgl.Marker[]>([]);
  const placeMarkers = useRef<mapboxgl.Marker[]>([]);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; place_name: string; center: [number, number] }>>([]);

  useEffect(() => {
    if (!mapContainer.current) {
      console.warn("❌ mapContainer is null — DOM not ready yet.");
      return;
    }

    console.log("🗺️ Initializing map...");
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXNzb25mYWNrMDc2IiwiYSI6ImNtYjJqNm4wNTFjNmgyanF6aGpud3RxNXIifQ.yF3adq05mgzMPUGSztaKJQ';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [11.5174, 3.8480], // Yaoundé, Cameroon
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      console.log("✅ Map loaded successfully");
      setIsMapInitialized(true);
      toast.success("Map loaded successfully!");
      tryGetUserLocation();
    });

    map.current.on('error', (e) => {
      console.error('❌ Map error:', e);
      toast.error("Failed to load map. Please check your internet connection.");
    });

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      shopMarkers.current.forEach(marker => marker.remove());
      placeMarkers.current.forEach(marker => marker.remove());
      if (userLocationMarker.current) {
        userLocationMarker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isMapInitialized || !searchResults.length) return;

    // Clear existing markers
    shopMarkers.current.forEach(marker => marker.remove());
    placeMarkers.current.forEach(marker => marker.remove());
    shopMarkers.current = [];
    placeMarkers.current = [];

    // Add app shop markers (green)
    searchResults.forEach(shop => {
      if (shop.lat && shop.lng && !isNaN(shop.lat) && !isNaN(shop.lng)) {
        const marker = new mapboxgl.Marker({
          color: '#22c55e', // Green for app shops
          scale: 0.8,
        })
          .setLngLat([shop.lng, shop.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<div><strong>${shop.name}</strong><br/>${searchType === 'gas' ? `${shop.bottleMark || ''} ${shop.bottleSize || ''}` : shop.fuelType || ''}</div>`
            )
          )
          .addTo(map.current!);
        shopMarkers.current.push(marker);
      }
    });

    // Cache Mapbox Places results
    const placeCache = new Map();
    const cacheKey = `${searchType}_${userLocation?.[0]}_${userLocation?.[1]}`;
    if (placeCache.has(cacheKey)) {
      const cachedResults = placeCache.get(cacheKey);
      cachedResults.forEach((place: { center: [number, number]; place_name: string }) => {
        const marker = new mapboxgl.Marker({
          color: '#f97316', // Orange for Mapbox Places
          scale: 0.8,
        })
          .setLngLat(place.center)
          .setPopup(new mapboxgl.Popup().setHTML(`<div><strong>${place.place_name}</strong></div>`))
          .addTo(map.current!);
        placeMarkers.current.push(marker);
      });
    } else {
      // Fetch nearby places using Mapbox Geocoding API
      const query = searchType === 'petrol' ? 'gas station' : 'gas shop';
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=CM&proximity=${userLocation ? userLocation[0] : 11.5174},${userLocation ? userLocation[1] : 3.8480}&limit=10&access_token=${mapboxgl.accessToken}`
      )
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length) {
            placeCache.set(cacheKey, data.features);
            data.features.forEach((place: { center: [number, number]; place_name: string }) => {
              const marker = new mapboxgl.Marker({
                color: '#f97316', // Orange for Mapbox Places
                scale: 0.8,
              })
                .setLngLat(place.center)
                .setPopup(new mapboxgl.Popup().setHTML(`<div><strong>${place.place_name}</strong></div>`))
                .addTo(map.current!);
              placeMarkers.current.push(marker);
            });
          }
        })
        .catch(error => {
          console.error('Places search error:', error);
          toast.error("Failed to load nearby places.");
        });
    }

    // Adjust map bounds to fit all markers
    if (shopMarkers.current.length || placeMarkers.current.length) {
      const bounds = new mapboxgl.LngLatBounds();
      shopMarkers.current.forEach(marker => bounds.extend(marker.getLngLat()));
      placeMarkers.current.forEach(marker => bounds.extend(marker.getLngLat()));
      if (userLocation) bounds.extend(userLocation);
      map.current!.fitBounds(bounds, { padding: 50, duration: 2000 });
    }
  }, [searchResults, searchType, userLocation, isMapInitialized]);

  const addRadiusCircle = (center: [number, number], radiusKm: number = 1) => {
    if (!map.current || !isMapInitialized) {
      console.warn("Map not ready for adding radius circle");
      return;
    }

    if (!map.current.isStyleLoaded()) {
      map.current.once('styledata', () => addRadiusCircle(center, radiusKm));
      return;
    }

    try {
      if (map.current.getLayer('radius-circle')) {
        map.current.removeLayer('radius-circle');
      }
      if (map.current.getSource('radius-circle')) {
        map.current.removeSource('radius-circle');
      }

      const circle = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: center,
        },
        properties: {},
      };

      map.current.addSource('radius-circle', {
        type: 'geojson',
        data: circle,
      });

      map.current.addLayer({
        id: 'radius-circle',
        type: 'circle',
        source: 'radius-circle',
        paint: {
          'circle-radius': {
            stops: [[0, 0], [20, radiusKm * 100]], // Approximate conversion
            base: 2,
          },
          'circle-color': '#3b82f6',
          'circle-opacity': 0.1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#3b82f6',
          'circle-stroke-opacity': 0.5,
        },
      });
    } catch (error) {
      console.error('Error adding radius circle:', error);
    }
  };

  const tryGetUserLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      toast.error("Geolocation is not supported by this browser.");
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userCoords: [number, number] = [longitude, latitude];
        setUserLocation(userCoords);
        setLocationPermission('granted');

        if (map.current && isMapInitialized) {
          map.current.flyTo({
            center: userCoords,
            zoom: 15,
            duration: 2000,
          });

          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }
          userLocationMarker.current = new mapboxgl.Marker({
            color: '#3b82f6',
            scale: 1.2,
          })
            .setLngLat(userCoords)
            .addTo(map.current);

          addRadiusCircle(userCoords);
        }

        console.log("📍 Got user location automatically:", latitude, longitude);
        toast.success("Location detected! Map centered on your position.");
      },
      (error) => {
        console.log("Could not get user location automatically:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied');
        } else {
          toast.error("Unable to get your location. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=CM&proximity=11.5174,3.8480&limit=5&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        const locationCoords: [number, number] = [longitude, latitude];

        if (map.current) {
          map.current.flyTo({
            center: locationCoords,
            zoom: 15,
            duration: 2000,
          });

          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }
          userLocationMarker.current = new mapboxgl.Marker({
            color: '#ef4444',
            scale: 1.2,
          })
            .setLngLat(locationCoords)
            .addTo(map.current);

          addRadiusCircle(locationCoords);
        }

        setUserLocation(locationCoords);
        toast.success(`Found: ${data.features[0].place_name}`);
      } else {
        toast.error("Location not found. Try searching for a more specific address in Cameroon.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=CM&proximity=11.5174,3.8480&limit=5&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features) {
        setSuggestions(data.features);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      setLocationPermission('denied');
      return false;
    }

    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          setLocationPermission('granted');
          return true;
        } else if (permission.state === 'denied') {
          setLocationPermission('denied');
          showLocationInstructions();
          return false;
        }
      } catch (error) {
        console.error("Permission API error:", error);
      }
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
          resolve(true);
        },
        (error) => {
          setLocationPermission('denied');
          if (error.code === error.PERMISSION_DENIED) {
            showLocationInstructions();
          } else {
            toast.error("Unable to get your location. Please try again.");
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const showLocationInstructions = () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      toast.error(
        "Location access denied. Please enable location permissions in your browser settings:\n\n" +
          "Android: Settings > Apps > [Your Browser] > Permissions > Location\n" +
          "iPhone: Settings > Privacy & Security > Location Services > [Your Browser]",
        { duration: 8000 }
      );
    } else {
      toast.error(
        "Location access denied. Please:\n\n" +
          "1. Click the location icon in your browser's address bar\n" +
          "2. Select 'Allow' for location access\n" +
          "3. Refresh the page",
        { duration: 6000 }
      );
    }
  };

  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const userCoords: [number, number] = [longitude, latitude];
        console.log('📍 User location update:', latitude, longitude, 'Accuracy:', accuracy);

        if (map.current && isMapInitialized) {
          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }

          userLocationMarker.current = new mapboxgl.Marker({
            color: '#3b82f6',
            scale: 1.2,
          })
            .setLngLat(userCoords)
            .addTo(map.current);

          if (
            !userLocation ||
            Math.abs(userLocation[0] - longitude) > 0.001 ||
            Math.abs(userLocation[1] - latitude) > 0.001
          ) {
            map.current.flyTo({
              center: userCoords,
              zoom: 15,
              duration: 2000,
            });
            setUserLocation(userCoords);
          }

          addRadiusCircle(userCoords);

          if (!isTrackingLocation) {
            setIsTrackingLocation(true);
            toast.success("Location tracking started!");
          }
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          showLocationInstructions();
          setLocationPermission('denied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error("Locati on information unavailable. Please check your GPS settings.");
        } else {
          toast.error("Location request timeout. Please try again.");
        }
        setIsTrackingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 1000,
      }
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (userLocationMarker.current) {
      userLocationMarker.current.remove();
      userLocationMarker.current = null;
    }

    setIsTrackingLocation(false);
    toast.info("Location tracking stopped");
  };

  const handleEnableLocationClick = async () => {
    showLocationInstructions();
    await startLocationTracking();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for your location in Yaoundé..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            className="pl-10"
            list="location-suggestions"
          />
          <datalist id="location-suggestions">
            {suggestions.map(suggestion => (
              <option key={suggestion.id} value={suggestion.place_name} />
            ))}
          </datalist>
        </div>
        <Button onClick={searchLocation} disabled={isSearching} size="default">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={startLocationTracking}
          disabled={isTrackingLocation}
          variant={isTrackingLocation ? 'secondary' : 'default'}
          className="w-full sm:w-auto"
        >
          {isTrackingLocation ? 'Tracking Location...' : 'Use My Current Location'}
        </Button>
        {isTrackingLocation && (
          <Button onClick={stopLocationTracking} variant="outline" className="w-full sm:w-auto">
            Stop Tracking
          </Button>
        )}
        {locationPermission === 'denied' && (
          <Button
            onClick={handleEnableLocationClick}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Enable Location Access
          </Button>
        )}
      </div>

      <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-border">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {!isMapInitialized && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        📍 Blue: Your location | Green: App shops | Orange: Nearby places
      </div>
    </div>
  );
};

export default MapComponent;