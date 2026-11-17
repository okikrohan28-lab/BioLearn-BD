const express = require('express');
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resource.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { handleResourceUpload } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', optionalAuth, getResources);
router.post('/', authenticate, authorize('admin'), handleResourceUpload, createResource);
router.put('/:id', authenticate, authorize('admin'), handleResourceUpload, updateResource);
router.delete('/:id', authenticate, authorize('admin'), deleteResource);

module.exports = router;
