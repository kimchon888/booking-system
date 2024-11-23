// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Sử dụng cơ sở dữ liệu trong bộ nhớ

db.serialize(() => {
    db.run(`CREATE TABLE Bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'Pending'
    )`);
});

module.exports = db;
