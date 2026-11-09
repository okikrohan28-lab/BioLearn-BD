const contentService = require('../services/content.service');

const getCatalogue = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const catalogue = await contentService.getFullCatalogue(isAdmin);
    res.status(200).json({
      success: true,
      data: catalogue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCatalogue,
};
