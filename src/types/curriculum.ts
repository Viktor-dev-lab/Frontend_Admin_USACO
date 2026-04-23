export interface Platform {
  id: number;
  name: string;
  slug: string | null;
  base_url: string | null;
}

export type ContentBlockType = 
  | 'heading' 
  | 'paragraph' 
  | 'image' 
  | 'codeBlock' 
  | 'video' 
  | 'file' 
  | 'multi_code_block'
  | 'markdown' // keeping for backward compatibility if any
  | 'callout';  // keeping for backward compatibility if any

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string; // The main text content
  props?: {
    level?: number;
    url?: string;
    caption?: string;
    width?: number;
    language?: string;
    isPremium?: boolean;
    fileName?: string;
    fileType?: string;
    fileSize?: string;
    cppCode?: string;
    javaCode?: string;
    pythonCode?: string;
    [key: string]: any;
  };
}

export interface Division {
  id: number;
  name: string;
  min_rating: number;
  max_rating: number;
  description: string | null;
  modules?: Module[];
}

export interface Module {
  id: number;
  division_id: number;
  title: string;
  order_index: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  short_desc: string | null;
  frequency: string | null;
  frequency_level: number | null;
  order_index: number;
  content_json: ContentBlock[] | null; 
  has_premium_blocks: boolean | null;
}
