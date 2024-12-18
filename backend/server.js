const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Konfigurasi database MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Menghubungkan ke database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Konfigurasi JWT dan email
const secretKey = process.env.JWT_SECRET_KEY;

// Membuat transporter menggunakan OAuth2 jika 2FA diaktifkan atau menggunakan app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true // Ini akan memberi Anda log yang lebih rinci
});

// Fungsi generate Auth String Midtrans
const generateAuthString = (serverKey) => {
  return Buffer.from(`${serverKey}:`).toString('base64');
};

const serverKey = process.env.MIDTRANS_SERVER_KEY; // Mengambil dari .env
const authString = generateAuthString(serverKey);

// Fungsi generate Order ID unik
const generateOrderId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  return `${timestamp}-${randomNum}`;
};

// Fungsi verifikasi token JWT
const verifyToken = async (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

// Fungsi update saldo pengguna
const updateUserBalance = (userId, amount) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE user SET balance = balance + ? WHERE id_user = ?', [amount, userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// Fungsi untuk generate kode verifikasi acak
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code
};


// Endpoint untuk registrasi pengguna
// Endpoint untuk registrasi pengguna
app.post('/user/register', (req, res) => {
  const { full_name, username, email_user, phone_user, password_user, role_user, balance } = req.body;

  if (!full_name || !username || !email_user || !password_user) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userRole = role_user || 'user';

  bcrypt.hash(password_user, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    const query = 'INSERT INTO user (full_name, username, email_user, phone_user, password_user, role_user, balance, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [full_name, username, email_user, phone_user, hashedPassword, userRole, balance || 0.00, false], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to register user', details: err });

      // Generate a random verification code
      const verificationCode = generateVerificationCode();

      // Update database with the verification code (you can store it in the user table)
      db.query('UPDATE user SET verification_code = ? WHERE id_user = ?', [verificationCode, result.insertId], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update user with verification code', details: err });

        // Kirim kode verifikasi melalui email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email_user,
          subject: 'Email Verification',
          text: `Your email verification code is: ${verificationCode}`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) return res.status(500).json({ error: 'Failed to send verification email', details: error });

          res.status(200).json({
            message: 'User registered successfully. A verification code has been sent to your email address.',
            userId: result.insertId
          });
        });
      });
    });
  });
});

