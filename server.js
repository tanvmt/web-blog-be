require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const mainApiRouter = require('./routes');


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

app.use('/api', mainApiRouter);

const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Khởi động server thất bại, không thể kết nối CSDL:');
        console.error(error);
        process.exit(1);
    }
}

startServer();
