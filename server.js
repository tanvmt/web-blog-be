require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const db = require('./models');

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to News Recommendation API!' });
});


const PORT = process.env.PORT || 8080;

db.sequelize.sync({ force: false }) 
    .then(() => {
        console.log('Database synced successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });
