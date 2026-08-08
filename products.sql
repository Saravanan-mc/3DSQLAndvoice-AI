CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock INT
);

INSERT INTO products (id, name, category, price, stock) VALUES
(201, 'Laptop', 'Electronics', 1200.00, 45),
(202, 'Mouse', 'Electronics', 25.00, 150),
(203, 'Desk', 'Furniture', 250.00, 20),
(204, 'Chair', 'Furniture', 120.00, 50),
(205, 'Headphones', 'Electronics', 100.00, 80);
