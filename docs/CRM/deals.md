# Deals & Pipeline Management

## Overview

Deals represent sales opportunities. The pipeline tracks deals from initial contact through close (won or lost).

## Deal Status

- **Open**: Active deal in pipeline
- **Won**: Successfully closed
- **Lost**: Did not close

## Deal Fields

### Required Fields
- **Name**: Deal name/description
- **Customer**: Associated customer
- **Stage**: Pipeline stage

### Optional Fields
- **Value**: Deal amount
- **Close Date**: Expected close date
- **Status**: Open/won/lost

## Pipeline Stages

### Default Stages
1. **Qualification**: Initial contact, assessing fit
2. **Discovery**: Understanding needs
3. **Proposal**: Presenting solution
4. **Negotiation**: Discussing terms
5. **Closing**: Finalizing agreement

### Stage Properties
- **Order**: Sequence in pipeline
- **Probability**: Win probability (0-100%)
- **Customizable**: Add/edit stages as needed

## Creating a Deal

### Via CRM Interface
1. Navigate to **Deals** section
2. Click **Create Deal**
3. Enter deal name
4. Select customer
5. Choose pipeline stage
6. Set value and close date
7. Save

### Via GraphQL
```graphql
mutation {
  createDeal(payload: {
    name: "Website Redesign Project"
    customer_id: "uuid-here"
    stage_id: "uuid-here"
    value: 10000
    close_date: "2026-02-01"
  }) {
    id
    name
    value
    status
  }
}
```

## Moving Deals Through Pipeline

1. Open deal record
2. View current stage
3. Update to next stage
4. Adjust probability
5. Update close date if needed
6. Add notes about progress

## Deal Value

### Setting Value
- Enter expected deal amount
- Use for revenue forecasting
- Track pipeline value
- Calculate win rates

### Value Tracking
- Total pipeline value
- Average deal size
- Value by stage
- Value by customer

## Closing Deals

### Won Deals
1. Update status to "won"
2. Set actual close date
3. Record final value
4. Celebrate! 🎉
5. Archive or move to customer record

### Lost Deals
1. Update status to "lost"
2. Record reason (in notes)
3. Learn from loss
4. Update customer record
5. Plan follow-up if appropriate

## Pipeline View

### Visual Pipeline
- See all deals by stage
- Drag and drop to move stages
- Quick view of deal details
- Filter and search

### Pipeline Metrics
- Total pipeline value
- Deals by stage
- Average time in stage
- Win rate
- Conversion rates

## Best Practices

1. **Update Regularly**: Keep deal information current
2. **Move Forward**: Don't let deals stall
3. **Track Activities**: Log all interactions
4. **Set Realistic Dates**: Accurate close dates
5. **Document Everything**: Notes on progress

## Reports

Deal reports show:
- Pipeline value
- Win/loss rates
- Average deal size
- Time to close
- Stage conversion rates
- Revenue forecasting
