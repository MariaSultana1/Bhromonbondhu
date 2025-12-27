// const express = require('express');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(express.json());

// let users = [];

// // Register endpoint
// app.post('/api/register', (req, res) => {
//   const user = req.body;
//   users.push(user);
//   res.json({ success: true, message: 'Registration successful' });
// });

// // Login endpoint
// app.post('/api/login', (req, res) => {
//   const { email, password } = req.body;
//   const user = users.find(u => u.email === email && u.password === password);
  
//   if (user) {
//     res.json({ success: true, user });
//   } else {
//     res.status(401).json({ success: false, message: 'Invalid credentials' });
//   }
// });

// app.listen(5000, () => console.log('Server running on port 5000'));