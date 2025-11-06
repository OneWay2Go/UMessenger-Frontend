export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 168) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export const formatLastSeen = (dateString?: string): string => {
  if (!dateString) return 'last seen recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 1) {
    return 'last seen recently';
  } else if (diffInMinutes < 60) {
    return `last seen ${Math.floor(diffInMinutes)} minutes ago`;
  } else if (diffInMinutes < 1440) {
    return `last seen ${Math.floor(diffInMinutes / 60)} hours ago`;
  } else {
    return `last seen ${Math.floor(diffInMinutes / 1440)} days ago`;
  }
};

