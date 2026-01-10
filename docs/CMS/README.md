# CMS Documentation
## Content Management System

## Overview

Carolina Growth uses Decap CMS (formerly Netlify CMS) for content management. It provides a Git-based workflow for editing marketing content without needing to know code.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [Content Collections](./collections.md)
3. [Editing Content](./editing.md)
4. [Media Management](./media.md)
5. [Workflow](./workflow.md)
6. [Troubleshooting](./troubleshooting.md)

## System Architecture

- **CMS**: Decap CMS
- **Backend**: GitHub (Git Gateway)
- **Storage**: Git repository (`apps/web/content/`)
- **Format**: JSON files
- **Authentication**: GitHub OAuth

## Access

- **URL**: `/admin`
- **Authentication**: GitHub account required
- **Permissions**: Based on GitHub repository access

## Content Types

- **Blog Posts**: Blog articles and insights
- **Services**: Service descriptions
- **Portfolio**: Case studies and work samples
- **Team**: Team member profiles
- **Testimonials**: Client testimonials
- **Landing Pages**: Landing page content
- **Settings**: Site-wide settings

## Quick Start

1. Navigate to `/admin`
2. Login with GitHub
3. Select content type
4. Edit and save
5. Changes go live automatically
