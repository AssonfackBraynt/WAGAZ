
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6 text-muted-foreground">
        Oops! The page you're looking for doesn't exist.
      </p>
      <p className="text-lg mb-8 max-w-md mx-auto">
        It seems you've ventured into uncharted territory. Let's get you back on track.
      </p>
      <Button asChild>
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
