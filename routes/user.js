const express = require('express')
const router = express.Router();
const userController = require('../controllers/user')
const {verify} = require('../auth')

router.post('/register', userController.userRegistration);
router.post('/login', userController.userLogin);
router.get('/details', verify , userController.getUserDetails);


module.exports = router;