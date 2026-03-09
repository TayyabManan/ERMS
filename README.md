# ERMS - Event & Resource Management System

A full-stack web application for managing organizational resources and bookings. Users can browse available resources (rooms, equipment, vehicles) and submit booking requests, while administrators can manage resources and approve/reject bookings.

**Live Demo:** [https://ermsfrontend.vercel.app](https://ermsfrontend.vercel.app)

## Features

### User Features
- User registration and authentication (JWT-based)
- Browse and search available resources
- Filter resources by category
- Submit booking requests
- View and manage personal bookings
- Edit or cancel pending bookings

### Admin Features
- Dashboard with statistics overview
- User management (view, block/unblock users)
- Role management (assign USER, MODERATOR, SUPER_ADMIN roles)
- Resource management (CRUD operations)
- Booking moderation (approve/reject with notes)

### Security
- JWT access & refresh token authentication
- Role-based access control
- Rate limiting on authentication endpoints
- Password hashing with bcrypt
- Input validation with Zod

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Notifications:** React Hot Toast

## Project Structure

```
erms/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── validators/      # Zod schemas
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript types
│   │   └── main.tsx         # App entry point
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/amanasjad199/ERMS.git
cd ERMS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials and secrets
# See Environment Variables section below

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (creates demo users and resources)
npm run prisma:seed
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/erms

# JWT Configuration (use strong secrets in production!)
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Bcrypt Rounds
BCRYPT_ROUNDS=12
```

## Running the Application

### Development Mode

**Backend** (runs on http://localhost:3000):
```bash
cd backend
npm run dev
```

**Frontend** (runs on http://localhost:5173):
```bash
cd frontend
npm run dev
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Default Users

After seeding the database, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@erms.com | admin123 |
| Moderator | moderator@erms.com | admin123 |
| User | user@erms.com | admin123 |

## API Documentation

Once the backend is running, access the Swagger API documentation at:

```
http://localhost:3000/api-docs
```

### Main API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | User logout |
| GET | /api/users/me | Get current user profile |
| PATCH | /api/users/me | Update profile |
| GET | /api/resources | List all resources |
| GET | /api/resources/:id | Get resource details |
| GET | /api/bookings | Get user's bookings |
| POST | /api/bookings | Create booking request |
| PATCH | /api/bookings/:id | Update booking |
| DELETE | /api/bookings/:id | Cancel booking |
| GET | /api/admin/dashboard | Admin dashboard stats |
| GET | /api/admin/users | List all users |
| PATCH | /api/admin/users/:id/block | Block/unblock user |
| PATCH | /api/admin/users/:id/role | Update user role |
| GET | /api/admin/bookings | List all bookings |
| PATCH | /api/admin/bookings/:id/approve | Approve booking |
| PATCH | /api/admin/bookings/:id/reject | Reject booking |

## Role Permissions

| Action | USER | MODERATOR | SUPER_ADMIN |
|--------|:----:|:---------:|:-----------:|
| Browse resources | ✓ | ✓ | ✓ |
| Create bookings | ✓ | ✓ | ✓ |
| Manage own bookings | ✓ | ✓ | ✓ |
| View all users | | ✓ | ✓ |
| Block/unblock users | | ✓ | ✓ |
| Manage resources | | ✓ | ✓ |
| Approve/reject bookings | | ✓ | ✓ |
| Assign roles | | | ✓ |
| Manage moderators | | | ✓ |

## Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Deployment

The app is deployed on **Vercel** as two separate projects from the same repo:

- **Frontend** — Static SPA (root directory: `frontend/`)
- **Backend** — Serverless Express API (root directory: `backend/`)
- **Database** — PostgreSQL hosted on [Neon](https://neon.tech)

### Deployment Environment Variables

**Backend (Vercel):**
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRY` | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry (e.g. `7d`) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `BCRYPT_ROUNDS` | Password hashing rounds |
| `NODE_ENV` | `production` |

**Frontend (Vercel):**
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g. `https://ermsbackend.vercel.app/api`) |

## License

MIT
