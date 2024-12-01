const mysql = require('mysql');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email providers
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable for security
    pass: process.env.EMAIL_PASS  // Use environment variable for security
  }
});

// Secret key from environment variables
const secretKey = process.env.JWT_SECRET_KEY;

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'roadbuddy'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Middleware for parsing body
app.use(express.json());

// Function to generate auth string for Midtrans API
const generateAuthString = (serverKey) => {
  return Buffer.from(`${serverKey}:`).toString('base64');
};

// Midtrans Server Key and Auth String
const serverKey = "SB-Mid-server-uIxjXRfm9iSzA5kKYCUWVICX"; // Replace with your actual server key
const authString = generateAuthString(serverKey);

// Helper function to generate unique order ID
function generateOrderId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000);
  return `${timestamp}-${randomNum}`;
}

// Function to verify JWT token
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded; // Return decoded payload which contains user ID and role
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

// Function to update user balance in database
const updateUserBalance = (userId, amount) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE user SET balance = balance + ? WHERE id_user = ?', [amount, userId], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

// Endpoint to create transaction with Midtrans
app.post('/api/create-transaction', async (req, res) => {
  const { gross_amount, customer_details } = req.body;

  try {
    const response = await axios.post(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      {
        transaction_details: {
          order_id: generateOrderId(),
          gross_amount
        },
        credit_card: {
          secure: true
        },
        customer_details
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        }
      }
    );

    res.status(200).json(response.data);
    console.log('Midtrans Response:', response.data);
    console.log('Generate Order Id :', generateOrderId())
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create transaction',
      error: error.response?.data || error.message
    });
  }
});

