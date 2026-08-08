CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    country VARCHAR(100)
);

INSERT INTO customers (id, name, email, country) VALUES
(401, 'Alice Wonderland', 'alice@email.com', 'USA'),
(402, 'Bob Builder', 'bob@email.com', 'UK'),
(403, 'Charlie Chocolate', 'charlie@email.com', 'Canada'),
(404, 'Diana Ross', 'diana@email.com', 'USA'),
(405, 'Evan Almighty', 'evan@email.com', 'Australia');
