// ============================================
// TravelOS — Experiences Database (Goa)
// ============================================
// Pre-seeded local experiences for discovery & slack-time injection

import { Experience } from '@/lib/utils/types';

export const goaExperiences: Experience[] = [
  {
    id: 'exp-fontainhas-walk',
    title: 'Fontainhas Heritage Walk',
    description:
      'Explore the charming Latin Quarter of Panjim with its colorful Portuguese-era houses, narrow lanes, and hidden art galleries. Learn about Goan history from a local storyteller.',
    category: 'heritage',
    location: { name: 'Fontainhas, Panjim', lat: 15.4919, lng: 73.8284, area: 'Panjim' },
    durationMinutes: 120,
    cost: 800,
    currency: 'INR',
    rating: 4.8,
    reviewCount: 342,
    images: ['https://images.unsplash.com/photo-1582650625119-3a31f841839d?q=80&w=800&auto=format&fit=crop'],
    tags: ['walking', 'history', 'photography', 'architecture', 'art'],
    groupTypes: ['solo', 'couple', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '08:00',
        endTime: '18:00',
        minDurationMinutes: 90,
        maxDurationMinutes: 150,
        maxGroupSize: 12,
        priceRange: { min: 600, max: 1000 },
      },
    ],
    provider: { name: 'Make It Happen Goa', verified: true, rating: 4.9 },
    highlights: ['UNESCO tentative list site', 'Authentic Goan architecture', 'Hidden art galleries', 'Local bakery stop'],
    isHidden: true,
  },
  {
    id: 'exp-cooking-class',
    title: 'Goan Cooking Masterclass',
    description:
      'Learn to cook authentic Goan dishes — vindaloo, xacuti, and bebinca — with a local Goan grandmother in her home kitchen. Includes market visit.',
    category: 'local-cuisine',
    location: { name: 'Assagao, Goa', lat: 15.5793, lng: 73.7687, area: 'North Goa' },
    durationMinutes: 180,
    cost: 2500,
    currency: 'INR',
    rating: 4.9,
    reviewCount: 189,
    images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop'],
    tags: ['cooking', 'food', 'cultural', 'hands-on', 'authentic'],
    groupTypes: ['solo', 'couple', 'family', 'friends'],
    availability: [
      {
        dayOfWeek: [1, 2, 3, 4, 5, 6],
        startTime: '09:00',
        endTime: '17:00',
        minDurationMinutes: 150,
        maxDurationMinutes: 210,
        maxGroupSize: 8,
        priceRange: { min: 2000, max: 3000 },
      },
    ],
    provider: { name: 'Aunty Maria\'s Kitchen', verified: true, rating: 4.9 },
    highlights: ['Market visit included', 'Take home recipe cards', 'Learn 3 signature dishes', 'Eat what you cook'],
    isHidden: true,
  },
  {
    id: 'exp-kayak-mangroves',
    title: 'Kayaking Through Mangroves',
    description:
      'Paddle through the serene backwater mangroves of Zuari River. Spot kingfishers, mudskippers, and monitor lizards in their natural habitat.',
    category: 'adventure',
    location: { name: 'Zuari River, South Goa', lat: 15.3648, lng: 73.9522, area: 'South Goa' },
    durationMinutes: 150,
    cost: 1500,
    currency: 'INR',
    rating: 4.7,
    reviewCount: 267,
    images: ['https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=800&auto=format&fit=crop'],
    tags: ['adventure', 'nature', 'water', 'wildlife', 'eco-tourism'],
    groupTypes: ['solo', 'couple', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '06:00',
        endTime: '11:00',
        minDurationMinutes: 120,
        maxDurationMinutes: 180,
        maxGroupSize: 10,
        priceRange: { min: 1200, max: 2000 },
      },
    ],
    provider: { name: 'Konkan Explorers', verified: true, rating: 4.8 },
    highlights: ['Early morning best for wildlife', 'All equipment provided', 'No experience needed', 'Eco-friendly tour'],
    isHidden: false,
  },
  {
    id: 'exp-feni-tasting',
    title: 'Feni & Cashew Factory Tour',
    description:
      'Visit a traditional cashew feni distillery, learn the ancient art of feni-making, and taste 5 varieties of this unique Goan spirit.',
    category: 'food-walk',
    location: { name: 'Colvale, Goa', lat: 15.6231, lng: 73.8437, area: 'North Goa' },
    durationMinutes: 90,
    cost: 600,
    currency: 'INR',
    rating: 4.5,
    reviewCount: 156,
    images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop'],
    tags: ['drinks', 'factory-tour', 'local', 'tasting', 'cultural'],
    groupTypes: ['solo', 'couple', 'friends'],
    availability: [
      {
        dayOfWeek: [1, 2, 3, 4, 5],
        startTime: '10:00',
        endTime: '16:00',
        minDurationMinutes: 60,
        maxDurationMinutes: 120,
        maxGroupSize: 15,
        priceRange: { min: 400, max: 800 },
      },
    ],
    provider: { name: 'Big Boss Feni', verified: true, rating: 4.3 },
    highlights: ['5 feni varieties to taste', 'See traditional distillation', 'Buy artisanal feni', 'GI-tagged product'],
    isHidden: false,
  },
  {
    id: 'exp-pottery-workshop',
    title: 'Traditional Pottery Workshop',
    description:
      'Shape clay on a traditional wheel with a master potter from Bicholim. Create your own Goan terracotta piece to take home.',
    category: 'workshop',
    location: { name: 'Bicholim, Goa', lat: 15.5927, lng: 73.9572, area: 'Central Goa' },
    durationMinutes: 120,
    cost: 1200,
    currency: 'INR',
    rating: 4.6,
    reviewCount: 89,
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop'],
    tags: ['workshop', 'art', 'hands-on', 'traditional', 'craft'],
    groupTypes: ['solo', 'couple', 'family', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 2, 4, 6],
        startTime: '09:00',
        endTime: '17:00',
        minDurationMinutes: 90,
        maxDurationMinutes: 150,
        maxGroupSize: 6,
        priceRange: { min: 1000, max: 1500 },
      },
    ],
    provider: { name: 'Clay Stories Goa', verified: true, rating: 4.7 },
    highlights: ['Take home your creation', 'Learn from 3rd-gen potter', 'All materials included', 'Instagram-worthy'],
    isHidden: true,
  },
  {
    id: 'exp-dolphin-trip',
    title: 'Dolphin Spotting Boat Trip',
    description:
      'Early morning boat ride off Sinquerim Beach to spot Indo-Pacific humpback dolphins in their natural habitat. 95% sighting success rate.',
    category: 'nature',
    location: { name: 'Sinquerim Beach, Goa', lat: 15.4943, lng: 73.7645, area: 'North Goa' },
    durationMinutes: 90,
    cost: 700,
    currency: 'INR',
    rating: 4.4,
    reviewCount: 423,
    images: ['https://images.unsplash.com/photo-1570481662006-a3a1374699e8?q=80&w=800&auto=format&fit=crop'],
    tags: ['wildlife', 'boat', 'morning', 'family-friendly', 'nature'],
    groupTypes: ['solo', 'couple', 'family', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '07:00',
        endTime: '10:00',
        minDurationMinutes: 60,
        maxDurationMinutes: 120,
        maxGroupSize: 20,
        priceRange: { min: 500, max: 1000 },
      },
    ],
    provider: { name: 'Sinquerim Boatmen Assoc.', verified: true, rating: 4.2 },
    highlights: ['95% dolphin sighting rate', 'No seasickness (calm waters)', 'Life jackets provided', 'Great for kids'],
    isHidden: false,
  },
  {
    id: 'exp-yoga-beach',
    title: 'Sunrise Beach Yoga Session',
    description:
      'Start your day with a rejuvenating yoga session right on Morjim Beach. Suitable for all levels. Includes herbal tea and fruit bowl.',
    category: 'wellness',
    location: { name: 'Morjim Beach, Goa', lat: 15.6291, lng: 73.7302, area: 'North Goa' },
    durationMinutes: 75,
    cost: 500,
    currency: 'INR',
    rating: 4.8,
    reviewCount: 198,
    images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop'],
    tags: ['yoga', 'wellness', 'morning', 'beach', 'meditation'],
    groupTypes: ['solo', 'couple', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '06:00',
        endTime: '08:00',
        minDurationMinutes: 60,
        maxDurationMinutes: 90,
        maxGroupSize: 15,
        priceRange: { min: 400, max: 700 },
      },
    ],
    provider: { name: 'Soulful Goa Retreats', verified: true, rating: 4.9 },
    highlights: ['Sunrise on the beach', 'All levels welcome', 'Herbal tea included', 'Certified instructor'],
    isHidden: false,
  },
  {
    id: 'exp-market-tour',
    title: 'Mapusa Friday Market Tour',
    description:
      'Dive into the sensory overload of Goa\'s largest local market. Taste exotic fruits, haggle for spices, and discover treasures with a local guide.',
    category: 'food-walk',
    location: { name: 'Mapusa Market, Goa', lat: 15.5922, lng: 73.8107, area: 'North Goa' },
    durationMinutes: 120,
    cost: 400,
    currency: 'INR',
    rating: 4.6,
    reviewCount: 312,
    images: ['https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop'],
    tags: ['market', 'food', 'local', 'shopping', 'cultural'],
    groupTypes: ['solo', 'couple', 'family', 'friends'],
    availability: [
      {
        dayOfWeek: [5], // Friday only
        startTime: '08:00',
        endTime: '13:00',
        minDurationMinutes: 90,
        maxDurationMinutes: 150,
        maxGroupSize: 10,
        priceRange: { min: 300, max: 600 },
      },
    ],
    provider: { name: 'Goa Local Guides', verified: true, rating: 4.5 },
    highlights: ['Largest local market in Goa', 'Free tasting samples', 'Shopping tips from locals', 'Authentic Goan sausages'],
    isHidden: false,
  },
  {
    id: 'exp-street-art',
    title: 'Panjim Street Art & Graffiti Tour',
    description:
      'Discover Panjim\'s vibrant street art scene. Visit murals by Indian and international artists, learn the stories behind the art.',
    category: 'cultural',
    location: { name: 'Panjim, Goa', lat: 15.4989, lng: 73.8278, area: 'Panjim' },
    durationMinutes: 90,
    cost: 600,
    currency: 'INR',
    rating: 4.5,
    reviewCount: 145,
    images: ['https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?q=80&w=800&auto=format&fit=crop'],
    tags: ['art', 'urban', 'photography', 'walking', 'cultural'],
    groupTypes: ['solo', 'couple', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '09:00',
        endTime: '18:00',
        minDurationMinutes: 60,
        maxDurationMinutes: 120,
        maxGroupSize: 12,
        priceRange: { min: 400, max: 800 },
      },
    ],
    provider: { name: 'Art Walks India', verified: true, rating: 4.6 },
    highlights: ['15+ murals covered', 'Great for Instagram', 'Support local artists', 'Interactive art spots'],
    isHidden: true,
  },
  {
    id: 'exp-airport-lounge',
    title: 'Airport Lounge Access',
    description:
      'Relax in the premium Dabolim Airport lounge with complimentary food, drinks, Wi-Fi, and shower facilities. Perfect for flight delays.',
    category: 'wellness',
    location: { name: 'Goa Airport (GOI)', lat: 15.3808, lng: 73.8313, area: 'Airport' },
    durationMinutes: 180,
    cost: 1200,
    currency: 'INR',
    rating: 4.2,
    reviewCount: 567,
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'],
    tags: ['airport', 'lounge', 'comfort', 'food', 'rest'],
    groupTypes: ['solo', 'couple', 'family', 'friends', 'business'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '05:00',
        endTime: '23:00',
        minDurationMinutes: 60,
        maxDurationMinutes: 300,
        maxGroupSize: 50,
        priceRange: { min: 800, max: 1500 },
      },
    ],
    provider: { name: 'Plaza Premium Lounge', verified: true, rating: 4.3 },
    highlights: ['Unlimited food & drinks', 'Hot showers', 'Fast Wi-Fi', 'Power outlets everywhere'],
    isHidden: false,
  },
  {
    id: 'exp-dudhsagar-trek',
    title: 'Dudhsagar Falls Day Trip',
    description:
      'Epic jeep safari through the Western Ghats to the majestic Dudhsagar Falls — one of India\'s tallest waterfalls. Includes swimming and lunch.',
    category: 'adventure',
    location: { name: 'Mollem, Goa', lat: 15.3144, lng: 74.3147, area: 'East Goa' },
    durationMinutes: 480,
    cost: 3500,
    currency: 'INR',
    rating: 4.7,
    reviewCount: 891,
    images: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=800&auto=format&fit=crop'],
    tags: ['waterfall', 'trek', 'adventure', 'nature', 'jeep-safari'],
    groupTypes: ['solo', 'couple', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '06:00',
        endTime: '07:00',
        minDurationMinutes: 420,
        maxDurationMinutes: 540,
        maxGroupSize: 6,
        priceRange: { min: 3000, max: 4000 },
      },
    ],
    provider: { name: 'Goa Jungle Adventures', verified: true, rating: 4.6 },
    highlights: ['4th tallest waterfall in India', 'Jungle jeep safari', 'Swimming at the falls', 'Packed lunch included'],
    isHidden: false,
  },
  {
    id: 'exp-night-fishing',
    title: 'Night Fishing with Local Fishermen',
    description:
      'Join traditional Goan fishermen on a night fishing expedition. Learn traditional net-casting and cook your catch on the beach under the stars.',
    category: 'adventure',
    location: { name: 'Benaulim Beach, Goa', lat: 15.2645, lng: 73.9220, area: 'South Goa' },
    durationMinutes: 210,
    cost: 1800,
    currency: 'INR',
    rating: 4.8,
    reviewCount: 67,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'],
    tags: ['fishing', 'night', 'local', 'authentic', 'adventure', 'food'],
    groupTypes: ['solo', 'couple', 'friends'],
    availability: [
      {
        dayOfWeek: [0, 1, 2, 3, 4, 5],
        startTime: '19:00',
        endTime: '23:00',
        minDurationMinutes: 180,
        maxDurationMinutes: 240,
        maxGroupSize: 6,
        priceRange: { min: 1500, max: 2200 },
      },
    ],
    provider: { name: 'Benaulim Fishermen Coop', verified: true, rating: 4.7 },
    highlights: ['Cook your catch on the beach', 'Learn traditional fishing', 'Under the stars', 'Very few tourists know this'],
    isHidden: true,
  },
];

// ---------- Experience Matcher ----------
export function matchExperiencesToSlackWindow(
  experiences: Experience[],
  slackDurationMinutes: number,
  locationLat: number,
  locationLng: number,
  budget: number,
  groupType: string,
  maxDistanceKm: number = 30
): Experience[] {
  return experiences
    .filter((exp) => {
      // Duration fits
      const durationFits = exp.durationMinutes <= slackDurationMinutes - 30; // 30min buffer for travel

      // Budget fits
      const budgetFits = exp.cost <= budget;

      // Group type fits
      const groupFits = exp.groupTypes.includes(groupType as Experience['groupTypes'][number]);

      // Distance check (rough haversine)
      const distance = haversineDistance(locationLat, locationLng, exp.location.lat, exp.location.lng);
      const distanceFits = distance <= maxDistanceKm;

      return durationFits && budgetFits && groupFits && distanceFits;
    })
    .sort((a, b) => {
      // Sort by: rating (desc), then hidden gems first, then cost (asc)
      if (a.isHidden !== b.isHidden) return a.isHidden ? -1 : 1;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return a.cost - b.cost;
    })
    .slice(0, 5); // Return top 5 matches
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
