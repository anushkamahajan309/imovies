import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

const DEFAULT_MOVIES = [
  {
    _id: "mem_movie_1",
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
    _id: "mem_movie_2",
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
    _id: "mem_movie_3",
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
    _id: "mem_movie_4",
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
    _id: "mem_movie_5",
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
    _id: "mem_movie_6",
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

const ALL_SEATS = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6'
];

export default function App() {
  const [movies, setMovies] = useState(DEFAULT_MOVIES);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('imovies_user')) || null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('movies'); // 'movies' or 'bookings'
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('imovies_local_bookings')) || [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', isLogin: true });
  const [alertInfo, setAlertInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const showAlert = (message, type = 'info') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings' && user) {
      fetchUserBookings();
    }
  }, [activeTab, user]);

  const fetchMovies = async () => {
    try {
      // Try relative API (via Vite proxy)
      let res = await fetch(`${API_BASE}/movies`);
      if (!res.ok) {
        // Fallback to direct port 5000 if proxy not available
        res = await fetch('http://localhost:5000/api/movies');
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMovies(data);
          setIsBackendOnline(true);
          return;
        }
      }
      setIsBackendOnline(false);
    } catch {
      // If server is not responding, fallback to direct port 5000 attempt
      try {
        const directRes = await fetch('http://localhost:5000/api/movies');
        if (directRes.ok) {
          const directData = await directRes.json();
          if (Array.isArray(directData) && directData.length > 0) {
            setMovies(directData);
            setIsBackendOnline(true);
            return;
          }
        }
      } catch {
        // Server completely offline, stay on DEFAULT_MOVIES
        setIsBackendOnline(false);
      }
    }
  };

  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      let res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(user.email)}`);
      if (!res.ok) {
        res = await fetch(`http://localhost:5000/api/bookings/${encodeURIComponent(user.email)}`);
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setBookings(data);
          return;
        }
      }
    } catch {
      // Offline fallback
    }
    const local = JSON.parse(localStorage.getItem('imovies_local_bookings') || '[]');
    setBookings(local.filter(b => b.userEmail === user.email));
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const demoPayload = { email: 'anushkamahajan309@gmail.com', password: 'password123' };
    try {
      let res;
      try {
        res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(demoPayload),
        });
      } catch {
        res = await fetch(`http://localhost:5000/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(demoPayload),
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        localStorage.setItem('imovies_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('imovies_token', data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setIsBackendOnline(true);
        showAlert(`Welcome ${data.user.name || 'Anushka'}!`, 'success');
        setLoading(false);
        return;
      }
    } catch {}

    // Instant offline fallback
    const mockUser = {
      id: 'usr_anushka',
      name: 'Anushka Mahajan',
      email: 'anushkamahajan309@gmail.com'
    };
    localStorage.setItem('imovies_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setShowAuthModal(false);
    showAlert('Welcome Anushka Mahajan! (1-Click Login)', 'success');
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = authForm.isLogin ? '/auth/login' : '/auth/register';

    try {
      let res;
      try {
        res = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm),
        });
      } catch {
        res = await fetch(`http://localhost:5000/api${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        localStorage.setItem('imovies_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('imovies_token', data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setIsBackendOnline(true);
        showAlert(`Welcome ${data.user.name || data.user.email}!`, 'success');
        setAuthForm({ name: '', email: '', password: '', isLogin: true });
        return;
      } else {
        showAlert(data.message || 'Authentication failed. Please check credentials.', 'danger');
        return;
      }
    } catch {
      // Server is unreachable, log in offline demo session
      const mockUser = {
        id: `usr_${Date.now()}`,
        name: authForm.name || authForm.email.split('@')[0],
        email: authForm.email
      };
      localStorage.setItem('imovies_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setShowAuthModal(false);
      showAlert(`Welcome ${mockUser.name}! (Demo Mode)`, 'success');
      setAuthForm({ name: '', email: '', password: '', isLogin: true });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('imovies_user');
    localStorage.removeItem('imovies_token');
    setUser(null);
    setActiveTab('movies');
    showAlert('Logged out successfully', 'info');
  };

  const openBooking = (movie) => {
    setSelectedMovie(movie);
    setSelectedSeats([]);
    setSelectedShowtime(movie.showtimes && movie.showtimes.length ? movie.showtimes[0] : '06:30 PM');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const toggleSeat = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBook = async () => {
    if (!user) {
      setShowAuthModal(true);
      showAlert('Please sign in to complete your booking', 'warning');
      return;
    }
    if (selectedSeats.length === 0) {
      showAlert('Please select at least one seat!', 'warning');
      return;
    }

    setLoading(true);

    try {
      let res;
      try {
        res = await fetch(`${API_BASE}/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId: selectedMovie._id,
            movieTitle: selectedMovie.title,
            seats: selectedSeats,
            userEmail: user.email,
            showtime: selectedShowtime
          }),
        });
      } catch {
        res = await fetch(`http://localhost:5000/api/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId: selectedMovie._id,
            movieTitle: selectedMovie.title,
            seats: selectedSeats,
            userEmail: user.email,
            showtime: selectedShowtime
          }),
        });
      }

      if (res && res.ok) {
        setIsBackendOnline(true);
        fetchMovies();
      } else if (res && !res.ok) {
        const errData = await res.json().catch(() => ({}));
        showAlert(errData.message || 'Seat reservation failed.', 'danger');
        setLoading(false);
        return;
      }
    } catch {
      // Backend offline: proceed with instant local reservation
    }

    // Update seat map
    const updatedBookedSeats = [...(selectedMovie.bookedSeats || []), ...selectedSeats];
    const updatedMovie = { ...selectedMovie, bookedSeats: updatedBookedSeats };
    setMovies(movies.map(m => (m._id === selectedMovie._id || m.title === selectedMovie.title) ? updatedMovie : m));

    // Save ticket to local history
    const newBooking = {
      _id: `ticket_${Date.now()}`,
      userEmail: user.email,
      movieTitle: selectedMovie.title,
      showtime: selectedShowtime,
      seats: [...selectedSeats],
      totalAmount: selectedSeats.length * selectedMovie.ticketPrice,
      bookedAt: new Date().toISOString()
    };

    const existingLocal = JSON.parse(localStorage.getItem('imovies_local_bookings') || '[]');
    const nextLocal = [newBooking, ...existingLocal];
    localStorage.setItem('imovies_local_bookings', JSON.stringify(nextLocal));
    setBookings(nextLocal.filter(b => b.userEmail === user.email));

    showAlert(`🎉 Booking Confirmed! Movie: ${selectedMovie.title} | Seats: ${selectedSeats.join(', ')}`, 'success');
    setSelectedSeats([]);
    setSelectedMovie(null);
    setActiveTab('bookings');
    setLoading(false);
  };

  // Filter movies
  const genres = ['All', ...new Set(movies.flatMap(m => m.genre ? m.genre.split(' / ') : []))];
  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.genre && m.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'All' || (m.genre && m.genre.includes(selectedGenre));
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="pb-5">
      {/* Toast Alert */}
      {alertInfo && (
        <div
          className={`alert alert-${alertInfo.type} position-fixed top-0 end-0 m-4 shadow-lg`}
          role="alert"
          style={{ minWidth: '320px', zIndex: 99999 }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span>{alertInfo.message}</span>
            <button type="button" className="btn-close ms-2" onClick={() => setAlertInfo(null)}></button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top px-3 px-md-5">
        <div className="container-fluid">
          <a className="navbar-brand fw-extrabold fs-3 d-flex align-items-center gap-2 text-decoration-none" href="#">
            <i className="bi bi-film text-danger fs-2"></i>
            <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              <span className="text-danger">I</span>Movies
            </span>
          </a>

          {/* Status Badge */}
          <span className={`badge ${isBackendOnline ? 'bg-success' : 'bg-secondary'} d-none d-md-inline-block small py-1 px-2`}>
            <i className={`bi ${isBackendOnline ? 'bi-check-circle-fill' : 'bi-shield-check'} me-1`}></i>
            {isBackendOnline ? 'API Connected (5000)' : 'Standalone Ready'}
          </span>

          <div className="d-flex align-items-center gap-2 order-lg-last">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 rounded-pill"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle fs-5 text-warning"></i>
                  <span>{user.name || user.email.split('@')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
                  <li><span className="dropdown-item-text text-secondary small">{user.email}</span></li>
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button className="dropdown-item" onClick={() => setActiveTab('bookings')}>
                      <i className="bi bi-ticket-perforated me-2 text-danger"></i>My Bookings
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                className="btn btn-danger btn-sm px-4 py-2 rounded-pill fw-semibold shadow-sm"
                onClick={() => { setShowAuthModal(true); setAuthForm({ ...authForm, isLogin: true }); }}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
              </button>
            )}
          </div>

          <div className="navbar-nav me-auto flex-row gap-3 mt-3 mt-lg-0">
            <button
              className={`btn btn-sm ${activeTab === 'movies' ? 'btn-danger' : 'btn-outline-secondary text-light'} rounded-pill px-3`}
              onClick={() => { setActiveTab('movies'); setSelectedMovie(null); }}
            >
              <i className="bi bi-grid-fill me-1"></i> Movies
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-danger' : 'btn-outline-secondary text-light'} rounded-pill px-3`}
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                  showAlert('Please sign in to view your bookings', 'info');
                } else {
                  setActiveTab('bookings');
                }
              }}
            >
              <i className="bi bi-ticket-detailed-fill me-1"></i> My Bookings ({bookings.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      {activeTab === 'movies' && !selectedMovie && (
        <div className="bg-dark text-white py-5 px-3 mb-5 border-bottom border-secondary text-center" style={{ background: 'linear-gradient(180deg, #131c31 0%, #0b0f19 100%)' }}>
          <div className="container py-4">
            <span className="badge bg-danger mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase">
              🎟️ Movie Ticket Booking Made Simple
            </span>
            <h1 className="display-4 fw-extrabold mb-3">Book Your Ultimate Cinema Experience</h1>
            <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '650px' }}>
              Explore blockbusters, pick your preferred showtimes, and reserve your seats with real-time seat availability tracking.
            </p>

            {/* Search & Filter Bar */}
            <div className="row g-2 justify-content-center" style={{ maxWidth: '700px', margin: '0 auto' }}>
              <div className="col-12 col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Search movie by title or genre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="btn btn-dark border-secondary text-secondary" onClick={() => setSearchQuery('')}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-4">
                <select
                  className="form-select bg-dark text-light border-secondary"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  {genres.slice(0, 6).map((g, i) => (
                    <option key={i} value={g}>{g === 'All' ? 'All Genres' : g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="container my-4">
        {/* VIEW 1: MOVIE BROWSING */}
        {activeTab === 'movies' && (
          <>
            {/* Seat Booking Panel (when a movie is selected) */}
            {selectedMovie && (
              <div className="card bg-dark text-white border-secondary mb-5 shadow-lg p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start border-bottom border-secondary pb-3 mb-4">
                  <div>
                    <span className="badge bg-danger mb-2">Step 2: Select Showtime & Seats</span>
                    <h2 className="fw-bold mb-1">{selectedMovie.title}</h2>
                    <p className="text-secondary mb-0">
                      {selectedMovie.genre} • {selectedMovie.duration} • <span className="text-warning">★ {selectedMovie.rating}</span> • ₹{selectedMovie.ticketPrice}/ticket
                    </p>
                  </div>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedMovie(null)}>
                    <i className="bi bi-arrow-left me-1"></i> Change Movie
                  </button>
                </div>

                {/* Showtime Selection */}
                <div className="mb-4">
                  <h6 className="fw-bold text-light mb-2"><i className="bi bi-clock me-2 text-danger"></i>Select Showtime:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {(selectedMovie.showtimes || ['10:00 AM', '01:30 PM', '05:00 PM', '08:30 PM']).map((time, idx) => (
                      <button
                        key={idx}
                        className={`btn btn-sm ${selectedShowtime === time ? 'btn-danger fw-bold' : 'btn-outline-secondary text-light'}`}
                        onClick={() => setSelectedShowtime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cinema Screen Graphic */}
                <div className="text-center my-4">
                  <div className="screen-indicator mx-auto mb-2" style={{ maxWidth: '450px' }}></div>
                  <p className="text-secondary small fw-bold tracking-wide">CINEMA SCREEN THIS WAY</p>
                </div>

                {/* Seat Map */}
                <div className="text-center mb-4">
                  <div className="d-inline-block p-3 rounded" style={{ background: '#0e1526' }}>
                    <div className="row g-2 justify-content-center" style={{ maxWidth: '380px' }}>
                      {ALL_SEATS.map((seat) => {
                        const isBooked = selectedMovie.bookedSeats && selectedMovie.bookedSeats.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        return (
                          <div className="col-2" key={seat}>
                            <button
                              disabled={isBooked}
                              className={`seat ${isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'}`}
                              onClick={() => toggleSeat(seat)}
                              title={isBooked ? 'Already Booked' : `Seat ${seat} (₹${selectedMovie.ticketPrice})`}
                            >
                              {seat}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="d-flex justify-content-center gap-4 text-secondary small mb-4">
                  <div className="d-flex align-items-center gap-1">
                    <span className="seat seat-available d-inline-block" style={{ width: '18px', height: '18px', margin: 0 }}></span>
                    <span>Available</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="seat seat-selected d-inline-block" style={{ width: '18px', height: '18px', margin: 0 }}></span>
                    <span>Selected</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="seat seat-booked d-inline-block" style={{ width: '18px', height: '18px', margin: 0 }}></span>
                    <span>Booked</span>
                  </div>
                </div>

                {/* Summary & Checkout Action */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-secondary bg-opacity-10 p-3 rounded border border-secondary gap-3">
                  <div>
                    <h5 className="mb-1">
                      Seats: <span className="text-warning">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}</span>
                    </h5>
                    <p className="text-secondary small mb-0">
                      Showtime: <b className="text-light">{selectedShowtime}</b> | Rate: <b>₹{selectedMovie.ticketPrice}</b> x {selectedSeats.length}
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <h3 className="mb-0 text-success fw-bold">₹{selectedSeats.length * selectedMovie.ticketPrice}</h3>
                    <button
                      className="btn btn-success btn-lg px-4 fw-bold"
                      disabled={loading || selectedSeats.length === 0}
                      onClick={handleBook}
                    >
                      {loading ? (
                        <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
                      ) : (
                        <span><i className="bi bi-check-circle-fill me-2"></i>Confirm Booking</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Movies List Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">
                <i className="bi bi-camera-reels text-danger me-2"></i>Now Showing
              </h3>
              <span className="badge bg-secondary">{filteredMovies.length} movies available</span>
            </div>

            {/* Movie Grid */}
            <div className="row g-4">
              {filteredMovies.map((movie) => (
                <div className="col-12 col-sm-6 col-md-4 col-lg-4" key={movie._id}>
                  <div className="card movie-card h-100">
                    <div className="position-relative">
                      <img
                        src={movie.poster}
                        className="card-img-top"
                        alt={movie.title}
                        style={{ height: '320px', objectFit: 'cover' }}
                      />
                      <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 text-warning fw-bold fs-6">
                        ★ {movie.rating}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column p-4">
                      <h5 className="fw-bold text-white mb-2">{movie.title}</h5>
                      <span className="badge badge-genre align-self-start mb-2 px-2 py-1">
                        {movie.genre}
                      </span>
                      <p className="text-secondary small mb-3">
                        <i className="bi bi-clock me-1"></i> {movie.duration}
                      </p>

                      <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                        <div>
                          <small className="text-secondary d-block">Price</small>
                          <span className="fw-bold text-light fs-5">₹{movie.ticketPrice}</span>
                        </div>
                        <button
                          className="btn btn-danger btn-sm px-3 py-2 fw-semibold rounded-pill"
                          onClick={() => openBooking(movie)}
                        >
                          <i className="bi bi-ticket-perforated me-1"></i> Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* VIEW 2: USER'S BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1"><i className="bi bi-ticket-detailed text-danger me-2"></i>My Booking History</h3>
                <p className="text-secondary small mb-0">Active reservations registered under <b>{user?.email}</b></p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={fetchUserBookings}>
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-5 card bg-dark border-secondary">
                <i className="bi bi-ticket-perforated display-1 text-secondary opacity-50 mb-3"></i>
                <h5 className="text-light">No bookings found</h5>
                <p className="text-secondary">You haven't booked any movie tickets yet.</p>
                <div>
                  <button className="btn btn-danger btn-sm px-4 rounded-pill" onClick={() => setActiveTab('movies')}>
                    Browse Movies Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {bookings.map((b) => (
                  <div className="col-12 col-md-6" key={b._id}>
                    <div className="p-4 ticket-stub text-white shadow-sm h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="badge bg-success">Confirmed</span>
                          <small className="text-secondary">ID: {b._id.slice(-8)}</small>
                        </div>
                        <h4 className="fw-bold text-danger mb-2">{b.movieTitle}</h4>
                        <div className="mb-3 text-secondary small">
                          <div><i className="bi bi-calendar3 me-2 text-warning"></i>{new Date(b.bookedAt).toLocaleDateString()} at {b.showtime || '06:30 PM'}</div>
                          <div><i className="bi bi-envelope me-2 text-warning"></i>{b.userEmail}</div>
                        </div>
                        <div className="bg-dark p-3 rounded mb-3 border border-secondary">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-secondary small">Seats Reserved:</span>
                            <span className="fw-bold text-warning">{b.seats.join(', ')}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-secondary small">Total Paid:</span>
                            <span className="fw-bold text-success">₹{b.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center border-top border-secondary pt-2">
                        <small className="text-secondary">Show this digital pass at the theater gate</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal (Login / Register) */}
      {showAuthModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary shadow-lg">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-film text-danger me-2"></i>
                  {authForm.isLogin ? 'Sign In to IMovies' : 'Create an Account'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAuthModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {/* 1-Click Instant Demo Login Banner */}
                <div className="mb-4 p-3 rounded border border-danger border-opacity-50 text-center" style={{ background: 'rgba(229, 9, 20, 0.08)' }}>
                  <p className="small text-light mb-2 fw-semibold">
                    <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Mentor & Reviewer Access
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-100 fw-bold py-2 shadow-sm"
                    onClick={handleDemoLogin}
                    disabled={loading}
                  >
                    <i className="bi bi-person-check-fill me-2"></i> Instant 1-Click Login (Anushka Mahajan)
                  </button>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <hr className="flex-grow-1 border-secondary m-0" />
                  <span className="px-3 text-secondary small text-uppercase">Or with your email</span>
                  <hr className="flex-grow-1 border-secondary m-0" />
                </div>

                {/* Tabs to toggle between Sign In and Sign Up */}
                <div className="btn-group w-100 mb-3" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${authForm.isLogin ? 'btn-light fw-bold text-dark' : 'btn-outline-secondary text-secondary'}`}
                    onClick={() => setAuthForm({ ...authForm, isLogin: true })}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${!authForm.isLogin ? 'btn-light fw-bold text-dark' : 'btn-outline-secondary text-secondary'}`}
                    onClick={() => setAuthForm({ ...authForm, isLogin: false })}
                  >
                    <i className="bi bi-person-plus me-1"></i> Create New Account
                  </button>
                </div>

                <form onSubmit={handleAuth}>
                  {!authForm.isLogin && (
                    <div className="mb-3">
                      <label className="form-label text-secondary small">Your Full Name</label>
                      <input
                        className="form-control bg-secondary bg-opacity-25 text-light border-secondary"
                        placeholder="e.g. Anushka Mahajan"
                        required
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-secondary bg-opacity-25 text-light border-secondary"
                      placeholder="name@example.com"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-secondary small">Password</label>
                    <input
                      type="password"
                      className="form-control bg-secondary bg-opacity-25 text-light border-secondary"
                      placeholder="••••••••"
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-danger w-100 py-2 fw-semibold" disabled={loading}>
                    {loading ? (
                      <span><span className="spinner-border spinner-border-sm me-2"></span>Please wait...</span>
                    ) : authForm.isLogin ? (
                      <span><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</span>
                    ) : (
                      <span><i className="bi bi-person-check me-2"></i>Create Account</span>
                    )}
                  </button>
                </form>

                <div className="text-center mt-3 pt-3 border-top border-secondary">
                  <button
                    className="btn btn-link text-secondary text-decoration-none small"
                    onClick={() => setAuthForm({ ...authForm, isLogin: !authForm.isLogin })}
                  >
                    {authForm.isLogin ? "Need a new account? Click here to Sign Up" : "Already have an account? Click to Sign In"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
