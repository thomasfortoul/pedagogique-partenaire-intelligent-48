
export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  url?: string; // Would be populated when using real storage
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
  documents?: Document[];
  session?: string; // Added session field
  instructor?: string; // Added instructor field for potential future use
}
