# Architecture Overview

## Architecture Style
Modular Monolith with Multi-Tenancy

## Why Modular Monolith?
- Single development team
- Closely related business domains
- Easier debugging and deployment
- Lower operational complexity

## Multi-Tenancy Model
- Each library is a tenant
- Data isolation enforced using `library_id`
- `library_id` is extracted from JWT token

## Deployment Model
- Single backend service
- Single PostgreSQL database
- Logical tenant isolation (row-level)