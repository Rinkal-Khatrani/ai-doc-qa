export interface Document {
  id: string;
  filename: string;
  status: "processing" | "ready" | "failed";
  page_count: number | null;
  char_count: number | null;
  created_at: string;
}

export interface Citation {
  id: string;
  chunk_index: number;
  text: string;
  page_number: number | null;
  score: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  streaming?: boolean;
}
