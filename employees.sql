CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(100),
    salary INT
);

INSERT INTO employees (id, name, department, salary) VALUES
(101, 'John Doe', 'IT', 75000),
(102, 'Jane Roe', 'HR', 65000),
(103, 'Sam Smith', 'Finance', 80000),
(104, 'Anna Lee', 'Marketing', 72000),
(105, 'David Kim', 'IT', 85000);
