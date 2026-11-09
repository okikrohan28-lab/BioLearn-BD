const contentService = require('../services/content.service');

const getPapers = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const filter = isAdmin ? {} : { status: 'published' };
    const papers = await contentService.getPapers(filter);
    res.status(200).json({
      success: true,
      data: papers,
    });
  } catch (error) {
    next(error);
  }
};

const getPaperById = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const filter = isAdmin ? {} : { status: 'published' };
    const paper = await contentService.getPaperById(req.params.id, filter);
    res.status(200).json({
      success: true,
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

const createPaper = async (req, res, next) => {
  try {
    const { title, subject, access_level, status, description } = req.body;
    const paper = await contentService.createPaper({ title, subject, access_level, status, description });
    res.status(201).json({
      success: true,
      message: 'Paper created successfully',
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

const updatePaper = async (req, res, next) => {
  try {
    const paper = await contentService.updatePaper(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Paper updated successfully',
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

const deletePaper = async (req, res, next) => {
  try {
    await contentService.deletePaper(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Paper deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
};
