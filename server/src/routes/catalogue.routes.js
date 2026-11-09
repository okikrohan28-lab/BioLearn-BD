const express = require('express');
const { getCatalogue } = require('../controllers/catalogue.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalAuth, getCatalogue);

module.exports = router;