app.post('/api/update-balance', async (req, res) => {
  const { order_id } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is missing' });
  }

  if (!order_id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // Verify the token and get user data
    const user = await verifyToken(token); // Assuming verifyToken() throws on failure

    if (!user || !user.id) {
      return res.status(403).json({ error: 'Invalid token or user not found' });
    }

    console.log(`User ID: ${user.id}`);

    // Verify transaction status with Midtrans
    const response = await axios.get(`https://api.sandbox.midtrans.com/v2/${order_id}/status`, {
      headers: {
        Authorization: `Basic ${authString}`,
      },
    });

    const data = response.data;

    console.log(`Midtrans Response: ${JSON.stringify(data)}`);

    // Check if the transaction status is 'capture' or 'settlement'
    if (data.transaction_status === 'capture' || data.transaction_status === 'settlement') {
      const topUpAmount = parseFloat(data.gross_amount); // Convert gross_amount to number

      // Update the user's balance in the database
      await updateUserBalance(user.id, topUpAmount); // Assuming updateUserBalance() is implemented

      res.json({ message: 'Balance successfully updated' });
    } else {
      res.status(400).json({ error: 'Invalid transaction status' });
    }
  } catch (error) {
    console.error('Error in update-balance API:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to register user
app.post('/register', (req, res) => {
  const { full_name, username, email_user, phone_user, password_user, role_user, balance } = req.body;

  if (!full_name || !username || !email_user || !password_user) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userRole = role_user || 'user'; // Default role 'user'

  bcrypt.hash(password_user, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    const query = 'INSERT INTO user (full_name, username, email_user, phone_user, password_user, role_user, balance, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [full_name, username, email_user, phone_user, hashedPassword, userRole, balance || 0.00, false], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to register user', details: err });

      // Generate email verification token
      const emailVerificationToken = jwt.sign({ id: result.insertId, email: email_user }, secretKey, { expiresIn: '24h' });

      // Generate verification link
      const verificationLink = `http://localhost:3000/verify-email?token=${emailVerificationToken}`;

      // Send email verification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email_user,
        subject: 'Email Verification',
        text: `Click the following link to verify your email: ${verificationLink}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to send verification email', details: error });
        }

        res.status(200).json({
          message: 'User registered successfully. A verification email has been sent to your email address.',
          userId: result.insertId
        });
      });
    });
  });
});

app.get('/verify-email', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is missing' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    // Update the user's email_verified field in the database
    db.query('UPDATE user SET email_verified = true WHERE id_user = ?', [decoded.id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to verify email', details: err });

      res.status(200).json({ message: 'Email successfully verified' });
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired verification token' });
  }
});

// Endpoint for login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan Password diperlukan' });
  }

  db.query('SELECT * FROM user WHERE email_user = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });

    if (result.length === 0) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const user = result[0];

    bcrypt.compare(password, user.password_user, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });

      if (!isMatch) return res.status(400).json({ error: 'Password salah' });

      const token = jwt.sign({ id: user.id_user, role: user.role_user }, secretKey, { expiresIn: '1h' });

      res.status(200).json({
        message: 'Login berhasil',
        token,
        name: user.username,
        phone: user.phone_user,
        email: user.email_user,
        balance: user.balance,
        fullname: user.full_name
      });
    });
  });
});

// Endpoint to get user balance (protected route)
app.get('/user/balance', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) return res.status(403).json({ error: 'Token tidak ditemukan' });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token tidak valid' });

    const userId = decoded.id; 

    db.query('SELECT balance FROM user WHERE id_user = ?', [userId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });

      if (result.length === 0) return res.status(400).json({ error: 'Pengguna tidak ditemukan' });

      return res.status(200).json({ balance: result[0].balance });
    });
  });
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const express = require('express');
// const app = express();
// require('dotenv').config();
// const secretKey = process.env.JWT_SECRET_KEY;
// const jwt = require('jsonwebtoken');
// const axios = require('axios')

// const generateAuthString = (serverKey) => {
//   const authString = Buffer.from(`${serverKey}:`).toString('base64');
//   return authString;
// };

// // Example usage:
// const serverKey = "SB-Mid-server-uIxjXRfm9iSzA5kKYCUWVICX"; // Replace with your actual server key
// const authString = generateAuthString(serverKey);


// // Middleware untuk parsing body
// app.use(express.json());

// // Membuat koneksi ke MySQL
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'roadbuddy'
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed:', err.stack);
//     return;
//   }
//   console.log('Connected to the database');
// });


// function generateOrderId() {
//   const timestamp = Date.now(); // Current timestamp in milliseconds
//   const randomNum = Math.floor(Math.random() * 1000); // Generate a random 3-digit number
//   return `${timestamp}-${randomNum}`; // Combine timestamp and random number for uniqueness
// }

// app.post('/api/create-transaction', async (req, res) => {
//   const { gross_amount, customer_details } = req.body;

//   console.log("hai")
//   try {
//     const response = await axios.post(
//       'https://app.sandbox.midtrans.com/snap/v1/transactions',
//       {
//         transaction_details: {
//           order_id: generateOrderId(),
//           gross_amount
//         },
//         credit_card: {
//           secure: true
//         },
//         customer_details
//       },
//       {
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//           'Authorization': 'Basic ' + authString
//         }
//       }
//     );
  
//     console.log('Midtrans Response:', response.data);
//     console.log('Generate Order Id :', generateOrderId())
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error('Error creating transaction:', error.response?.data || error.message);
//     res.status(500).json({
//       message: 'Failed to create transaction',
//       error: error.response?.data || error.message
//     });
//   }
  
// });

// app.post('/api/update-balance', async (req, res) => {
//   const { order_id } = req.body;
//   const token = req.headers['authorization'].split(' ')[1]; // Ambil token dari header

//   // Verifikasi token dan ambil data pengguna (misalnya, userId)
//   const user = await verifyToken(token);
//   if (!user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     // Verifikasi status transaksi di Midtrans
//     const response = await fetch(`https://api.midtrans.com/v2/${order_id}/status`, {
//       method: 'GET',
//       headers: {
//         'Authorization': 'Basic ' + new Buffer.from('YOUR_SERVER_KEY' + ':').toString('base64'),
//       },
//     });
//     const data = await response.json();

//     if (data.transaction_status === 'capture' || data.transaction_status === 'settlement') {
//       // Pembayaran berhasil, update saldo pengguna
//       const topUpAmount = data.gross_amount; // Ambil jumlah pembayaran

//       // Perbarui saldo pengguna di database
//       await updateUserBalance(user.id, topUpAmount);

//       res.json({ message: 'Saldo berhasil diperbarui' });
//     } else {
//       res.status(400).json({ error: 'Transaksi tidak valid' });
//     }
//   } catch (error) {
//     console.error('Error verifying transaction:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // Endpoint untuk register user
// // Endpoint untuk register user
// app.post('/register', (req, res) => {
//   const { full_name, username, email_user, phone_user, password_user, role_user, balance } = req.body;

//   // Validasi input
//   if (!full_name || !username || !email_user || !password_user) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   // Tentukan role default jika tidak ada
//   const userRole = role_user || 'user'; // Default role 'user'

//   // Hash password sebelum disimpan
//   bcrypt.hash(password_user, 10, (err, hashedPassword) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error hashing password' });
//     }

//     // Query untuk insert data ke database
//     const query = 'INSERT INTO user (full_name, username, email_user, phone_user, password_user, role_user, balance) VALUES (?, ?, ?, ?, ?, ?, ?)';
//     db.query(query, [full_name, username, email_user, phone_user, hashedPassword, userRole, balance || 0.00], (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: 'Failed to register user', details: err });
//       }
//       res.status(200).json({ message: 'User registered successfully', userId: result.insertId });
//     });
//   });
// });
  
// app.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email dan Password diperlukan' });
//   }

//   db.query('SELECT * FROM user WHERE email_user = ?', [email], (err, result) => {
//     if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });

//     if (result.length === 0) {
//       return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
//     }

//     const user = result[0];

//     bcrypt.compare(password, user.password_user, (err, isMatch) => {
//       if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });

//       if (!isMatch) {
//         return res.status(400).json({ error: 'Password salah' });
//       }

//       const token = jwt.sign(
//         { id: user.id_user, role: user.role_user },
//         secretKey,
//         { expiresIn: '1h' }
//       );

//       // Sertakan nama pengguna dalam respons
//       res.status(200).json({
//         message: 'Login berhasil',
//         token,
//         name: user.username,
//         phone: user.phone_user,
//         email: user.email_user,
//         balance: user.balance,
//         fullname: user.full_name
//       });
//     });
//   });
// });

// // server.js

// app.get('/user', (req, res) => {
//   const userId = req.query.id; // Ambil ID pengguna dari query string (atau sesuaikan sesuai kebutuhan)

//   if (!userId) {
//     return res.status(400).json({ error: 'User ID is required' });
//   }

//   // Query untuk mendapatkan data pengguna berdasarkan ID
//   db.query('SELECT name FROM user WHERE id = ?', [userId], (err, result) => {
//     if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });

//     if (result.length === 0) {
//       return res.status(400).json({ error: 'Pengguna tidak ditemukan' });
//     }

//     // Kirim nama pengguna sebagai respons
//     return res.status(200).json({ name: result[0].name });
//   });
// });
// // Endpoint untuk mengambil saldo pengguna berdasarkan token
// app.get('/user/balance', (req, res) => {
//   const token = req.headers['authorization']?.split(' ')[1]; // Ambil token dari header

//   if (!token) {
//     return res.status(403).json({ error: 'Token tidak ditemukan' });
//   }

//   // Verifikasi token menggunakan kunci rahasia yang sama
//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ error: 'Token tidak valid' });
//     }

//     const userId = decoded.id; // Ambil userId dari token yang sudah didekode

//     // Query untuk mengambil saldo pengguna berdasarkan userId
//     db.query('SELECT balance FROM user WHERE id_user = ?', [userId], (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: 'Terjadi kesalahan server' });
//       }

//       if (result.length === 0) {
//         return res.status(400).json({ error: 'Pengguna tidak ditemukan' });
//       }

//       return res.status(200).json({ balance: result[0].balance });
//     });
//   });
// });


// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
