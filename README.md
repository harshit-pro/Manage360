# 📚 Manage360 – Multi-Tenant Study Library Management System (Backend)

Manage360 is a **production-grade, multi-tenant Study Library Management backend** built using **Java 17, Spring Boot 3, PostgreSQL, Flyway, and JWT Security**.

It enables **library owners** to manage students, memberships, fees, payments, alerts, and dashboard metrics — all scoped per library.

This project is designed and implemented following **real-world SaaS backend engineering practices**.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- JWT-based stateless authentication
- Role-based access (`OWNER`, `STAFF`)
- BCrypt password hashing
- Secure API access with Spring Security

### 🏢 Multi-Tenant Architecture
- Each library is isolated via `libraryId`
- Tenant context resolved from JWT
- Independent student registration sequences per library

### 👤 Student Management
- Unique registration numbers (e.g., `CSL0001`)
- Enrollment lifecycle
- Seat management
- Seasonal fee tracking

### ⏳ Membership Management
- Membership renewal with business rules
- Automatic expiry handling
- Due / expiring-soon logic

### 💰 Payments
- Membership renewals
- Seasonal fee payments
- Revenue tracking
- Payment methods: CASH / UPI / CARD

### 📊 Dashboard & Metrics
- Total & active students
- Expired / due memberships
- Pending fees
- Revenue summary & breakdown
- Estimated vs collected fees

### ⏰ Alerts & Scheduler
- Daily scheduled job
- Auto-mark expired memberships
- Expiry-soon alerts
- Idempotent alert creation

### 🗄️ Persistence
- PostgreSQL
- Flyway migrations
- Native PostgreSQL ENUMs
- Auditing (`createdAt`, `updatedAt`)

---

## 🧠 Tech Stack

| Layer | Technology |
|------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3 |
| Security | Spring Security + JWT |
| ORM | Spring Data JPA (Hibernate 6) |
| Database | PostgreSQL |
| Migrations | Flyway |
| Build | Maven |
| Scheduling | Spring Scheduler |
| API Style | REST |
| Architecture | Multi-tenant monolith (SaaS-ready) |

---

## 🧩 Architecture Overview

- **Controllers** → Thin, DTO-based
- **Services** → Business logic & transactions
- **Repositories** → Optimized JPQL queries
- **Security Layer** → JWT + Role enforcement
- **Scheduler** → Background jobs
- **Flyway** → Schema ownership

---

## 🔐 Authentication Flow

1. User logs in with email & password
2. JWT is generated with:
   - `role`
   - `libraryId`
3. JWT is sent with every request
4. Library context is resolved per request

---

## 🧪 Sample APIs

### Login
POST /api/auth/login

### Create Student
POST /api/students
Authorization: Bearer 

### Renew Membership
POST /api/memberships/{studentId}/renew

### Pay Seasonal Fees
POST /api/payments/seasonal

### Dashboard Metrics
GET /api/metrics/summary
GET /api/metrics/estimated-fees

---

## ⚙️ Running Locally

### Prerequisites
- Java 17+
- PostgreSQL
- Maven

### Steps
```bash
git clone https://github.com/<your-username>/Manage360.git
cd Manage360/backend
./mvnw spring-boot:run


---

## 14.3 FINAL POLISH CHECKLIST (DO THIS)

### ✅ Code Quality
- Remove commented / unused code
- Meaningful package names
- Consistent naming
- No entity exposure in controllers

### ✅ Git Hygiene
```bash
git status      # clean
git log --oneline  # readable history
