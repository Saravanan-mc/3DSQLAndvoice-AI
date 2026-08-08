CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    major VARCHAR(100),
    gpa DECIMAL(3,2)
);

INSERT INTO students (id, name, age, major, gpa) VALUES
(1, 'Alice Smith', 22, 'Computer Science', 3.8),
(2, 'Bob Johnson', 19, 'Mathematics', 3.2),
(3, 'Charlie Brown', 21, 'Physics', 3.5),
(4, 'Diana Prince', 20, 'Engineering', 3.9),
(5, 'Evan Wright', 23, 'History', 3.1);
