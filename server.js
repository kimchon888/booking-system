
// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Tạo cơ sở dữ liệu SQLite
const db = new sqlite3.Database('bookings.db', (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the bookings database.');

    // Tạo bảng Bookings nếu chưa tồn tại
    db.run(`
        CREATE TABLE IF NOT EXISTS Bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerName TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Cancelled'))
        )
    `);
});

// Phục vụ tệp HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Lấy danh sách đặt chỗ
app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM Bookings', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Thêm đặt chỗ mới
app.post('/api/bookings', (req, res) => {
    const { customerName, date, time } = req.body;

    // Kiểm tra xem đã có đặt chỗ với ngày và giờ này chưa
    db.get('SELECT * FROM Bookings WHERE date = ? AND time = ?', [date, time], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.status(400).json({ error: 'Đã có đặt chỗ với ngày và giờ này!' });
            return;
        }

        // Thêm đặt chỗ mới vào cơ sở dữ liệu
        db.run('INSERT INTO Bookings (customerName, date, time, status) VALUES (?, ?, ?, ?)', [customerName, date, time, 'Pending'], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, customerName, date, time, status: 'Pending' });
        });
    });
});

// Cập nhật thông tin đặt chỗ
app.put('/api/bookings/:id', (req, res) => {
    const id = req.params.id;
    const { customerName, date, time } = req.body;

    // Kiểm tra xem đã có đặt chỗ với ngày và giờ này chưa
    db.get('SELECT * FROM Bookings WHERE id != ? AND date = ? AND time = ?', [id, date, time], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.status(400).json({ error: 'Đã có đặt chỗ với ngày và giờ này!' });
            return;
        }

        // Cập nhật thông tin đặt chỗ
        db.run('UPDATE Bookings SET customerName = ?, date = ?, time = ? WHERE id = ?', [customerName, date, time, id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Đặt chỗ đã được cập nhật!' });
        });
    });
});

// Hủy đặt chỗ
app.put('/api/bookings/cancel/:id', (req, res) => {
    const id = req.params.id;

    db.run('UPDATE Bookings SET status = ? WHERE id = ?', ['Cancelled', id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Đặt chỗ đã được hủy!' });
    });
});
// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});