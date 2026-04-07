const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const nodemailer = require('nodemailer');
const session = require('express-session');

const app = express();

// --- 1. SESSION SETUP ---
app.use(session({
    secret: 'sourav_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 2. Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'sourav_db' 
});

db.connect((err) => {
    if (err) throw err;
    console.log('Database Connected Successfully...');
});

// 3. Email Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'souravprajapati89@gmail.com',
        pass: 'bifhgxstbinohxxu' 
    }
});

const isAdmin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

// --- ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.send(`
        <html>
        <body style="font-family: sans-serif; text-align: center; background: #f4f7f6; padding-top: 100px;">
            <div style="display: inline-block; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h2>Admin Login</h2>
                <form action="/login" method="POST">
                    <input type="text" name="id" placeholder="Admin ID" required style="display: block; width: 250px; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px;"><br>
                    <input type="password" name="pass" placeholder="Password" required style="display: block; width: 250px; padding: 10px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px;"><br>
                    <button type="submit" style="background: #4a00e0; color: white; border: none; padding: 10px 30px; border-radius: 5px; cursor: pointer; font-size: 16px;">Login</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { id, pass } = req.body;
    if (id === 'admin' && pass === 'sourav123') { 
        req.session.isLoggedIn = true;
        res.redirect('/admin');
    } else {
        res.send("<script>alert('Galat Details!'); window.location='/login';</script>");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// --- SUBMIT LOGIC (PREMIUM VIJAY RAAZ STYLE EMAIL) ---
app.post('/submit', (req, res) => {
    const { fullName, userEmail, phoneNo, dob, address, userPassword } = req.body;
    const sql = "INSERT INTO sourav_entries (fullName, userEmail, phoneNO, dob, address, userPassword) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [fullName, userEmail, phoneNo, dob, address, userPassword], (err, result) => {
        if (err) {
            console.error(err);
            res.send("Database Error!");
        } else {
            
            // 1. ADMIN NOTIFICATION
            const adminMailOptions = {
                from: 'souravprajapati89@gmail.com',
                to: 'souravprajapati89@gmail.com',
                subject: '🚀 New Registration Alert!',
                html: `<p>New user registered: <b>${fullName}</b> (${userEmail})</p>`
            };

            // 2. THE PREMIUM EMAIL DESIGN (Wahi Jo Tumhe Chahiye)
            const userMailOptions = {
                from: '"Sourav Services" <souravprajapati89@gmail.com>',
                to: userEmail,
                subject: 'Registration Successful - Welcome to Our Community! ✅',
                html: `
                <div style="background-color: #f1f4f8; padding: 30px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e1e8ed;">
                        
                        <tr>
                            <td style="background-color: #5d29d6; padding: 50px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">Welcome aboard, ${fullName}!</h1>
                                <p style="color: #ffffff; opacity: 0.9; margin-top: 10px; font-size: 18px;">We're thrilled to have you here.</p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 18px; color: #333333; margin: 0 0 20px 0;">Hi <b>${fullName}</b>,</p>
                                <p style="font-size: 16px; color: #555555; line-height: 1.7; margin: 0;">
                                    Thank you for registering with <b>Sourav Services</b>! Your account has been successfully created and your details have been securely saved in our system.
                                </p>

                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f8f7ff; border-radius: 10px; border: 1px solid #ede8ff;">
                                    <tr>
                                        <td style="padding: 25px;">
                                            <h4 style="margin: 0 0 15px 0; color: #5d29d6; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Account Details:</h4>
                                            <p style="margin: 8px 0; font-size: 15px; color: #333;"><b>User ID:</b> <span style="color: #5d29d6; font-weight: bold;">${userEmail}</span></p>
                                            <p style="margin: 8px 0; font-size: 15px; color: #333;"><b>Account Status:</b> <span style="color: #27ae60; font-weight: bold;">Verified ✅</span></p>
                                        </td>
                                    </tr>
                                </table>

                                <p style="font-size: 16px; color: #555555; line-height: 1.7;">
                                    You can now explore our premium features. If you face any issues, simply reply to this email. Our support team is available for you.
                                </p>

                                <div style="margin-top: 40px; border-top: 2px solid #f6f6f6; padding-top: 25px;">
                                    <p style="margin: 0; color: #888888; font-size: 14px;">Best Regards,</p>
                                    <p style="margin: 5px 0 0 0; color: #5d29d6; font-weight: bold; font-size: 18px;">The Sourav Team</p>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="background-color: #fcfcfc; padding: 20px; text-align: center; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee;">
                                © 2026 Sourav Services | Agra, Uttar Pradesh, India <br>
                                This is an automated registration confirmation email.
                            </td>
                        </tr>
                    </table>
                </div>`
            };

            transporter.sendMail(adminMailOptions);
            transporter.sendMail(userMailOptions, (error, info) => {
                res.send(`
                    <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
                        <h1 style="color: #5d29d6; font-size: 40px;">✅ Registration Successful!</h1>
                        <p style="font-size: 18px;">Check your email (<b>${userEmail}</b>) for the welcome message.</p>
                        <br>
                        <a href="/" style="display:inline-block; margin-top:20px; color:#5d29d6; font-weight:bold; text-decoration:none; border: 2px solid #5d29d6; padding: 10px 25px; border-radius: 8px;">Back to Home</a>
                    </div>
                `);
            });
        }
    });
});

// --- ADMIN DASHBOARD ---
app.get('/admin', isAdmin, (req, res) => {
    const sql = "SELECT * FROM sourav_entries ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.send("Error fetching data!");
        let rows = results.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.userEmail}</td>
                <td>${user.phoneNO}</td>
                <td>${user.dob}</td>
                <td>${user.address}</td>
                <td><a href="/delete/${user.id}" onclick="return confirm('Pakka?')" style="color: red; font-weight:bold;">Delete</a></td>
            </tr>`).join('');

        res.send(`
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; background: #f4f7f6; padding: 30px; }
                    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; }
                    th, td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
                    th { background: #4a00e0; color: white; }
                    tr:hover { background: #f8f8ff; }
                    h1 { text-align: center; color: #333; }
                </style>
            </head>
            <body>
                <h1>Admin Dashboard - All Users</h1>
                <div style="text-align:center; margin-bottom:20px;">
                   <a href="/">+ New User</a> | <a href="/logout" style="color:red;">Logout</a>
                </div>
                <table>
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>Address</th><th>Action</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
    });
});

app.get('/delete/:id', isAdmin, (req, res) => {
    db.query("DELETE FROM sourav_entries WHERE id = ?", [req.params.id], () => res.redirect('/admin'));
});

app.listen(3000, () => console.log('Server is live: http://localhost:3000'));