const { createAccessToken, verify, errorHandler } = require('../auth')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')


module.exports.userRegistration = (req, res) => {

    const { email, username, password } = req.body;

  
    const errors = [];

    if (!email || typeof email !== 'string' || email.trim() === '') {
        errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push('Invalid email format.');
    }

    if (!username || typeof username !== 'string' || username.trim() === '') {
        errors.push('Username is required.');
    } else if (username.trim().length < 3 || username.trim().length > 20) {
        errors.push('Username must be between 3 and 20 characters.');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        errors.push('Username can only contain letters, numbers, and underscores.');
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
        errors.push('Password is required.');
    } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters.');
    } else if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter.');
    } else if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number.');
    }

    if (errors.length > 0) {
        return res.status(400).send({ errors });
    }

    return User.findOne({ $or: [{ email: email.trim() }, { username: username.trim() }] })
        .then(existingUser => {
            if (existingUser) {
                if (existingUser.email === email.trim()) {
                    return res.status(409).send({ error: 'Email is already registered.' });
                }
                if (existingUser.username === username.trim()) {
                    return res.status(409).send({ error: 'Username is already taken.' });
                }
            }

            let newAccount = new User({
                email: email.trim(),
                username: username.trim(),
                password: bcrypt.hashSync(password, 10)
            });

            return newAccount.save()
                .then(account => {
                    return res.status(200).send({ message: 'Registered Successfully.' });
                });
        })
        .catch(err => errorHandler(err, req, res));
};




module.exports.userLogin = (req, res) => {

    const { email, password } = req.body;

    // Validation
    const errors = [];

    if (!email || typeof email !== 'string' || email.trim() === '') {
        errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push('Invalid email format.');
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
        errors.push('Password is required.');
    }

    if (errors.length > 0) {
        return res.status(400).send({ errors });
    }

    return User.findOne({ email: email.trim() })
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: 'Email not found.' });
            }

            const isPasswordCorrect = bcrypt.compareSync(password, result.password);

            if (!isPasswordCorrect) {
                return res.status(401).send({ message: 'Incorrect password.' });
            }

            return res.status(200).send({
                access: createAccessToken(result)
            });
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.getUserDetails = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send({ error: 'Unauthorized: No user session found' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).send({ error: 'Invalid user ID format' });
    }

    return User.findById(req.user.id)
        .select('-password')
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }

            if (!user.email || !user.username) {
                return res.status(500).send({ error: 'User data is incomplete' });
            }

            return res.status(200).send({
                email: user.email,
                username: user.username
            });
        })
        .catch(err => errorHandler(err, req, res));
};