app.post('/mechanic/register', (req, res) => {
  const {
    full_name,
    username,
    email_user,
    phone_user,
    password_user,
    plate_number,
    role_user,
    nik
  } = req.body;

  if (!full_name || !username || !email_user || !password_user || !nik || !plate_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userRole = role_user || 'mechanic'; // Default to 'mechanic'
  
  // Hash the password for secure storage
  bcrypt.hash(password_user, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    // Create the SQL query for inserting the mechanic data
    const query = `
      INSERT INTO mechanic 
      (full_name, username, email_user, phone_number, password, license_plate, role, ktp_nik, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(query, [full_name, username, email_user, phone_user, hashedPassword, plate_number, userRole, nik], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to register mechanic', details: err });

      res.status(200).json({
        message: 'Mechanic registered successfully!',
        userId: result.insertId
      });
    });
  });
});

// Endpoint untuk verifikasi kode email
// Endpoint untuk verifikasi kode email
app.post('/verify-email', (req, res) => {
  const { userId, verificationCode } = req.body;

  // Pastikan userId dan verificationCode dikirimkan
  if (!userId || !verificationCode) {
    return res.status(400).json({ error: 'Missing userId or verificationCode' });
  }

  console.log('Database verification code:', userId.verification_code); // Log kode verifikasi di database
  console.log('Received verification code:', verificationCode); // Log kode verifikasi yang diterima
  
  // Cek kode verifikasi di database berdasarkan userId
  const query = 'SELECT verification_code, email_verified FROM user WHERE id_user = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];

    // Cek apakah email sudah diverifikasi
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Cek kecocokan kode verifikasi
    if (user.verification_code !== verificationCode) {
      console.error('Mismatch verification code!');
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update status email menjadi verified
    const updateQuery = 'UPDATE user SET email_verified = true, verification_code = NULL WHERE id_user = ?';
    db.query(updateQuery, [userId], (updateErr) => {
      if (updateErr) {
        console.error('Failed to update user status:', updateErr);
        return res.status(500).json({ error: 'Failed to update user status', details: updateErr });
      }

      // Kirimkan respons sukses
      res.status(200).json({ success: true, message: 'Email verified successfully' });
    });
  });
});


// Endpoint untuk login pengguna
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan Password diperlukan' });
  }

  // First check the user table
  db.query('SELECT * FROM user WHERE email_user = ?', [email], (err, userResult) => {
    if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });

    if (userResult.length > 0) {
      const user = userResult[0];

      bcrypt.compare(password, user.password_user, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server User' });

        if (!isMatch) return res.status(400).json({ error: 'Password salah' });

        const token = jwt.sign({ id: user.id_user, role: user.role_user }, secretKey, { expiresIn: '1h' });

        return res.status(200).json({
          message: 'Login berhasil',
          token,
          idUser: user.id_user,
          name: user.username,
          phone: user.phone_user,
          email: user.email_user,
          balance: user.balance,
          fullname: user.full_name,
          role: user.role_user,
          homepage: 'homepage', // Redirect to user homepage
        });
      });
    } else {
      // If not found in user table, check the mechanic table
      db.query('SELECT * FROM mechanic WHERE email_user = ?', [email], (err, mechanicResult) => {
        if (err) {
          console.error("Database error:", err);  // Log database query error
          return res.status(500).json({ error: 'Terjadi kesalahan server Mechanic' });
        }

        if (mechanicResult.length === 0) {
          return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }

        const mechanic = mechanicResult[0];

        bcrypt.compare(password, mechanic.password, (err, isMatch) => {
          if (err) {
            console.error("Bcrypt error:", err);  // Log bcrypt error
            return res.status(500).json({ error: 'Terjadi kesalahan Mechanic' });
          }

          if (!isMatch) {
            return res.status(400).json({ error: 'Password salah' });
          }

          const token = jwt.sign({ id: mechanic.id_user, role: mechanic.role }, secretKey, { expiresIn: '1h' });
          console.log("Generated Token for Mechanic:", token);  // Log the generated token for debugging

          return res.status(200).json({
            message: 'Login berhasil',
            token,
            idUser: mechanic.id_user,
            name: mechanic.username,
            phone: mechanic.phone_number,  // Correct field: phone_number
            email: mechanic.email_user,
            licensePlate: mechanic.license_plate,  // Correct field: license_plate
            fullname: mechanic.full_name,
            role: mechanic.role,  // Correct field: role
            homepage: 'homepage2', // Redirect to mechanic homepage
          });
        });
      });
    }
  });
});

// Endpoint untuk membuat transaksi dengan Midtrans
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
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create transaction',
      error: error.response?.data || error.message
    });
  }
});

app.post('/place-order', (req, res) => {
  const { userId, lokasi, latitude, longitude, platNomor, kendala } = req.body;

  // Validasi input
  if (!userId || !lokasi || !latitude || !longitude || !platNomor || !kendala) {
    return res.status(400).json({ error: 'Semua kolom wajib diisi' });
  }

  // Query untuk memasukkan data ke tabel transaksi
  const query = `
    INSERT INTO transaksi (user_id, lokasi, latitude, longitude, plat_nomor, kendala, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  // Menjalankan query untuk menyimpan transaksi
  db.query(query, [userId, lokasi, latitude, longitude, platNomor, kendala], (err, results) => {
    if (err) {
      console.error('Error storing transaction:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan transaksi' });
    }

    // Mengirimkan respons sukses jika transaksi berhasil disimpan
    res.status(200).json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      id_transaksi: results.insertId, // Menyertakan ID transaksi yang baru dibuat
    });
  });
});

app.post('/list-order', (req, res) => {
  const { status } = req.body;  // status yang diambil dari body request, misalnya 'pending' atau 'verified'

  // Query untuk mengambil transaksi dengan status yang sesuai
  const query = `
    SELECT * FROM transaksi
    WHERE status = ?`;

  db.query(query, [status], (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Mengembalikan data transaksi yang bisa diambil
    res.json(results);
  });
});



