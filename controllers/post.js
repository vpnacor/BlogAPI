const mongoose = require('mongoose')
const Post = require('../models/Post')
const {errorHandler} = require('../auth')


module.exports.postAdd = (req, res) => {
    const { title, content, information } = req.body;


    const errors = [];

    if (!title || typeof title !== 'string' || title.trim() === '') {
        errors.push('Title is required.');
    } else if (title.trim().length < 3 || title.trim().length > 100) {
        errors.push('Title must be between 3 and 100 characters.');
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
        errors.push('Content is required.');
    } else if (content.trim().length < 10) {
        errors.push('Content must be at least 10 characters.');
    }

    if (information && typeof information !== 'string') {
        errors.push('Information must be a string.');
    } else if (information && information.trim().length > 500) {
        errors.push('Information must not exceed 500 characters.');
    }

    if (errors.length > 0) {
        return res.status(400).send({ errors });
    }

    let newPost = new Post({
        title: title.trim(),
        content: content.trim(),
        author: req.user.username,
        information: information ? information.trim() : undefined
    });

    return newPost.save()
        .then(post => {
            return res.status(200).send({
                title: post.title,
                content: post.content,
                author: post.author,
                information: post.information,
                creationDate: post.creationDate
            });
        })
        .catch(err => errorHandler(err, req, res));
};



module.exports.getSinglePost = (req, res) => {

  
    if (!req.params.id || req.params.id.trim() === '') {
        return res.status(400).send({ error: 'Post ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: 'Invalid Post ID format.' });
    }


    if (!req.user || !req.user.username) {
        return res.status(401).send({ error: 'Unauthorized: User not authenticated.' });
    }

    return Post.findById(req.params.id)
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: 'Post not found.' });
            }

            // if (result.author !== req.user.username) {
            //     return res.status(403).send({ error: 'Forbidden: You can only view your own posts.' });
            // }

            return res.status(200).send({
                _id:result._id,
                title: result.title,
                content: result.content,
                information: result.information,
                author: result.author,
                creationDate: result.creationDate
            });
        })
        .catch(err => errorHandler(err, req, res));
};




module.exports.getAllMyPost = (req, res) => {

    if (!req.user || !req.user.username) {
        return res.status(401).send({ error: 'Unauthorized: User not authenticated.' });
    }

    if (typeof req.user.username !== 'string' || req.user.username.trim() === '') {
        return res.status(400).send({ error: 'Invalid username.' });
    }

    return Post.find({ author: req.user.username.trim() })
        .then(result => {
            if (!result || result.length === 0) {
                return res.status(404).send({ error: 'No posts found.' });
            }

            return res.status(200).send({
                post: result.map(w => ({
                    _id: w._id, 
                    title: w.title,
                    content: w.content,
                    author: w.author,
                    information: w.information,
                    creationDate: w.creationDate
                }))
            });
        })
        .catch(err => errorHandler(err, req, res));
};



module.exports.getAllPost = (req, res) => {
    return Post.find({})
        .then(p => {
            return res.status(200).send({
                post: p.map(w => ({
                    _id: w._id,  
                    title: w.title,
                    author: w.author,
                    content: w.content,
                    information: w.information,
                    creationDate: w.creationDate
                }))
            })
        })
}



module.exports.updatePost = (req, res) => {

    
    if (!req.params.id || req.params.id.trim() === '') {
        return res.status(400).send({ error: 'Post ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: 'Invalid Post ID format.' });
    }

    const { title, content, information } = req.body;


    const errors = [];

    if (!title || typeof title !== 'string' || title.trim() === '') {
        errors.push('Title is required.');
    } else if (title.trim().length < 3 || title.trim().length > 100) {
        errors.push('Title must be between 3 and 100 characters.');
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
        errors.push('Content is required.');
    } 
    else if (content.trim().length < 10) {
        errors.push('Content must be at least 10 characters.');
    }

    if (information && typeof information !== 'string') {
        errors.push('Information must be a string.');
    } else if (information && information.trim().length > 500) {
        errors.push('Information must not exceed 500 characters.');
    }

    if (errors.length > 0) {
        return res.status(400).send({ errors });
    }

    let updatedPost = {
        title: title.trim(),
        content: content.trim(),
        information: information ? information.trim() : undefined
    };

    return Post.findByIdAndUpdate(req.params.id, updatedPost, { new: true })
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: 'Post not found.' });
            }

            return res.status(200).send({
                title: result.title,
                content: result.content,
                information: result.information
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.deletePost = (req, res) => {


    if (!req.params.id || req.params.id.trim() === '') {
        return res.status(400).send({ error: 'Post ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: 'Invalid Post ID format.' });
    }

    if (!req.user || !req.user.username) {
        return res.status(401).send({ error: 'Unauthorized: User not authenticated.' });
    }

    return Post.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).send({ error: 'Post not found.' });
            }
    const isAuthor = post.author === req.user.username;
    const isAdmin = req.user.email === 'admin@mail.com';


    if (!isAuthor && !isAdmin) {
    return res.status(403).send({ error: 'Forbidden: You can only delete your own posts.' });
    }

            return Post.findByIdAndDelete(req.params.id)
                .then(result => {
                    return res.status(200).send({ message: 'Post successfully deleted.' });
                });
        })
        .catch(err => errorHandler(err, req, res));
};