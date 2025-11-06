export interface YouTubePreview {
  url: string;
  videoId: string;
  title?: string;
  thumbnail?: string;
}

export const extractYouTubeUrl = (text: string): YouTubePreview | null => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = text.match(youtubeRegex);
  
  if (match) {
    const videoId = match[1];
    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      videoId: videoId,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }
  
  return null;
};

export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

