import { StreamProviderAdapter, PlaybackInfo } from "../types";

export class ExternalStreamAdapter implements StreamProviderAdapter {
  async getPlaybackInfo(config: any): Promise<PlaybackInfo> {
    if (!config?.url) throw new Error("Missing URL in stream config");
    
    // In the future, we can sign URLs here if needed
    return {
      url: config.url,
      type: config.type || 'hls', // Default to HLS
    };
  }

  validateConfig(config: any): boolean {
    return typeof config?.url === 'string';
  }
}