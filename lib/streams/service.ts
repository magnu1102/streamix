import { prisma } from "@/lib/prisma";
import { ExternalStreamAdapter } from "./adapters/external";
import { StreamProviderAdapter, ProviderType } from "./types";

// Factory to get adapter
function getAdapter(type: string): StreamProviderAdapter {
  switch (type) {
    case 'EXTERNAL_HLS':
    case 'EXTERNAL_MP4':
      return new ExternalStreamAdapter();
    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}

export async function resolveStream(token: string) {
  // 1. Fetch from DB
  const stream = await prisma.stream.findUnique({
    where: { token },
  });

  // 2. Validation
  if (!stream) {
    throw new Error("Stream not found");
  }
  if (!stream.isActive) {
    throw new Error("Stream is currently inactive");
  }

  // 3. Use Adapter
  const adapter = getAdapter(stream.providerType);
  const playbackInfo = await adapter.getPlaybackInfo(stream.providerConfig);

  return {
    id: stream.id,
    name: stream.name,
    playback: playbackInfo,
  };
}