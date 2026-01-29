export interface UpdateInfo {
  version: string;
  releaseName?: string;
  releaseNotes?: string;
}

export interface UpdateState {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  downloaded: boolean;
  error: string | null;
  info: UpdateInfo | null;
  progress: number | null;
}
