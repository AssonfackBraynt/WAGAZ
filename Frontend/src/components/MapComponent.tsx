
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, MapPin } from 'lucide-react';

const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
      
      // Try to get user location automatically after map loads
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
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addRadiusCircle = (center: [number, number], radiusKm: number = 1) => {
    if (!map.current || !isMapInitialized) {
      console.warn("Map not ready for adding radius circle");
      return;
    }

    // Ensure map style is loaded before adding sources
    if (!map.current.isStyleLoaded()) {
      map.current.once('styledata', () => addRadiusCircle(center, radiusKm));
      return;
    }

    try {
      // Remove existing circle if it exists
      if (map.current.getLayer('radius-circle')) {
        map.current.removeLayer('radius-circle');
      }
      if (map.current.getSource('radius-circle')) {
        map.current.removeSource('radius-circle');
      }

      // Create circle around user location
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
            stops: [
              [0, 0],
              [20, radiusKm * 100], // Approximate conversion for visualization
            ],
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
            duration: 2000
          });
          
          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }
          userLocationMarker.current = new mapboxgl.Marker({
            color: '#3b82f6',
            scale: 1.2
          })
            .setLngLat(userCoords)
            .addTo(map.current);

          // Add radius circle around user location
          addRadiusCircle(userCoords);
        }
        
        console.log("📍 Got user location automatically:", latitude, longitude);
        toast.success("Location detected! Map centered on your position.");
      },
      (error) => {
        console.log("Could not get user location automatically:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
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
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=CM&proximity=11.5174,3.8480&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        const locationCoords: [number, number] = [longitude, latitude];
        
        if (map.current) {
          map.current.flyTo({
            center: locationCoords,
            zoom: 15,
            duration: 2000
          });
          
          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }
          userLocationMarker.current = new mapboxgl.Marker({
            color: '#ef4444',
            scale: 1.2
          })
            .setLngLat(locationCoords)
            .addTo(map.current);

          addRadiusCircle(locationCoords);
        }
        
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

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      setLocationPermission('denied');
      return false;
    }

    // Check if permission is already granted
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

    // Request permission through geolocation API
    return new Promise((resolve) => {
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
          maximumAge: 60000
        }
      );
    });
  };

  const showLocationInstructions = () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      toast.error("Location access denied. Please enable location permissions in your browser settings:\n\n" +
                  "Android: Settings > Apps > [Your Browser] > Permissions > Location\n" +
                  "iPhone: Settings > Privacy & Security > Location Services > [Your Browser]", {
        duration: 8000
      });
    } else {
      toast.error("Location access denied. Please:\n\n" +
                  "1. Click the location icon in your browser's address bar\n" +
                  "2. Select 'Allow' for location access\n" +
                  "3. Refresh the page", {
        duration: 6000
      });
    }
  };

  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 User location update:', latitude, longitude, 'Accuracy:', accuracy);

        if (map.current && isMapInitialized) {
          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }

          userLocationMarker.current = new mapboxgl.Marker({
            color: '#3b82f6',
            scale: 1.2
          })
            .setLngLat([longitude, latitude])
            .addTo(map.current);

          if (!userLocation || Math.abs(userLocation[0] - longitude) > 0.001 || Math.abs(userLocation[1] - latitude) > 0.001) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              duration: 2000
            });
            setUserLocation([longitude, latitude]);
          }

          addRadiusCircle([longitude, latitude]);

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
          toast.error("Location information unavailable. Please check your GPS settings.");
        } else {
          toast.error("Location request timeout. Please try again.");
        }
        setIsTrackingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000
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

  const handleEnableLocationClick = () => {
    showLocationInstructions();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for your location in Yaoundé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={searchLocation} 
          disabled={isSearching}
          size="default"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Location Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={startLocationTracking}
          disabled={isTrackingLocation}
          variant={isTrackingLocation ? "secondary" : "default"}
          className="w-full sm:w-auto"
        >
          {isTrackingLocation ? "Tracking Location..." : "Use My Current Location"}
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
        📍 Blue circle shows ~1km radius around your location
      </div>
    </div>
  );
};

export default MapComponent;
