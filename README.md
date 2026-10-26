# 🎬 IMovies - Movie Ticket Booking Made Simple

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure_Auth-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

---

## 📌 Project Overview & Submission Links

> **Evaluation Links for Mentor Review:**
> - 🌐 **Live Demo Link:** `[Add Your Live Demo Link / Hosted URL or Video Demo URL Here]`
> - 💻 **GitHub Repository:** `[Add Your GitHub Repository Link Here]`

**IMovies** is a seamless online platform that enhances the cinema experience by allowing users to browse movies, select showtimes, and reserve seats with real-time availability tracking. Built with Express.js and MongoDB, it leverages a robust client-server architecture to ensure efficient data management and smooth performance. Key features include secure user authentication, booking management, and an intuitive interface that makes ticket reservations convenient and personalized.

---

## 🚀 Key Features

- **🔐 Secure User Authentication:** User registration and login powered by JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- **🎥 Movie Catalog & Discovery:** Browse latest blockbusters with movie details (posters, genres, duration, IMDb ratings, and pricing). Includes live search and genre filtering.
- **🕒 Showtime Selection:** Flexible showtime picker for morning, matinee, evening, and night shows.
- **💺 Interactive Seat Matrix:** Real-time visual cinema seat map displaying:
  - 🟩 Available seats
  - 🟩 Selected seats
  - 🟥 Reserved / booked seats
- **🧾 Instant Booking Confirmation & History:** Real-time seat reservation with instant price calculation and ticket generation under the **"My Bookings"** dashboard.
- **⚡ Resilient Architecture:** Supports MongoDB connection with an automated graceful fallback mode to ensure uninterrupted demo evaluation even without a local database service.
- **📱 Responsive Modern Cinema UI:** Dark Netflix/BookMyShow-inspired aesthetic crafted with Bootstrap 5 and modern CSS.

---

## 🛠️ Tech Stack & Skills

| Domain | Technology / Library |
| :--- | :--- |
| **Frontend** | React.js 18, Vite, Bootstrap 5, Bootstrap Icons, HTML5, Modern CSS3 |
| **Backend** | Node.js, Express.js, REST API Architecture |
| **Database** | MongoDB & Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt password encryption |
| **Networking** | Asynchronous JavaScript (Fetch API, Promises, Async/Await), CORS |

---

## 📊 Project Epics & Stories Breakdown

The project implementation covers all **6 Epics** and **19 Tasks** required for the evaluation:

1. **Epic 1: Project Setup & Environment Configuration**
   - Initialize client with Vite and React.
   - Configure Node.js/Express server and REST routing.
   - Establish MongoDB connection with fallback handling.
2. **Epic 2: Secure User Authentication**
   - User Registration API (`/api/auth/register`).
   - User Login API (`/api/auth/login`) with JWT token generation.
   - Persistent client-side session management (`localStorage`).
3. **Epic 3: Movie Catalog & Exploration**
   - Seed database with movie records and showtimes.
   - Build responsive movie cards and poster showcase.
   - Real-time search by title and filter by genre.
4. **Epic 4: Seat Reservation Engine**
   - Seat selection UI with screen alignment indicator.
   - Validation against double-booking (`bookedSeats` conflict check).
   - Dynamic price calculation based on seat count.
5. **Epic 5: Booking Management & Digital Ticket Pass**
   - Ticket reservation endpoint (`/api/book`).
   - User booking history retrieval (`/api/bookings/:email`).
   - Digital cinema pass generation.
6. **Epic 6: Quality Assurance & Evaluation Readiness**
   - Build validation and production packaging.
   - Deployment configuration & README documentation.

---

## 📡 RESTful API Documentation

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Log in user and receive JWT | `{ email, password }` |
| `GET` | `/api/movies` | Fetch all movies with availability | *None* |
| `POST` | `/api/book` | Reserve seats for a movie showtime | `{ movieId, seats, userEmail, showtime }` |
| `GET` | `/api/bookings/:email` | Get past bookings of user | Parameter: `email` |
| `GET` | `/api/health` | Health & database status check | *None* |

---

## 💻 System Prerequisites

### Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** v16.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v8.0.0 or higher
- **MongoDB:** Local MongoDB Community Server or MongoDB Atlas Cloud URI ([Download MongoDB](https://www.mongodb.com/try/download/community))
- **Browser:** Google Chrome / Firefox / Edge (Latest)

### Hardware Requirements
- **Processor:** Intel Core i5 (8th Gen+) / AMD Ryzen 5 or better
- **RAM:** 8 GB minimum (16 GB recommended)
- **Storage:** At least 1 GB free space

---

## ⚙️ Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/imovies.git
cd imovies
```

### 2. Configure Backend Server
```bash
cd server
npm install
```
*(Optional)* Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secret_key_123
```
Start the backend server:
```bash
npm start
```
> The server will start on: `http://localhost:5000`

### 3. Configure Frontend Client
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
> The frontend client will run on: `http://localhost:5173`

---

## 🌐 Deployment Instructions

### Deploy Frontend (Vercel)
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your `imovies` repository.
4. Set **Root Directory** to `client`.
5. Click **Deploy**.

### Deploy Backend (Render / Railway)
1. Sign in to [Render](https://render.com/).
2. Create a **New Web Service** and connect your GitHub repository.
3. Set **Root Directory** to `server`.
4. Build command: `npm install` | Start command: `node server.js`.
5. Add Environment Variable `MONGO_URI` (from free MongoDB Atlas) and `JWT_SECRET`.
6. Click **Deploy Web Service**.

---

## 👨‍💻 Author
- **Developer:** Anushka Mahajan
- **Contact:** anushkamahajan309@gmail.com
- **Project:** IMovies - Movie Ticket Booking Made Simple
