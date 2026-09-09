import React from 'react';
import {
  Plane,
  Car,
  Hotel,
  Utensils,
  Ship,
  Compass,
  Trees,
  Sparkles,
  Landmark,
  MapPin,
  Waves,
  Heart,
  Palette,
  Camera,
  ShoppingBag,
  AlertTriangle,
  Zap,
  Activity,
  LucideProps,
} from 'lucide-react';

interface NodeIconProps extends LucideProps {
  typeOrIcon?: string;
}

export function NodeIcon({ typeOrIcon = 'pin', className = 'w-4 h-4', ...props }: NodeIconProps) {
  const key = (typeOrIcon || '').toLowerCase();

  if (key.includes('plane') || key.includes('flight')) {
    return <Plane className={className} {...props} />;
  }
  if (key.includes('car') || key.includes('transfer') || key.includes('cab') || key.includes('taxi')) {
    return <Car className={className} {...props} />;
  }
  if (key.includes('hotel') || key.includes('resort') || key.includes('villa') || key.includes('stay')) {
    return <Hotel className={className} {...props} />;
  }
  if (
    key.includes('utensils') ||
    key.includes('food') ||
    key.includes('cuisine') ||
    key.includes('lunch') ||
    key.includes('dinner') ||
    key.includes('restaurant') ||
    key.includes('cooking')
  ) {
    return <Utensils className={className} {...props} />;
  }
  if (key.includes('ship') || key.includes('cruise') || key.includes('boat') || key.includes('ferry')) {
    return <Ship className={className} {...props} />;
  }
  if (key.includes('scuba') || key.includes('dive') || key.includes('water') || key.includes('beach') || key.includes('wave')) {
    return <Waves className={className} {...props} />;
  }
  if (key.includes('tree') || key.includes('nature') || key.includes('spice') || key.includes('farm') || key.includes('forest')) {
    return <Trees className={className} {...props} />;
  }
  if (key.includes('landmark') || key.includes('heritage') || key.includes('history') || key.includes('temple') || key.includes('church')) {
    return <Landmark className={className} {...props} />;
  }
  if (key.includes('wellness') || key.includes('yoga') || key.includes('spa') || key.includes('health')) {
    return <Heart className={className} {...props} />;
  }
  if (key.includes('workshop') || key.includes('art') || key.includes('craft') || key.includes('pottery')) {
    return <Palette className={className} {...props} />;
  }
  if (key.includes('photography') || key.includes('photo')) {
    return <Camera className={className} {...props} />;
  }
  if (key.includes('shopping') || key.includes('market')) {
    return <ShoppingBag className={className} {...props} />;
  }
  if (key.includes('nightlife') || key.includes('party') || key.includes('gem') || key.includes('sparkle')) {
    return <Sparkles className={className} {...props} />;
  }
  if (key.includes('adventure')) {
    return <Compass className={className} {...props} />;
  }
  if (key.includes('alert') || key.includes('warn') || key.includes('disrupt')) {
    return <AlertTriangle className={className} {...props} />;
  }
  if (key.includes('zap') || key.includes('fast') || key.includes('electric')) {
    return <Zap className={className} {...props} />;
  }
  if (key.includes('activity')) {
    return <Activity className={className} {...props} />;
  }

  return <MapPin className={className} {...props} />;
}
