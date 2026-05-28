export type VisitedPlace = {
  name: string
  country: string
  coordinates: [number, number]
  slug: string
}

export const visitedPlaces: VisitedPlace[] = [
  {
    name: 'Barcelona',
    country: 'Spain',
    coordinates: [2.173403, 41.385063],
    slug: 'barcelona-new-year-2026'
  },
  {
    name: 'Valencia',
    country: 'Spain',
    coordinates: [-0.376288, 39.469908],
    slug: 'valencia-visit-20251224'
  },
  {
    name: 'Horton on Water',
    country: 'United Kingdom',
    coordinates: [-2.146, 51.713],
    slug: 'horton-on-water-20240414'
  },
  {
    name: 'Greater Noida West',
    country: 'India',
    coordinates: [77.4745, 28.5716],
    slug: 'greater-noida-west'
  },
  {
    name: 'Jaunpur',
    country: 'India',
    coordinates: [82.6855, 25.7617],
    slug: 'Jaunpur'
  },
  {
    name: 'Paris',
    country: 'France',
    coordinates: [2.352222, 48.856613],
    slug: 'Paris'
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    coordinates: [4.9041, 52.3676],
    slug: 'Amsterdam'
  },
  {
    name: 'Abu Dhabi',
    country: 'United Arab Emirates',
    coordinates: [54.3773, 24.4539],
    slug: 'Abu Dhabi'
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: [55.2708, 25.2048],
    slug: 'Dubai'
  },
  {
    name: 'Prayagraj',
    country: 'India',
    coordinates: [81.8463, 25.4358],
    slug: 'Prayagraj'
  },
  {
    name: 'Chennai',
    country: 'India',
    coordinates: [80.2707, 13.0827],
    slug: 'Chennai'
  },
  {
    name: 'Hyderabad',
    country: 'India',
    coordinates: [78.4867, 17.385],
    slug: 'Hyderabad'
  },
  {
    name: 'Bangaluru',
    country: 'India',
    coordinates: [77.5946, 12.9716],
    slug: 'Bangaluru'
  },
  {
    name: 'Mumbai',
    country: 'India',
    coordinates: [72.8777, 19.076],
    slug: 'Mumbai'
  },
  {
    name: 'Kolkata',
    country: 'India',
    coordinates: [88.3639, 22.5726],
    slug: 'Kolkata'
  },
  {
    name: 'Lucknow',
    country: 'India',
    coordinates: [80.9462, 26.8467],
    slug: 'Lucknow'
  },
  {
    name: 'Kanpur',
    country: 'India',
    coordinates: [80.3319, 26.4499],
    slug: 'Kanpur'
  },
  {
    name: 'Bhopal',
    country: 'India',
    coordinates: [77.4126, 23.2599],
    slug: 'Bhopal'
  },
  {
    name: 'Ahmedabad',
    country: 'India',
    coordinates: [72.5714, 23.0225],
    slug: 'Ahmedabad'
  },
  {
    name: 'Shimla',
    country: 'India',
    coordinates: [77.1734, 31.1048],
    slug: 'Shimla'
  },
  {
    name: 'Manali',
    country: 'India',
    coordinates: [77.1887, 32.2396],
    slug: 'Manali'
  },
  {
    name: 'Jaipur',
    country: 'India',
    coordinates: [75.7873, 26.9124],
    slug: 'Jaipur'
  },
  {
    name: 'Udaipur',
    country: 'India',
    coordinates: [73.7125, 24.5854],
    slug: 'Udaipur'
  },
  {
    name: 'Mount Abu',
    country: 'India',
    coordinates: [72.5937, 24.5937],
    slug: 'Mount Abu'
  },
  {
    name: 'Varanasi',
    country: 'India',
    coordinates: [82.9739, 25.3176],
    slug: 'Varanasi'
  },
  {
    name: 'Gorakhpur',
    country: 'India',
    coordinates: [83.3732, 26.7606],
    slug: 'Gorakhpur'
  },
  {
    name: 'Azamgarh',
    country: 'India',
    coordinates: [83.1833, 26.0606],
    slug: 'Azamgarh'
  },
  {
    name: 'Mathura',
    country: 'India',
    coordinates: [77.6737, 27.4924],
    slug: 'Mathura'
  },
  {
    name: 'Dhanaulti',
    country: 'India',
    coordinates: [78.2707, 30.4827],
    slug: 'Dhanaulti'
  },
  {
    name: 'Dalhousie',
    country: 'India',
    coordinates: [76.5312, 32.5375],
    slug: 'Dalhousie'
  },
  {
    name: 'Mcloed Ganj',
    country: 'India',
    coordinates: [76.3206, 32.2196],
    slug: 'mcloed-ganj'
  },
  {
    name: 'Lansdowne',
    country: 'India',
    coordinates: [78.6194, 29.8463],
    slug: 'lansdowne'
  },
  {
    name: 'Ernakulam',
    country: 'India',
    // corrected to Kochi / Ernakulam central coordinates (lon, lat)
    coordinates: [76.2673, 9.9312],
    slug: 'ernakulam'
  }
]

export const visitedCountries: string[] = Array.from(new Set(visitedPlaces.map((p) => p.country)))
