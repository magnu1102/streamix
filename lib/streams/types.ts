export interface PlaybackInfo {
  url: string;
  type: 'native' | 'hls' | 'dash' | 'embed';
  headers?: Record<string, string>;
}

export interface StreamProviderAdapter {
  getPlaybackInfo(config: any): Promise<PlaybackInfo>;
  validateConfig(config: any): boolean;
}

export type ProviderType = 'EXTERNAL_HLS' | 'EXTERNAL_MP4';