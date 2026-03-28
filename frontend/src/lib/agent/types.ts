export interface Rating {
  score: number | null;
  review_count: number | null;
  url: string | null;
}

export interface SocialComment {
  text: string;
  source: string;
  author: string;
  upvotes?: number;
  date?: string;
}

export interface LocationImage {
  url: string;
  source: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type LocationCategory =
  | "surf"
  | "food"
  | "temple"
  | "beach"
  | "nightlife"
  | "nature"
  | "shopping";

export interface Location {
  name: string;
  category: LocationCategory;
  summary: string;
  ratings: {
    google: Rating;
    tripadvisor: Rating;
  };
  social_comments: SocialComment[];
  images: LocationImage[];
  best_time: string;
  warnings: string[];
  opening_hours: string | null;
  entry_price: string | null;
  coordinates: Coordinates;
  source_count: number;
}

// Discovery skill returns this
export type DiscoveryResult = Location[];
