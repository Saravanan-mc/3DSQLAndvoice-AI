CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    product_id INT,
    quantity INT,
    order_date DATE
);

INSERT INTO orders (id, customer_id, product_id, quantity, order_date) VALUES
(301, 401, 201, 1, '2024-03-01'),
(302, 402, 202, 2, '2024-03-02'),
(303, 403, 203, 1, '2024-03-03'),
(304, 401, 205, 3, '2024-03-04'),
(305, 404, 204, 4, '2024-03-05');
