# Content Collections

## Overview

Content is organized into collections. Each collection has a specific purpose and structure.

## Blog Collection

### Purpose
Blog posts, articles, and insights

### Fields
- **Title**: Post title
- **Slug**: URL-friendly identifier
- **Date**: Publication date
- **Author**: Author name
- **Category**: Post category
- **Tags**: Post tags
- **Featured Image**: Main image
- **Excerpt**: Short summary
- **Body**: Full post content

### Location
`apps/web/content/blog.json`

## Services Collection

### Purpose
Service descriptions and details

### Fields
- **Slug**: URL identifier
- **Title**: Service name
- **Kicker**: Short tagline
- **Summary**: Brief description
- **Description**: Full description
- **Deliverables**: List of deliverables

### Location
`apps/web/content/services.json`

## Portfolio Collection

### Purpose
Case studies and work samples

### Fields
- **Title**: Project name
- **Client**: Client name
- **Industry**: Client industry
- **Services**: Services provided
- **Challenge**: Problem solved
- **Solution**: Approach taken
- **Results**: Outcomes and metrics
- **Images**: Project images

### Location
`apps/web/content/portfolio.json`

## Team Collection

### Purpose
Team member profiles

### Fields
- **Name**: Full name
- **Role**: Job title
- **Bio**: Biography
- **Photo**: Profile image
- **Email**: Contact email
- **Social Links**: Social media profiles

### Location
`apps/web/content/team.json`

## Testimonials Collection

### Purpose
Client testimonials and reviews

### Fields
- **Name**: Client name
- **Company**: Company name
- **Role**: Client role/title
- **Testimonial**: Quote text
- **Rating**: Star rating (1-5)
- **Photo**: Client photo (optional)
- **Featured**: Show prominently

### Location
`apps/web/content/testimonials.json`

## Landing Pages Collection

### Purpose
Landing page templates and content

### Fields
- **Slug**: Page identifier
- **Title**: Page title
- **Headline**: Main headline
- **Subheadline**: Supporting text
- **CTA Text**: Call-to-action
- **Features**: Feature list
- **Benefits**: Benefit list

### Location
`apps/web/content/landing-templates.json`

## Settings Collection

### Purpose
Site-wide settings and configuration

### Fields
- **Site Name**: Website name
- **Tagline**: Site tagline
- **Description**: Meta description
- **Logo**: Site logo
- **Contact Email**: Main contact
- **Social Links**: Social media URLs

### Location
`apps/web/content/settings.json`

## Collection Structure

All collections use JSON format:
```json
{
  "collection_name": [
    {
      "field1": "value1",
      "field2": "value2"
    }
  ]
}
```

## Editing Collections

1. Open CMS (`/admin`)
2. Select collection
3. View all entries
4. Edit or create new
5. Save changes
6. Changes commit to Git

## Best Practices

1. **Maintain Structure**: Follow field definitions
2. **Use Consistent Formatting**: Keep style uniform
3. **Add Images**: Visual content is important
4. **SEO Considerations**: Use descriptive titles
5. **Regular Updates**: Keep content fresh
