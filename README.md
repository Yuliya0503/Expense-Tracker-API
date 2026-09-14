# Expense Tracker API

A REST API for managing personal expenses with user authentication and JWT authorization.

This project was built as part of the [roadmap.sh Backend Projects](https://roadmap.sh/projects/expense-tracker-api) to practice backend development with **Node.js, TypeScript, Express and PostgreSQL**.

## About the Project

The API allows users to create an account, log in, and manage their personal expenses.

Each user can only access and modify their own expenses.

### Main features

* User registration and login
* JWT authentication
* Protected API endpoints
* Create, read, update and delete expenses
* Partial expense updates with `PATCH`
* Filter expenses by date
* Request data validation
* PostgreSQL database
* Password hashing with bcrypt

## Tech Stack

| Technology     | Purpose               |
| -------------- | --------------------- |
| **TypeScript** | Programming language  |
| **Node.js**    | Runtime               |
| **Express**    | Web framework         |
| **PostgreSQL** | Database              |
| **pg**         | PostgreSQL client     |
| **JWT**        | Authentication        |
| **bcrypt**     | Password hashing      |
| **dotenv**     | Environment variables |

## API Endpoints

### Authentication

| Method | Endpoint       | Description             |
| ------ | -------------- | ----------------------- |
| `POST` | `/auth/signup` | Register a new user     |
| `POST` | `/auth/login`  | Login and receive a JWT |

### Expenses

All expense endpoints require authentication.

| Method   | Endpoint        | Description                 |
| -------- | --------------- | --------------------------- |
| `GET`    | `/expenses`     | Get user's expenses         |
| `GET`    | `/expenses/:id` | Get one expense             |
| `POST`   | `/expenses`     | Create an expense           |
| `PUT`    | `/expenses/:id` | Update an expense           |
| `PATCH`  | `/expenses/:id` | Partially update an expense |
| `DELETE` | `/expenses/:id` | Delete an expense           |

Authentication is handled using:

```http
Authorization: Bearer <your-token>
```

## Expense Filters

The API supports several ways to filter expenses.

### Last 7 days

```http
GET /expenses?period=week
```

### Last month

```http
GET /expenses?period=month
```

### Last 3 months

```http
GET /expenses?period=3months
```

### Custom date range

```http
GET /expenses?from=2026-01-01&to=2026-01-31
```

Dates use the `YYYY-MM-DD` format.

## Expense Categories

The available categories are:

```text
Groceries
Leisure
Electronics
Utilities
Clothing
Health
Others
```

## Example Request

### Create an expense

```http
POST /expenses
Authorization: Bearer <your-token>
Content-Type: application/json
```

```json
{
  "amount": 49.99,
  "category": "Groceries",
  "expense_date": "2026-09-14"
}
```

Response:

```json
{
  "id": 1,
  "amount": 49.99,
  "category": "Groceries",
  "expense_date": "2026-09-14"
}
```

## Authentication

After signing up, a user can log in with their email and password.

The password is securely hashed with **bcrypt** before being stored in the database.

After successful login, the API generates a JWT containing the user's ID.

Protected endpoints use the JWT to identify the user and ensure that expenses belong to the authenticated account.

## Database

The application uses PostgreSQL with two main entities:

```text
users
├── id
├── username
├── email
├── password_hash
└── created_at

expenses
├── id
├── user_id
├── amount
├── category
└── expense_date
```

The `user_id` connects each expense to its owner.

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432

JWT_SECRET=your_secret_key
```

### 4. Start the server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

## What I Practiced

This project helped me practice:

* Building REST APIs with Express
* TypeScript in a backend application
* PostgreSQL and SQL queries
* JWT authentication and authorization
* Password hashing with bcrypt
* Express middleware
* CRUD operations
* Request validation
* Query parameters and date filtering
* Error handling
* Working with environment variables

## Future Improvements

* Add automated tests
* Add Swagger/OpenAPI documentation
* Add pagination
* Add sorting options
* Add Docker support
* Improve authentication with refresh tokens

## Project Goal

The main goal of this project was to strengthen my understanding of backend fundamentals by building a complete API with authentication, database integration and protected user-specific resources.

Built with **TypeScript, Express and PostgreSQL** as part of my backend learning journey.

