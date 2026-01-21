# CRM Getting Started Guide

## First Time Setup

### Accessing the CRM

1. Navigate to `/crm` on the website
2. Login with your credentials
3. If you don't have access, contact an administrator

### Initial Login

**Default Admin Credentials** (if first time):
- Email: Set in `ADMIN_EMAIL` environment variable
- Password: Set in `ADMIN_PASSWORD` environment variable

**Security Note**: Change default password immediately after first login.

## Dashboard Overview

The CRM dashboard provides:
- **Leads Count**: Total leads in system
- **Accounts Count**: Total customers
- **Open Deals**: Active deals in pipeline
- **Activities**: Pending tasks and events

## Navigation

### Main Sections
- **Dashboard**: Overview and metrics
- **Leads**: Lead management
- **Accounts**: Customer management
- **Deals**: Deal pipeline
- **Pipeline**: Visual pipeline view
- **Timeline**: Activity history
- **Reports**: Analytics and reporting

## User Roles

### Admin
- Full system access
- User management
- System configuration
- All CRUD operations

### Manager
- Lead and customer management
- Deal management
- Activity management
- Limited user management

### User
- View assigned leads/customers
- Create activities
- Limited editing permissions

## Basic Workflow

1. **Lead Comes In** → Create/update lead
2. **Qualify Lead** → Update status and score
3. **Convert to Customer** → Create customer record
4. **Create Deal** → Add to pipeline
5. **Track Activities** → Log calls, emails, meetings
6. **Close Deal** → Update deal status

## Next Steps

- [Learn about Leads](./leads.md)
- [Understand Customers](./customers.md)
- [Manage Deals](./deals.md)
- [Track Activities](./activities.md)
