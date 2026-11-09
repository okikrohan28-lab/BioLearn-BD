const contentService = require('../services/content.service');

const getChapters = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const filter = isAdmin ? {} : { status: 'published' };
    if (req.query.paperId) {
      filter.paper_id = req.query.paperId;
    }
    const chapters = await contentService.getChapters(filter);
    res.status(200).json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

const getChapterById = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const filter = isAdmin ? {} : { status: 'published' };
    const chapter = await contentService.getChapterById(req.params.id, filter);
    res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

const createChapter = async (req, res, next) => {
  try {
    const { paper_id, chapter_no, title, description, status } = req.body;
    const chapter = await contentService.createChapter({
      paper_id,
      chapter_no: Number(chapter_no),
      title,
      description,
      status,
    });
    res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

const updateChapter = async (req, res, next) => {
  try {
    const chapter = await contentService.updateChapter(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

const deleteChapter = async (req, res, next) => {
  try {
    await contentService.deleteChapter(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
};
