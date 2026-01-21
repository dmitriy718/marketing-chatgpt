# Customer Management

## Overview

Customers are businesses or individuals who have become clients. The CRM tracks customer information, relationships, deals, and history.

## Customer Status

- **Prospect**: Potential customer, not yet active
- **Active**: Current, active customer
- **Inactive**: Former customer or dormant

## Customer Fields

### Required Fields
- **Name**: Company or individual name

### Optional Fields
- **Industry**: Business industry
- **Website**: Company website
- **Status**: Current status
- **Owner**: Assigned account manager

## Adding a Customer

### Via CRM Interface
1. Navigate to **Accounts** section
2. Click **Add Customer** or **Create Customer**
3. Enter company/name
4. Add industry and website
5. Set status
6. Assign owner
7. Save

### Via GraphQL
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
    status
  }
}
```

## Customer Contacts

### Adding Contacts
- Each customer can have multiple contacts
- Contacts have: name, email, phone, title
- Link contacts to activities and deals

### Managing Contacts
1. Open customer record
2. View contacts list
3. Add new contact
4. Edit existing contact
5. Set primary contact

## Customer Deals

### Viewing Deals
- All deals for customer
- Deal status and value
- Pipeline stage
- Close dates

### Creating Deals
1. From customer record
2. Click "Create Deal"
3. Set deal details
4. Add to pipeline
5. Track progress

## Customer Activities

### Activity Types
- **Call**: Phone conversations
- **Email**: Email communications
- **Meeting**: In-person or virtual meetings
- **Task**: To-do items

### Logging Activities
1. Open customer record
2. View activities timeline
3. Add new activity
4. Set due dates
5. Mark complete

## Customer Notes

### Adding Notes
- Document important information
- Track conversations
- Record decisions
- Store context

### Best Practices
- Date all notes
- Be specific
- Include action items
- Regular updates

## Customer History

View complete history:
- All leads that became this customer
- All deals (won and lost)
- All activities
- All notes
- Timeline view

## Best Practices

1. **Keep Updated**: Regular information updates
2. **Document Everything**: Use notes for context
3. **Track Relationships**: Manage all contacts
4. **Monitor Health**: Watch for warning signs
5. **Regular Communication**: Log all interactions

## Reports

Customer reports show:
- Customer lifetime value
- Active vs inactive
- Industry distribution
- Deal history
- Activity frequency
