require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const prisma = require('./src/config/db.config');
const redisClient = require('./src/config/redis.config');


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

(async () => {
    try {
        await prisma.$connect();
        console.log("✅ Prisma connected");

        console.log("✅ Redis status:", redisClient.status);

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Startup error:", err);
        process.exit(1);
    }
})();