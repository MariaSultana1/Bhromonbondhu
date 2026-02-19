# 🧪 Database & API Testing Guide

## ✅ How to Test Your Connection

### **Option 1: Automated Test (Recommended)**

```bash
cd server
npm run test-connection
```

This will:
- ✅ Load environment variables
- ✅ Connect to MongoDB Atlas
- ✅ List existing collections
- ✅ Verify all credentials

---

### **Option 2: Manual Testing with Postman/Insomnia**

Download: https://www.postman.com/downloads/

#### **Register User**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser123",
    "email": "test@example.com",
    "role": "tourist"
  }
}
```

**Response (Error - User Exists):**
```json
{
  "success": false,
  "message": "Username already taken"
}
```

---

#### **Login User**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "role": "tourist"
  }
}
```

---

#### **Get User Profile (Protected)**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser123",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "tourist",
    "verified": false
  }
}
```

---

#### **Book Transport Ticket**
```http
POST http://localhost:5000/api/transport-tickets/book
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "transportType": "bus",
  "provider": "Shyamoli Paribahan",
  "from": "Dhaka",
  "to": "Chattogram",
  "departureTime": "2024-02-15 08:00:00",
  "arrivalTime": "2024-02-15 14:00:00",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "age": 30,
      "gender": "male",
      "nid": "1234567890",
      "seat": "A1"
    }
  ],
  "totalAmount": 1200
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket booked successfully",
  "ticket": {
    "_id": "507f1f77bcf86cd799439011",
    "bookingId": "BK123456",
    "pnr": "PNR123456",
    "transportType": "bus",
    "from": "Dhaka",
    "to": "Chattogram",
    "totalAmount": 1200,
    "status": "confirmed"
  },
  "trip": {
    "_id": "507f1f77bcf86cd799439012",
    "destination": "Chattogram",
    "status": "upcoming",
    "transportTicketId": "507f1f77bcf86cd799439011"
  }
}
```

---

#### **Get My Trips**
```http
GET http://localhost:5000/api/trips/my-trips
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "success": true,
  "trips": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "destination": "Chattogram",
      "date": "2024-02-15",
      "endDate": "2024-02-18",
      "status": "upcoming",
      "transportType": "bus",
      "from": "Dhaka",
      "to": "Chattogram"
    }
  ]
}
```

---

## 🔍 Testing in Browser Console

Open DevTools (F12) and try:

```javascript
// Get stored token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Test API call
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('User:', data))
.catch(err => console.error('Error:', err));

// Login simulation
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data));
```

---

## 📊 Checking MongoDB Directly

1. Go to https://cloud.mongodb.com
2. Click "Cluster0"
3. Click "Collections"
4. You'll see:
   - `users` - Your registered users
   - `transporttickets` - Booked tickets
   - `trips` - Created trips
   - `hosts` - Host profiles
   - etc.

### **Sample User Document in MongoDB:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "testuser123",
  "email": "test@example.com",
  "password": "$2a$10$...", // hashed
  "fullName": "Test User",
  "role": "tourist",
  "verified": false,
  "createdAt": ISODate("2024-02-10T10:30:00.000Z"),
  "lastLogin": ISODate("2024-02-10T10:35:00.000Z")
}
```

### **Sample TransportTicket Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "bookingId": "BK123456",
  "pnr": "PNR123456",
  "transportType": "bus",
  "provider": "Shyamoli Paribahan",
  "from": "Dhaka",
  "to": "Chattogram",
  "departureTime": "2024-02-15T08:00:00.000Z",
  "arrivalTime": "2024-02-15T14:00:00.000Z",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "age": 30,
      "gender": "male",
      "nid": "1234567890",
      "seat": "A1",
      "ticketNumber": "TCK001"
    }
  ],
  "totalAmount": 1200,
  "paymentMethod": "simulation",
  "status": "confirmed",
  "bookingDate": ISODate("2024-02-10T10:35:00.000Z")
}
```

---

## 🎯 Complete User Journey Test

### **Step 1: Register**
```bash
POST /api/auth/register
{
  "username": "alice2024",
  "email": "alice@example.com",
  "password": "secure123",
  "fullName": "Alice Johnson"
}
# Copy the token from response
```

### **Step 2: Login** (Verify you can login)
```bash
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "secure123"
}
```

### **Step 3: Get Profile**
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### **Step 4: Book Ticket**
```bash
POST /api/transport-tickets/book
Authorization: Bearer <token>
{
  "transportType": "bus",
  "provider": "Green Line",
  "from": "Dhaka",
  "to": "Sylhet",
  "departureTime": "2024-02-20 10:00:00",
  "arrivalTime": "2024-02-20 18:00:00",
  "passengers": [
    {
      "firstName": "Alice",
      "lastName": "Johnson",
      "age": 28,
      "gender": "female",
      "nid": "1234567890",
      "seat": "B5"
    }
  ],
  "totalAmount": 800
}
# Copy bookingId from response
```

### **Step 5: View Trip**
```bash
GET /api/trips/my-trips
Authorization: Bearer <token>
# Should show trip to Sylhet with booking details
```

### **Step 6: Check MongoDB**
1. Go to https://cloud.mongodb.com/v2/65c4d2a9b...
2. Click Collections
3. Verify:
   - `users` has your user
   - `transporttickets` has your booking
   - `trips` has your trip

---

## 🐛 Debugging Tips

### **API Returns 401 Unauthorized**
```
Issue: Token not being sent
Fix: Add header: Authorization: Bearer <token>
Verify: localStorage has 'token' key in browser
```

### **API Returns 400 Bad Request**
```
Issue: Missing required fields
Fix: Check request body has all required fields
Debug: Look at backend terminal for error details
```

### **API Returns 500 Internal Server Error**
```
Issue: Server error
Fix: Check backend terminal for error message
Common causes:
  - MongoDB connection failed
  - Database validation error
  - Missing .env variable
```

### **MongoDB Connection Timeout**
```
Issue: Can't reach MongoDB Atlas
Fix:
  1. Check internet connection
  2. Go to MongoDB Atlas → Network Access
  3. Add your IP (or 0.0.0.0/0 for development)
  4. Wait 1-2 minutes for changes to apply
  5. Try again
```

---

## 📈 Performance Testing

### **Load Test - Create 100 Users**
```javascript
// Run in browser console
async function createUsers(count) {
  for (let i = 0; i < count; i++) {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `user${i}`,
        email: `user${i}@test.com`,
        password: 'test123',
        fullName: `Test User ${i}`
      })
    });
    console.log(`Created user ${i + 1}/${count}`);
  }
}

createUsers(100);
```

Then check MongoDB Collections → users to see 100+ documents.

---

## ✅ Testing Checklist

- [ ] `npm run test-connection` passes
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can register user via API
- [ ] Can login via API
- [ ] Token is stored in localStorage
- [ ] Can get user profile with token
- [ ] Can book transport ticket
- [ ] Trip appears in database
- [ ] MongoDB shows new collections
- [ ] Can view trip in frontend
- [ ] Can navigate dashboard
- [ ] No 401 errors (unless token expired)
- [ ] No CORS errors

---

You're all set! Start testing! 🚀
