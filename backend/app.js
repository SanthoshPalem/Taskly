const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const taskRoutes = require('./routes/taskRoutes');
const User = require('./models/User');
const Group = require('./models/Group');

dotenv.config();
const app = express();

// Configure CORS with specific origins and credentials support
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://taskly-ecfs.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight response for 10 minutes
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Taskly Backend API is running!', status: 'healthy' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("MongoDB connected successfully");
})
.catch((err)=>{
    console.log("Error",err);
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

