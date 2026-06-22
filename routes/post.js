const express = require('express');
const router = express.Router();
const {verify} = require('../auth');
const postController = require('../controllers/post')

router.post('/addPost', verify, postController.postAdd)
router.get('/getAllMyPost', verify, postController.getAllMyPost)
router.get('/getAllPost', verify, postController.getAllPost)
router.get('/getSinglePost/:id', verify, postController.getSinglePost)
router.patch('/updatePost/:id', verify, postController.updatePost)
router.delete('/deletePost/:id', verify, postController.deletePost)

module.exports = router;