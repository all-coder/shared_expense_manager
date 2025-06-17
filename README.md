# Shared Expense Manager

A full-stack web application to manage and split group expenses among users. Built with a React (Vite) frontend, FastAPI backend, PostgreSQL database, and Docker for containerization.

---

## Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | React (Vite)       |
| Backend   | FastAPI (Python)   |
| Database  | PostgreSQL         |
| DevOps    | Docker, Docker Compose |

---

## Features

- User and group management
- Add and track shared expenses
- View group-wise and individual balances
- RESTful API with auto-generated Swagger docs
- Docker-based setup for easy development and deployment

---

## Prerequisites

- Git
- Docker
- Docker Compose

(Optional: PostgreSQL if not using Docker for the database)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shared-expense-manager.git
cd shared-expense-manager
```

---

### 2. Configure Environment Variables

Create the following `.env` files:

**backend/.env**
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/expenses
```

**frontend/.env**
```
VITE_BACKEND_URL=http://localhost:5000
```

> Important: Do not commit real `.env` files. Commit `.env.example` files instead with placeholder values.

---

## Docker Setup

### Build and run all services

```bash
docker-compose up --build
```

### Access the services

- Frontend: http://localhost:3001
- Backend (FastAPI Swagger UI): http://localhost:5000/docs

To stop:

```bash
docker-compose down
```

---

## Optional: Run PostgreSQL Locally (Without Docker)

1. Install PostgreSQL: https://www.postgresql.org/download/
2. Create a database named `expenses`
3. Update `backend/.env`:

```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/expenses
```

Then run only the frontend and backend via Docker or locally.

---

## Sample docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: expenses
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "5000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - db
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    env_file:
      - ./frontend/.env
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
```

---

## License

This project is licensed under the MIT License.
