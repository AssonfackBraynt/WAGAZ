declare namespace JSX {
  interface IntrinsicElements {
    'gmp-places-autocomplete': {
      className?: string;
      placeholder?: string;
      country?: string | string[];
      'location-bias-radius'?: number;
      'location-bias-center-lat'?: number;
      'location-bias-center-lng'?: number;
      'onGmp-select'?: (event: CustomEvent) => void;
      // Add other attributes as needed
    };
  }
}