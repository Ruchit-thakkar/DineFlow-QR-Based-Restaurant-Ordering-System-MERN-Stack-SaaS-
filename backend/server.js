const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});
const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to our router
app.set('io', io);

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(express.static(path.join(__dirname, "./public")));


// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/item'));
app.use('/api/tables', require('./routes/table'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/bill-settings', require('./routes/billSettings'));
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
