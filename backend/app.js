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
  'https://taskly-ecfs.onrender.com',
  'https://taskly-santhosh.netlify.app',
  'https://taskly-santhosh.netlify.app/'
];

console.log('Configuring CORS with allowed origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      console.log('No origin header, allowing request');
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    const originIsAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith('http://localhost:') ||
      origin.includes('netlify.app')
    );

    console.log('Request from origin:', origin, 'Allowed:', originIsAllowed);
    
    if (!originIsAllowed) {
      console.log('CORS error: Origin not allowed -', origin);
      const msg = `The CORS policy for this site does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // Cache preflight response for 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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

