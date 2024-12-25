const express = require('express');
const app = express();
const cors = require('cors');

require('./configs/connectDB');
require('dotenv').config();
const port = process.env.PORT || 240;

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const foodRoutes = require('./routes/foodRoutes');
const goalRoutes = require('./routes/goalRoutes');
const mealRoutes = require('./routes/mealRoutes');
const sleepRoutes = require('./routes/sleepRoutes');
const userRoutes = require('./routes/userRoutes');
const waterRoutes = require('./routes/waterRoutes');
const weightRoutes = require('./routes/weightRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/exercise", exerciseRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/goal', goalRoutes);
app.use('/api/v1/meal', mealRoutes);
app.use('/api/v1/sleep', sleepRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/water', waterRoutes);
app.use('/api/v1/weight', weightRoutes);
app.use('/api/v1/workout', workoutRoutes);

app.listen(port, ()=> {
    console.log(`Server is listening on Port: ${port}`);
})