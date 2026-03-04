const express = require('express');
const router = express.Router();
const customPackageImageController = require('../../controllers/customPackageImageController');
const localUpload = require('../../middleware/localUpload');

// Routes
router.get('/', customPackageImageController.showDashboard);
router.post('/', localUpload.array('images', 100), customPackageImageController.addImage);
router.put('/:id', localUpload.array('images', 100), customPackageImageController.editImage);
router.delete('/:id', customPackageImageController.deleteImage);

module.exports = router;
