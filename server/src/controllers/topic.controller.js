const contentService = require('../services/content.service');

const getTopics = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const filter = isAdmin ? {} : { status: 'published' };
    if (req.query.chapterId) {
      filter.chapter_id = req.query.chapterId;
    }
    const topics = await contentService.getTopics(filter);
    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

const getTopicById = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const filter = isAdmin ? {} : { status: 'published' };
    const topic = await contentService.getTopicById(req.params.id, filter);
    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

const createTopic = async (req, res, next) => {
  try {
    const { chapter_id, topic_no, title, description, status } = req.body;
    const topic = await contentService.createTopic({
      chapter_id,
      topic_no: Number(topic_no),
      title,
      description,
      status,
    });
    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

const updateTopic = async (req, res, next) => {
  try {
    const topic = await contentService.updateTopic(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTopic = async (req, res, next) => {
  try {
    await contentService.deleteTopic(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
};
