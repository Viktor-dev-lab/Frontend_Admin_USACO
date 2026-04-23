export interface Platform {
  id: number;
  name: string;
  slug: string;
  base_url: string;
}

export interface PlatformResponse {
  data: Platform[];
}

export interface CreatePlatformInput {
  name: string;
  slug: string;
  base_url: string;
}

export interface UpdatePlatformInput {
  name?: string;
  slug?: string;
  base_url?: string;
}

// Value export to ensure Vite treats this as a valid JS module
export const PLATFORM_TYPES = {};
