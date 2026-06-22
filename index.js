const express = require('express');
const mongoose= require('mongoose')
const dotenv = require('dotenv');
const app = express();
const userRoutes = require('./routes/user')
const postRoutes = require('./routes/post');
const cors = require('cors')


dotenv.config();

let db = mongoose.connection; 
mongoose.connect(process.env.MONGODB_STRING);







db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => console.log('Now connected to MongoDB Atlas.'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://blog-app-client-jet.vercel.app',
        'https://blog-app-client-git-master-vincent-paul-nacor-s-projects.vercel.app',
        'https://blog-app-client-l8cpgmxq0-vincent-paul-nacor-s-projects.vercel.app'
    ],
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use('/users', userRoutes)
app.use('/post', postRoutes)

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => console.log(`Server running at port ${process.env.PORT || 3000}`))
}



module.exports = {app, mongoose}