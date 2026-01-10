# CRM Documentation
## Customer Relationship Management System

## Overview

The Carolina Growth CRM is an internal system for managing leads, customers, deals, activities, and pipeline. It provides a comprehensive view of all business relationships and sales activities.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [Leads Management](./leads.md)
3. [Customer Management](./customers.md)
4. [Deals & Pipeline](./deals.md)
5. [Activities & Tasks](./activities.md)
6. [Reports & Analytics](./reports.md)
7. [User Management](./users.md)
8. [GraphQL API](./graphql-api.md)

## System Architecture

- **Backend**: FastAPI + Strawberry GraphQL
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access
- **Frontend**: Next.js React components

## Key Features

- Lead tracking and qualification
- Customer relationship management
- Deal pipeline management
- Activity tracking
- Note taking
- Reporting and analytics
- User roles and permissions

## Access

- **URL**: `/crm`
- **Authentication**: Required (JWT token)
- **Roles**: Admin, Manager, User

## Quick Links

- [Login Guide](./getting-started.md#login)
- [Adding a Lead](./leads.md#adding-a-lead)
- [Creating a Deal](./deals.md#creating-a-deal)
- [GraphQL Queries](./graphql-api.md#queries)
