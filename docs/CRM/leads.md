# Leads Management

## Overview

Leads are potential customers who have shown interest in your services. The CRM tracks all lead information, qualification status, and conversion history.

## Lead Status

Leads progress through these statuses:
- **New**: Just received, not yet qualified
- **Qualified**: Verified as potential customer
- **Nurturing**: Being nurtured with content/communication
- **Converted**: Became a customer
- **Lost**: No longer interested or disqualified

## Lead Fields

### Required Fields
- **Full Name**: Contact's name
- **Email**: Email address (unique for non-null)

### Optional Fields
- **Phone**: Phone number
- **Company**: Company name
- **Budget**: Budget range
- **Details**: Additional information
- **Source**: Where lead came from
- **Score**: Lead qualification score (0-100)
- **Assigned To**: User responsible for lead

## Adding a Lead

### Via CRM Interface
1. Navigate to **Leads** section
2. Click **Add Lead** or **Create Lead**
3. Fill in required fields
4. Add optional information
5. Set initial status
6. Save

### Via GraphQL
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

### Automatic Lead Capture
Leads are automatically created from:
- Contact forms
- Newsletter signups
- SEO audits
- Content generator
- Competitor comparisons
- Readiness assessments
- Intelligence reports
- Lead potential calculator
- Consultation bookings
- Chat messages

## Lead Scoring

### Manual Scoring
- Set score from 0-100
- Higher score = better qualified
- Use for prioritization

### Scoring Guidelines
- **0-30**: Cold lead, needs nurturing
- **31-60**: Warm lead, follow up
- **61-80**: Hot lead, prioritize
- **81-100**: Very hot, immediate attention

## Qualifying Leads

1. Review lead information
2. Check source and details
3. Update status to "qualified"
4. Set appropriate score
5. Assign to team member
6. Create follow-up activity

## Converting to Customer

1. Lead shows strong interest
2. Create customer record
3. Link lead to customer
4. Update lead status to "converted"
5. Create initial deal (optional)

## Best Practices

1. **Update Regularly**: Keep lead information current
2. **Score Consistently**: Use same criteria for all leads
3. **Track Source**: Know where leads come from
4. **Follow Up Quickly**: Respond within 24 hours
5. **Document Everything**: Use details field for notes

## Searching & Filtering

- Search by name, email, company
- Filter by status
- Filter by source
- Filter by assigned user
- Sort by score, date, name

## Reports

View lead reports for:
- Lead sources performance
- Conversion rates
- Status distribution
- Score averages
- Time to conversion