// Endpoint untuk menyimpan lokasi transaksi
app.post('/save-location', (req, res) => {
  const { location, userId } = req.body;

  // Validasi input
  if (!location || !userId) {
    return res.status(400).json({ error: 'Lokasi atau userId tidak valid' });
  }

  // Simpan transaksi baru ke database
  const query = 'INSERT INTO transaksi (user_id, lokasi) VALUES (?, ?)';
  db.query(query, [userId, location], (err, results) => {
    if (err) {
      console.error('Error storing transaction:', err);
      return res.status(500).json({ error: 'Error storing transaction' });
    }

    res.status(200).json({ success: true, message: 'Lokasi berhasil disimpan di transaksi' });
  });
});

// Endpoint untuk mendapatkan saldo pengguna
app.get('/user/balance', async (req, res) => {
  const authHeader = req.headers.authorization;

  // Periksa apakah header Authorization tersedia
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  // Extract token dari header Authorization
  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi token JWT
    const decoded = jwt.verify(token, secretKey);

    const userId = decoded.id; // Ambil user ID dari token yang sudah terverifikasi

    // Query untuk mendapatkan saldo pengguna
    const query = 'SELECT balance FROM user WHERE id_user = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Kirimkan saldo pengguna
      const { balance } = results[0];
      res.status(200).json({
        success: true,
        balance,
      });
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

app.get('/mechanic/balance', async (req, res) => {
  const authHeader = req.headers.authorization;

  // Periksa apakah header Authorization tersedia
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  // Extract token dari header Authorization
  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi token JWT
    const decoded = jwt.verify(token, secretKey);

    const userId = decoded.id; // Ambil user ID dari token yang sudah terverifikasi

    // Query untuk mendapatkan saldo pengguna
    const query = 'SELECT balance FROM mechanic WHERE id_user = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Kirimkan saldo pengguna
      const { balance } = results[0];
      res.status(200).json({
        success: true,
        balance,
      });
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});
app.put('/transaksi/:id/ambil', (req, res) => {
  const transactionId = req.params.id;
  const { mechanicId } = req.body;

  console.log('Received User ID:', mechanicId);  // Debug log untuk memastikan nilai mechanicId diterima
  console.log('Transaction ID:', transactionId);  // Debug log untuk memastikan nilai transactionId diterima

  // Query untuk mengupdate transaksi
  const query = `UPDATE transaksi SET status = 'in_progress', id_mechanic = ?, updated_at = NOW() WHERE id_transaksi = ?`;

  // Eksekusi query
  db.query(query, [mechanicId, transactionId], (error, results) => {
    if (error) {
      console.error('Error updating transaction:', error);
      return res.status(500).json({ success: false, message: 'Failed to update transaction' });
    }

    console.log('Query Results:', results);  // Debug: Periksa hasil query

    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Transaction status updated and mechanic assigned' });
    } else {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
  });
});

// Endpoint to fetch all transactions for the mechanic
app.get('/transaksi/mechanic/:mechanicId', (req, res) => {
  const { id_mechanic } = req.body;

  // SQL query to fetch all transactions for the mechanic
  const query = `
    SELECT t.id_transaksi, t.lokasi, t.status, t.created_at, u.username AS user_name, t.user_id, t.id_mechanic
    FROM transaksi t 
    JOIN user u ON t.user_id = u.id_user 
    WHERE t.status = 'in_progress'`;

  db.query(query, [id_mechanic], (error, results) => {
    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
    res.status(200).json({ success: true, transactions: results });
    console.log(id_mechanic)
  });
});

app.get('/transaksi/user/:userId', (req, res) => {
  const { id_user } = req.body;

  // SQL query to fetch all transactions for the mechanic
    const query = `
  SELECT 
    t.id_transaksi, 
    t.lokasi, 
    t.status, 
    t.created_at, 
    u.username AS user_name, 
    t.user_id, 
    t.id_mechanic, 
    m.full_name AS mechanic_name,  -- Assuming 'full_name' is the correct column for mechanic's name
    m.license_plate
  FROM 
    transaksi t 
  JOIN 
    user u ON t.user_id = u.id_user 
  JOIN 
    mechanic m ON t.id_mechanic = m.id_user
  WHERE 
    t.status = 'in_progress';
  `;

    db.query(query, [id_user], (error, results) => {
      if (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
      }
      res.status(200).json({ success: true, transactions: results });
      console.log(id_user)
    });
});

app.get('/api/chat/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;
  console.log('Received Transaction ID:', transactionId); // Log transactionId
  
  // Validasi apakah transactionId ada
  if (!transactionId) {
    return res.status(400).json({ success: false, message: 'Transaction ID is required' });
  }

  const query = `
    SELECT t.id_transaksi, t.user_id, t.id_mechanic
    FROM transaksi t
    WHERE t.id_transaksi = ?
  `;

  db.query(query, [transactionId], (error, results) => {
    if (error) {
      console.error('Error fetching transaction data:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch transaction data' });
    }
    
    console.log('Query Results:', results); // Log hasil query

    if (results.length > 0) {
      const { user_id, id_mechanic } = results[0];
      return res.status(200).json({ success: true, userId: user_id, mechanicId: id_mechanic });
    } else {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
  });
});

app.get('/api/transaction-mechanic/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;

  if (!transactionId) {
    return res.status(400).json({ success: false, message: 'Transaction ID is required' });
  }

  const query = `
    SELECT t.user_id, t.id_mechanic
    FROM transaksi t
    WHERE t.id_transaksi = ?
  `;

  db.query(query, [transactionId], (error, results) => {
    if (error) {
      console.error('Error fetching transaction data:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch transaction data' });
    }

    if (results.length > 0) {
      const { user_id, id_mechanic } = results[0];
      return res.status(200).json({ success: true, userId: user_id, mechanicId: id_mechanic });
    } else {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
  });
});


