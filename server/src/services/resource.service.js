const fs = require('fs');
const path = require('path');
const Resource = require('../models/Resource');

// Extract YouTube video ID from URL
const extractYoutubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const isValidYoutubeUrl = (url) => {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const getResources = async (topicId, isAdmin = false) => {
  if (!topicId) {
    const error = new Error('topicId query parameter is required');
    error.statusCode = 400;
    throw error;
  }
  const filter = { topic_id: topicId };
  if (!isAdmin) filter.status = 'published';
  return await Resource.find(filter).sort({ order: 1, createdAt: 1 });
};

const createResource = async (data) => {
  const { topic_id, resource_type, title, content, image_url, youtube_url, order, status } = data;

  // Normalise resource type ('video' -> 'youtube' for video embeds)
  const normType = resource_type === 'video' ? 'youtube' : resource_type;

  let file_url = data.file_url || '';
  let file_name = data.file_name || '';
  let file_type = data.file_type || '';
  let file_size = data.file_size || 0;

  if (data.file) {
    file_url = `/uploads/resources/${data.file.filename}`;
    file_name = data.file.originalname;
    file_type = data.file.mimetype;
    file_size = data.file.size;
  }

  if (normType === 'youtube') {
    if (!youtube_url || !isValidYoutubeUrl(youtube_url)) {
      const error = new Error('A valid YouTube URL (youtube.com or youtu.be) is required for video resources');
      error.statusCode = 400;
      throw error;
    }
    const videoId = extractYoutubeVideoId(youtube_url);
    if (!videoId) {
      const error = new Error('Could not extract video ID from the provided YouTube URL');
      error.statusCode = 400;
      throw error;
    }
    return await Resource.create({
      topic_id,
      resource_type: 'youtube',
      title,
      youtube_url,
      youtube_video_id: videoId,
      order: order || 0,
      status: status || 'published',
    });
  }

  if (normType === 'diagram') {
    // Diagram can have either an uploaded image file or a valid external image URL
    const finalImageUrl = file_url || image_url;
    if (!finalImageUrl) {
      const error = new Error('Please upload an image file (JPEG, PNG) or provide an image URL for the diagram');
      error.statusCode = 400;
      throw error;
    }
    if (!file_url && image_url && !isValidUrl(image_url)) {
      const error = new Error('A valid image URL is required for diagram resources');
      error.statusCode = 400;
      throw error;
    }

    return await Resource.create({
      topic_id,
      resource_type: 'diagram',
      title,
      image_url: finalImageUrl,
      file_url,
      file_name,
      file_type,
      file_size,
      order: order || 0,
      status: status || 'published',
    });
  }

  // note category (can have text content, an uploaded document: PDF, Word, or both)
  return await Resource.create({
    topic_id,
    resource_type: 'note',
    title,
    content: content || '',
    file_url,
    file_name,
    file_type,
    file_size,
    order: order || 0,
    status: status || 'published',
  });
};

const updateResource = async (id, data) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  const rawType = data.resource_type || resource.resource_type;
  const normType = rawType === 'video' ? 'youtube' : rawType;
  data.resource_type = normType;

  // Handle uploaded file if present
  if (data.file) {
    data.file_url = `/uploads/resources/${data.file.filename}`;
    data.file_name = data.file.originalname;
    data.file_type = data.file.mimetype;
    data.file_size = data.file.size;
    if (normType === 'diagram') {
      data.image_url = data.file_url;
    }
  }

  if (normType === 'youtube' && data.youtube_url) {
    if (!isValidYoutubeUrl(data.youtube_url)) {
      const error = new Error('A valid YouTube URL (youtube.com or youtu.be) is required');
      error.statusCode = 400;
      throw error;
    }
    const videoId = extractYoutubeVideoId(data.youtube_url);
    if (!videoId) {
      const error = new Error('Could not extract video ID from the provided YouTube URL');
      error.statusCode = 400;
      throw error;
    }
    data.youtube_video_id = videoId;
  }

  if (normType === 'diagram' && data.image_url && !data.file) {
    if (!isValidUrl(data.image_url)) {
      const error = new Error('A valid image URL is required');
      error.statusCode = 400;
      throw error;
    }
  }

  // Remove data.file object before passing to Mongoose
  delete data.file;

  return await Resource.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

const deleteResource = async (id) => {
  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  // If local file was uploaded, attempt to unlink it safely
  if (resource.file_url && resource.file_url.startsWith('/uploads/resources/')) {
    try {
      const localPath = path.join(__dirname, '../../', resource.file_url);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (err) {
      console.warn('Could not unlink resource file:', err.message);
    }
  }

  return resource;
};

module.exports = {
  getResources,
  createResource,
  updateResource,
  deleteResource,
};
