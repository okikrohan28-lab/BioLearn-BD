const resourceService = require('../services/resource.service');

const getResources = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const resources = await resourceService.getResources(req.query.topicId, isAdmin);
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.file = req.file;
    }
    const resource = await resourceService.createResource(payload);
    res.status(201).json({ success: true, message: 'Resource created successfully', data: resource });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.file = req.file;
    }
    const resource = await resourceService.updateResource(req.params.id, payload);
    res.status(200).json({ success: true, message: 'Resource updated successfully', data: resource });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    await resourceService.deleteResource(req.params.id);
    res.status(200).json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getResources, createResource, updateResource, deleteResource };
