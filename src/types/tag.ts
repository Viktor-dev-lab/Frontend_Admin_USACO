export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface TagPaging {
  page: number;
  limit: number;
  totalCount: number;
}

export interface TagResponse {
  data: Tag[];
  paging: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateTagInput {
  name: string;
  slug: string;
}

export interface UpdateTagInput {
  name: string;
}

// Value export to ensure Vite treats this as a valid JS module
export const TAG_TYPES = {};
