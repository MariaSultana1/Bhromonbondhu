# Bhromonbondhu Backend Server

A Node.js backend server with MongoDB Atlas integration for the Bhromonbondhu application.

## Features

- Express.js server
- MongoDB Atlas (cloud) database integration with Mongoose
- User authentication (Register/Login)
- JWT token-based authentication
- Password hashing with bcryptjs
- CORS support
- Environment configuration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (free at mongodb.com/cloud/atlas)

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bhromonbondhu?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Health Check
- `GET /api/health` - Check if server is running

## Database

The application uses MongoDB Atlas with the following collections:
- **users** - Stores user information

## User Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (traveler, host, admin),
  phone: String,
  avatar: String,
  bio: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

- `MONGODB_URI` - MongoDB Atlas connection string
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Folder Structure

```
server/
├── config/
│   └── db.js              # MongoDB Atlas connection
├── models/
│   └── User.js            # User schema and model
├── routes/
│   └── auth.js            # Authentication routes
├── index.js               # Main server file
├── package.json
├── .env                   # Environment variables
└── README.md
```

## Testing with cURL

```bash
# Test health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "traveler"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Security Notes

- Always use a strong JWT_SECRET in production
- Store `.env` in `.gitignore` (never commit to git)
- Passwords are hashed using bcryptjs
- Use HTTPS in production
- Implement rate limiting for production
- Validate all user inputs

## License

ISC
