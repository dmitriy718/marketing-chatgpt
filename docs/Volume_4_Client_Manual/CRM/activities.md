# Activities & Tasks

## Overview

Activities track all interactions and tasks related to leads, customers, and deals. This includes calls, emails, meetings, and to-do items.

## Activity Types

### Call
- Phone conversations
- Video calls
- Conference calls
- Follow-up calls

### Email
- Email communications
- Email campaigns
- Follow-up emails
- Automated emails

### Meeting
- In-person meetings
- Virtual meetings
- Client visits
- Team meetings

### Task
- To-do items
- Follow-up tasks
- Research tasks
- Administrative tasks

## Activity Status

- **Open**: Not yet completed
- **Completed**: Finished
- **Canceled**: No longer needed

## Creating Activities

### Via CRM Interface
1. Navigate to **Timeline** or **Activities**
2. Click **Create Activity**
3. Select type
4. Enter subject
5. Set due date
6. Link to lead/customer/deal
7. Assign to user
8. Save

### Via GraphQL
```graphql
mutation {
  createActivity(payload: {
    type: "call"
    subject: "Follow-up call with John"
    due_at: "2026-01-20T10:00:00Z"
    lead_id: "uuid-here"
    assigned_to_user_id: "uuid-here"
  }) {
    id
    subject
    status
  }
}
```

## Activity Fields

### Required
- **Type**: Call, email, meeting, or task
- **Subject**: Description of activity

### Optional
- **Due Date**: When activity should happen
- **Assigned To**: User responsible
- **Related To**: Lead, customer, contact, or deal

## Managing Activities

### Viewing Activities
- **Timeline View**: Chronological list
- **By Type**: Filter by activity type
- **By Status**: Open, completed, canceled
- **By User**: Assigned activities
- **By Date**: Today, this week, overdue

### Completing Activities
1. Open activity
2. Review details
3. Mark as completed
4. Add completion notes
5. Update related records

### Rescheduling
1. Open activity
2. Update due date
3. Save changes
4. Notifications sent if needed

## Activity Best Practices

1. **Log Everything**: All interactions matter
2. **Be Specific**: Clear subject lines
3. **Set Due Dates**: Don't let things slip
4. **Complete Promptly**: Mark done when finished
5. **Link Properly**: Connect to relevant records

## Activity Timeline

### Viewing Timeline
- See all activities chronologically
- Filter by type, user, date
- Search for specific activities
- Export for reporting

### Timeline Benefits
- Complete history
- Context for decisions
- Accountability
- Performance tracking

## Reports

Activity reports show:
- Activities by type
- Completion rates
- User productivity
- Overdue activities
- Activity frequency
