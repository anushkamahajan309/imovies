import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';
const ALL_SEATS = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6'
];

export default function App() {
  const [movies, setMovies] = useState([]);
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
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Auth modal / state
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
      const res = await fetch(`${API_BASE}/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = authForm.isLogin ? '/auth/login' : '/auth/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('imovies_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('imovies_token', data.token);
        setUser(data.user);
        setShowAuthModal(false);
        showAlert(`Welcome ${data.user.name || data.user.email}!`, 'success');
        setAuthForm({ name: '', email: '', password: '', isLogin: true });
      } else {
        showAlert(data.message || 'Authentication failed', 'danger');
      }
    } catch (err) {
      showAlert('Server connection failed. Please ensure the backend is running.', 'danger');
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
    // Scroll down to seat view
    window.scrollTo({ top: 400, behavior: 'smooth' });
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
      showAlert('Please login to book tickets', 'warning');
      return;
    }
    if (selectedSeats.length === 0) {
      showAlert('Please select at least one seat!', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: selectedMovie._id,
          seats: selectedSeats,
          userEmail: user.email,
          showtime: selectedShowtime
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showAlert(`🎉 Booking Confirmed! Movie: ${selectedMovie.title} | Seats: ${selectedSeats.join(', ')}`, 'success');
        setSelectedSeats([]);
        setSelectedMovie(null);
        fetchMovies();
        setActiveTab('bookings');
      } else {
        showAlert(data.message || 'Booking failed', 'danger');
      }
    } catch (err) {
      showAlert('Booking request failed. Check server connection.', 'danger');
    } finally {
      setLoading(false);
    }
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
          className={`alert alert-${alertInfo.type} position-fixed top-0 end-0 m-4 shadow-lg z-3`}
          role="alert"
          style={{ minWidth: '300px' }}
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
                  showAlert('Please login to view your bookings', 'info');
                } else {
                  setActiveTab('bookings');
                }
              }}
            >
              <i className="bi bi-ticket-detailed-fill me-1"></i> My Bookings
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      {activeTab === 'movies' && !selectedMovie && (
        <div className="bg-dark text-white py-5 px-3 mb-5 border-bottom border-secondary text-center" style={{ background: 'linear-gradient(180deg, #131c31 0%, #0b0f19 100%)' }}>
          <div className="container py-4">
            <span className="badge bg-danger mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase letter-spacing">
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }}>
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
                <form onSubmit={handleAuth}>
                  {!authForm.isLogin && (
                    <div className="mb-3">
                      <label className="form-label text-secondary small">Full Name</label>
                      <input
                        className="form-control bg-secondary bg-opacity-25 text-light border-secondary"
                        placeholder="John Doe"
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
                    {loading ? 'Please wait...' : authForm.isLogin ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="text-center mt-3 pt-3 border-top border-secondary">
                  <button
                    className="btn btn-link text-secondary text-decoration-none small"
                    onClick={() => setAuthForm({ ...authForm, isLogin: !authForm.isLogin })}
                  >
                    {authForm.isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
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
