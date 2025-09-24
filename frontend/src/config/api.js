// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_BASE_URL || 'http://localhost:5000',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
};

// Helper function to get full video URL
export const getVideoUrl = (videoPath) => {
  if (!videoPath) return null;
  
  // If it's already a full URL, return as is
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    return videoPath;
  }
  
  // If it starts with /videos/, prepend base URL
  if (videoPath.startsWith('/videos/')) {
    return `${API_CONFIG.BASE_URL}${videoPath}`;
  }
  
  // If it's just a filename, construct full path
  return `${API_CONFIG.BASE_URL}/videos/${videoPath}`;
};

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /uploads/, prepend base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // If it's just a filename, construct full path
  return `${API_CONFIG.BASE_URL}/uploads/${imagePath}`;
};
