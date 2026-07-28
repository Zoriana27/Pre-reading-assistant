const Database = require('better-sqlite3');
const db = new Database('app.db');//creates a new database file if it doesn't exist

db.exec(`
    CREATE TABLE IF NOT EXISTS courses(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lecture_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lectures(
    id INTEGER AUTOINCREMENT,
    course_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    content_id TEXT,
    pdf_text TEXT,
    summary TEXT,
    PRIMARY KEY(id, course_id),
    FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE INDEX IF NOT EXISTS idx_lectures_start_time ON lectures(START_TIME);
    CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);

`);
module.exports = db;
