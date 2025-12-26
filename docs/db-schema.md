# Manage360 Database Schema (Multi-Tenant)

## Overview
This schema is designed as a Multi-Tenant SaaS architecture.
- **Tenant**: `Library` (A physical library or study center).
- **Isolation**: All core entities (`User`, `Student`, `Membership`, etc.) **MUST** reference a `library_id`.
- **Global**: Only Super Admins exist outside specific libraries.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    %% Core Tenant
    Library ||--o{ User : "staffs"
    Library ||--o{ Student : "members"
    Library ||--o{ MembershipPlan : "offers"
    Library ||--o{ Alert : "broadcasts"

    %% Staff
    User {
        uuid id PK
        uuid library_id FK "Tenant ID"
        string email
        string role "OWNER, ADMIN, STAFF"
    }

    %% Students
    Student {
        uuid id PK
        uuid library_id FK "Tenant ID"
        string email
        string phone
        enum status "ACTIVE, INACTIVE, BANNED"
    }

    %% Memberships
    MembershipPlan ||--o{ StudentMembership : "defines"
    Student ||--o{ StudentMembership : "subscribes"

    StudentMembership {
        uuid id PK
        uuid library_id FK "Tenant ID"
        uuid student_id FK
        uuid plan_id FK
        date start_date
        date end_date
        enum status "ACTIVE, EXPIRED"
    }

    %% Payments
    Student ||--o{ Payment : "pays"
    Payment {
        uuid id PK
        uuid library_id FK "Tenant ID"
        uuid student_id FK
        decimal amount
        enum status "SUCCESS, PENDING, FAILED"
    }

    %% Alerts
    Alert {
        uuid id PK
        uuid library_id FK "Tenant ID"
        enum type "SYSTEM, RENT_DUE, EXPIRY"
        boolean is_read
    }