app.put('/api/transaction-mechanic/selesai/:transactionId', async (req, res) => {
  const { transactionId } = req.params;  // Get the transaction ID from the URL parameter
  const { totalCost, damageDescription } = req.body; // Get total cost and damage description from the request body

  // Validasi input
  if (!totalCost || !damageDescription) {
    return res.status(400).json({ error: 'Total cost and damage description are required' });
  }

  // Start a transaction to ensure atomicity
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Query untuk memeriksa apakah transaksi ada dan masih dalam status 'in_progress'
    const queryCheckTransaction = 'SELECT * FROM transaksi WHERE id_transaksi = ? AND status = "in_progress"';
    db.query(queryCheckTransaction, [transactionId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return db.rollback(() => res.status(500).json({ error: 'Internal server error' }));
      }

      if (results.length === 0) {
        return db.rollback(() => res.status(404).json({ error: 'Transaction not found or already completed' }));
      }

      // Query untuk mendapatkan user ID dan mechanic ID dari transaksi
      const { user_id, id_mechanic } = results[0]; // Assuming the `user_id` and `mechanic_id` are in the transaction table
      console.log('Mechanic ID:', id_mechanic);
      console.log('User ID:', user_id);
      // Update status transaksi menjadi 'completed', total_biaya, dan deskripsi
      const queryUpdateTransaction = `
        UPDATE transaksi 
        SET status = "completed", total_biaya = ?, deskripsi = ? 
        WHERE id_transaksi = ?
      `;
      db.query(queryUpdateTransaction, [totalCost, damageDescription, transactionId], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating transaction status:', updateErr);
          return db.rollback(() => res.status(500).json({ error: 'Failed to update transaction status' }));
        }

        // Update mechanic's balance (increase by totalCost)
        const queryUpdateMechanicBalance = `
          UPDATE mechanic
          SET balance = balance + ?
          WHERE id_user = ?
        `;
        db.query(queryUpdateMechanicBalance, [totalCost, id_mechanic], (mechanicErr) => {
          if (mechanicErr) {
            console.error('Error updating mechanic balance:', mechanicErr);
            return db.rollback(() => res.status(500).json({ error: 'Failed to update mechanic balance' }));
          }

          // Update user's balance (decrease by totalCost)
          const queryUpdateUserBalance = `
            UPDATE user
            SET balance = balance - ?
            WHERE id_user = ?
          `;
          db.query(queryUpdateUserBalance, [totalCost, user_id], (userErr) => {
            if (userErr) {
              console.error('Error updating user balance:', userErr);
              return db.rollback(() => res.status(500).json({ error: 'Failed to update user balance' }));
            }

            // Commit the transaction if all queries are successful
            db.commit((commitErr) => {
              if (commitErr) {
                console.error('Error committing transaction:', commitErr);
                return db.rollback(() => res.status(500).json({ error: 'Failed to commit transaction' }));
              }

              // Send success response
              res.status(200).json({
                success: true,
                message: 'Transaction completed successfully',
                transactionId: transactionId,
              });
            });
          });
        });
      });
    });
  });
});





// Jalankan server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
