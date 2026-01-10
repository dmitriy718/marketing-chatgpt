# CRM GraphQL API

## Overview

The CRM uses GraphQL for all data operations. This provides a flexible, efficient API for querying and mutating CRM data.

## Authentication

All GraphQL requests require authentication:
- **Header**: `Authorization: Bearer <token>`
- **Token**: JWT token from login endpoint
- **Expiration**: 60 minutes (configurable)

## Endpoint

- **URL**: `/graphql`
- **Method**: POST
- **Content-Type**: `application/json`

## Queries

### Get All Leads
```graphql
query {
  leads {
    id
    full_name
    email
    company
    status
    score
  }
}
```

### Get All Customers
```graphql
query {
  customers {
    id
    name
    industry
    status
    website
  }
}
```

### Get All Deals
```graphql
query {
  deals {
    id
    name
    value
    status
    customer {
      name
    }
    stage {
      name
    }
  }
}
```

### Get Activities
```graphql
query {
  activities {
    id
    type
    subject
    status
    due_at
    assigned_to_user {
      full_name
    }
  }
}
```

## Mutations

### Create Lead
```graphql
mutation {
  createLead(payload: {
    full_name: "John Doe"
    email: "john@example.com"
    company: "Example Corp"
    source: "website"
    status: "new"
  }) {
    id
    full_name
    email
  }
}
```

### Create Customer
```graphql
mutation {
  createCustomer(payload: {
    name: "Example Corp"
    industry: "Technology"
    website: "https://example.com"
    status: "active"
  }) {
    id
    name
  }
}
```

### Create Deal
```graphql
mutation {
  createDeal(payload: {
    name: "Website Project"
    customer_id: "uuid"
    stage_id: "uuid"
    value: 10000
  }) {
    id
    name
    value
  }
}
```

### Create Activity
```graphql
mutation {
  createActivity(payload: {
    type: "call"
    subject: "Follow-up call"
    due_at: "2026-01-20T10:00:00Z"
    lead_id: "uuid"
  }) {
    id
    subject
  }
}
```

## Error Handling

GraphQL returns errors in standard format:
```json
{
  "errors": [
    {
      "message": "Error description",
      "path": ["fieldName"]
    }
  ],
  "data": null
}
```

## Permissions

### Role-Based Access
- **Admin**: Full access to all operations
- **Manager**: Can manage leads, customers, deals
- **User**: Limited to assigned records

### Field-Level Security
- Some fields restricted by role
- Sensitive data protected
- Audit trail maintained

## Best Practices

1. **Use Variables**: Don't hardcode values
2. **Request Only Needed Fields**: Optimize queries
3. **Handle Errors**: Always check for errors
4. **Use Fragments**: Reuse field sets
5. **Cache When Possible**: Reduce API calls

## Rate Limiting

- **Queries**: Reasonable limits
- **Mutations**: Stricter limits
- **Authentication**: Required for all

## Documentation

Full GraphQL schema available at:
- Development: `/graphql` (GraphQL Playground)
- Production: Schema introspection available
