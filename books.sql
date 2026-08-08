CREATE TABLE books (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    author VARCHAR(100),
    genre VARCHAR(100),
    year INT
);

INSERT INTO books (id, title, author, genre, year) VALUES
(501, 'The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 1925),
(502, '1984', 'George Orwell', 'Dystopian', 1949),
(503, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960),
(504, 'A Brief History of Time', 'Stephen Hawking', 'Science', 1988),
(505, 'Sapiens', 'Yuval Noah Harari', 'History', 2011);
