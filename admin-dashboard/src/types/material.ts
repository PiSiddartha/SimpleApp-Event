// Material types

export interface Material {
  id: string;
  event_id: string;
  title: string;
  file_url: string;
  file_type?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface CreateMaterialInput {
  event_id: string;
  title: string;
  file_type: string;
}

export interface MaterialDownloadResponse {
  material_id: string;
  title: string;
  download_url: string;
  expires_in: number;
}
