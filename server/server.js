const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'imovies_super_secret_key_123';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

let isMongoConnected = false;

// Sample Initial Movies Data
const INITIAL_MOVIES = [
  {
    title: "Interstellar",
    genre: "Sci-Fi / Adventure",
    duration: "2h 49m",
    rating: "8.7/10",
    ticketPrice: 250,
    showtimes: ["10:00 AM", "02:15 PM", "06:30 PM", "10:00 PM"],
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    bookedSeats: ["A1", "A2"]
  },
  {
    title: "Inception",
    genre: "Action / Sci-Fi",
    duration: "2h 28m",
    rating: "8.8/10",
    ticketPrice: 220,
    showtimes: ["11:30 AM", "03:45 PM", "07:15 PM"],
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    bookedSeats: ["B3"]
  },
  {
    title: "The Dark Knight",
    genre: "Action / Crime",
    duration: "2h 32m",
    rating: "9.0/10",
    ticketPrice: 300,
    showtimes: ["01:00 PM", "05:30 PM", "09:00 PM"],
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    bookedSeats: ["C2", "C3"]
  },
  {
    title: "Avatar: The Way of Water",
    genre: "Action / Adventure / Sci-Fi",
    duration: "3h 12m",
    rating: "7.6/10",
    ticketPrice: 280,
    showtimes: ["10:30 AM", "02:30 PM", "06:45 PM"],
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    bookedSeats: ["D1"]
  },
  {
    title: "Oppenheimer",
    genre: "Biography / Drama / History",
    duration: "3h 00m",
    rating: "8.9/10",
    ticketPrice: 300,
    showtimes: ["12:00 PM", "04:30 PM", "08:15 PM"],
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    bookedSeats: []
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    genre: "Animation / Action / Adventure",
    duration: "2h 20m",
    rating: "8.7/10",
    ticketPrice: 240,
    showtimes: ["11:00 AM", "03:00 PM", "06:15 PM", "09:30 PM"],
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
    bookedSeats: []
  }
];

// Fallback in-memory state
let memMovies = INITIAL_MOVIES.map((m, idx) => ({ ...m, _id: `mem_movie_${idx + 1}` }));
let memUsers = [];
let memBookings = [];

// Mongoose Models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const MovieSchema = new mongoose.Schema({
  title: String,
  genre: String,
  duration: String,
  rating: String,
  poster: String,
  ticketPrice: Number,
  showtimes: { type: [String], default: ["10:00 AM", "01:30 PM", "05:00 PM", "08:30 PM"] },
  bookedSeats: { type: [String], default: [] }
});

const BookingSchema = new mongoose.Schema({
  userEmail: String,
  movieTitle: String,
  showtime: String,
  seats: [String],
  totalAmount: Number,
  bookedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Movie = mongoose.model('Movie', MovieSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Connect to MongoDB with timeout
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB database');
    seedMovies();
  })
  .catch(err => {
    isMongoConnected = false;
    console.log('ℹ️ Local/Remote MongoDB not reachable (', err.message, '). Running in active in-memory mode for smooth demo.');
  });

async function seedMovies() {
  try {
    const count = await Movie.countDocuments();
    if (count === 0) {
      await Movie.insertMany(INITIAL_MOVIES);
      console.log('Sample movies seeded into MongoDB!');
    }
  } catch (e) {
    console.log('Movie seeding skipped:', e.message);
  }
}

// Routes
// 1. Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (isMongoConnected) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'User already exists' });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } else {
      const existing = memUsers.find(u => u.email === email);
      if (existing) return res.status(400).json({ message: 'User already exists' });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { _id: `mem_user_${Date.now()}`, name, email, password: hashedPassword };
      memUsers.push(user);
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (isMongoConnected) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } else {
      const user = memUsers.find(u => u.email === email);
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Movies List
app.get('/api/movies', async (req, res) => {
  try {
    if (isMongoConnected) {
      const movies = await Movie.find();
      return res.json(movies);
    } else {
      return res.json(memMovies);
    }
  } catch (err) {
    res.json(memMovies);
  }
});

// 4. Book Tickets
app.post('/api/book', async (req, res) => {
  try {
    const { movieId, seats, userEmail, showtime } = req.body;
    if (!movieId || !seats || !seats.length || !userEmail) {
      return res.status(400).json({ message: 'Missing booking details' });
    }

    if (isMongoConnected) {
      const movie = await Movie.findById(movieId);
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      const alreadyBooked = seats.some(seat => movie.bookedSeats.includes(seat));
      if (alreadyBooked) return res.status(400).json({ message: 'Seat already taken!' });

      movie.bookedSeats.push(...seats);
      await movie.save();

      const totalAmount = seats.length * movie.ticketPrice;
      const booking = await Booking.create({
        userEmail,
        movieTitle: movie.title,
        showtime: showtime || "06:30 PM",
        seats,
        totalAmount
      });
      return res.json({ message: 'Success', booking });
    } else {
      const movie = memMovies.find(m => m._id === movieId);
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      const alreadyBooked = seats.some(seat => movie.bookedSeats.includes(seat));
      if (alreadyBooked) return res.status(400).json({ message: 'Seat already taken!' });

      movie.bookedSeats.push(...seats);
      const totalAmount = seats.length * movie.ticketPrice;
      const booking = {
        _id: `booking_${Date.now()}`,
        userEmail,
        movieTitle: movie.title,
        showtime: showtime || "06:30 PM",
        seats,
        totalAmount,
        bookedAt: new Date()
      };
      memBookings.unshift(booking);
      return res.json({ message: 'Success', booking });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Booking History for a user
app.get('/api/bookings/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (isMongoConnected) {
      const bookings = await Booking.find({ userEmail: email }).sort({ bookedAt: -1 });
      return res.json(bookings);
    } else {
      const bookings = memBookings.filter(b => b.userEmail === email);
      return res.json(bookings);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'IMovies API',
    database: isMongoConnected ? 'MongoDB (Connected)' : 'In-Memory Fallback (Active)',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend server running on http://localhost:${PORT}`));
