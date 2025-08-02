# Fixia Marketplace & Portfolio Database Schema

## Overview

This document describes the comprehensive database schema designed for Fixia's Airbnb-style marketplace and portfolio system. The schema supports professional portfolio management, explorer favorites/wishlist functionality, advanced analytics, and marketplace optimization.

## Database Design Principles

### 1. **Performance-First Architecture**
- Comprehensive indexing strategy for sub-second marketplace queries
- Materialized views for complex aggregations
- Optimized for both read-heavy marketplace browsing and write-heavy analytics

### 2. **Scalability & Future-Proofing**
- Designed to handle 10,000+ professionals and 100,000+ portfolio images
- Partitioning-ready for analytics tables
- JSON fields for flexible metadata without schema changes

### 3. **Marketplace Best Practices**
- Learned from Airbnb, Uber, and MercadoLibre architectures
- Featured content system with performance tracking
- Advanced analytics for professional ranking algorithms

## Core Tables

### 1. Portfolio Images (`portfolio_images`)

The centerpiece table storing professional portfolio images with rich metadata.

```sql
-- Key features:
- Image metadata (dimensions, format, file size)
- Categorization and tagging system
- Multiple visibility levels (public, marketplace, private)
- Featured image selection (profile vs portfolio)
- Project metadata (duration, value, location)
- Built-in analytics (views, likes, shares)
- Content moderation workflow
- SEO optimization (alt text, searchable tags)
```

**Critical Business Logic:**
- Only ONE `is_profile_featured` image per professional (enforced by constraint)
- Automatic view/like counting via triggers
- Full-text search on title, description, and alt text

### 2. Explorer Favorites (`explorer_favorites`)

Comprehensive wishlist system supporting multiple favorite types.

```sql
-- Supports favoriting:
- Professionals (user profiles)
- Services (specific service offerings) 
- Portfolio Images (individual work samples)

-- Features:
- Wishlist categorization (urgent, future, inspiration)
- Private notes for each favorite
- Priority levels (1-5)
- Unique constraints prevent duplicates
```

### 3. Analytics Tables

**Portfolio Image Views (`portfolio_image_views`)**
- Detailed view tracking with context (source, duration, bounce rate)
- Anonymous and authenticated user tracking
- Session-based analytics

**Portfolio Image Likes (`portfolio_image_likes`)**
- Multiple reaction types (like, love, wow, helpful)
- Automatic counting via triggers
- Unique constraint prevents multiple likes per user

### 4. Professional Metrics (`professional_marketplace_metrics`)

Aggregated metrics for marketplace ranking and professional insights.

```sql
-- Tracks:
- Profile and portfolio engagement metrics
- Conversion ratios (inquiries to bookings)
- Response time analytics  
- Marketplace ranking scores
- Trending calculations
```

### 5. Featured Professionals (`featured_professionals`)

System for promoting professionals in marketplace with performance tracking.

```sql
-- Features:
- Multiple feature types (homepage, category, location, premium, trending)
- Geographic and category targeting
- Scheduling with start/end dates
- Performance metrics (impressions, clicks, conversions)
- Cost tracking for premium features
```

## Enhanced Privacy Controls

Extended `as_privacy_settings` table with portfolio-specific controls:

```sql
-- New privacy options:
show_portfolio_in_marketplace      -- Show portfolio in search results
show_portfolio_before_after        -- Show before/after comparisons
show_portfolio_project_values      -- Display project costs
show_portfolio_client_names        -- Show client testimonials
allow_portfolio_downloads          -- Enable high-res downloads
portfolio_visibility               -- public, clients_only, private
require_contact_before_portfolio   -- Require contact before viewing
```

## Performance Optimization

### Indexing Strategy

**Primary Performance Indexes:**
```sql
-- Marketplace browsing (sub-second response)
idx_portfolio_images_marketplace_browse
idx_portfolio_images_category_featured  
idx_featured_professionals_active_browse

-- Search and filtering
idx_portfolio_images_search (full-text)
idx_portfolio_images_tags (JSONB gin)

-- Analytics queries
idx_portfolio_image_views_analytics
idx_professional_marketplace_metrics_ranking
```

### Database Views

**`marketplace_professionals`** - Pre-joined professional data with portfolio statistics:
```sql
-- Combines:
- User profile data
- Portfolio summary statistics  
- Professional metrics
- Review averages
- Featured status
- Privacy settings
```

**`explorer_favorite_professionals`** - Explorer's favorites with full professional data.

## Key Business Queries

### 1. Marketplace Browse Query
```sql
SELECT * FROM marketplace_professionals mp
JOIN as_work_categories awc ON mp.id = awc.user_id  
WHERE awc.category_id = $1
    AND mp.portfolio_count > 0
    AND mp.locality = $2
ORDER BY mp.ranking_score DESC, mp.portfolio_views DESC
LIMIT 20;
```

### 2. Professional Portfolio Query
```sql
SELECT pi.*, c.name as category_name
FROM portfolio_images pi
LEFT JOIN categories c ON pi.category_id = c.id
WHERE pi.user_id = $1 
    AND pi.is_marketplace_visible = true
    AND pi.moderation_status = 'approved'
ORDER BY 
    pi.is_featured DESC,
    pi.views_count DESC,
    pi.created_at DESC;
```

### 3. Explorer Favorites Query
```sql
SELECT 
    ef.*,
    mp.first_name,
    mp.last_name,
    mp.featured_image_url,
    mp.avg_rating,
    mp.review_count
FROM explorer_favorites ef
JOIN marketplace_professionals mp ON ef.favorited_user_id = mp.id
WHERE ef.explorer_id = $1 
    AND ef.favorite_type = 'professional'
ORDER BY 
    ef.priority DESC,
    ef.created_at DESC;
```

### 4. Trending Portfolio Images
```sql
SELECT 
    pi.*,
    u.first_name || ' ' || u.last_name as professional_name,
    (pi.views_count * 0.3 + pi.likes_count * 0.7) as trend_score
FROM portfolio_images pi
JOIN users u ON pi.user_id = u.id
WHERE pi.is_marketplace_visible = true
    AND pi.moderation_status = 'approved'
    AND pi.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY trend_score DESC
LIMIT 20;
```

## Analytics & Reporting

### Professional Dashboard Metrics
```sql
-- Portfolio performance for professional dashboard
SELECT 
    COUNT(*) as total_images,
    SUM(views_count) as total_views,
    SUM(likes_count) as total_likes,
    AVG(views_count) as avg_views_per_image,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_uploads
FROM portfolio_images 
WHERE user_id = $1 AND moderation_status = 'approved';
```

### Marketplace Admin Analytics
```sql
-- Platform-wide portfolio statistics
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as images_uploaded,
    COUNT(DISTINCT user_id) as active_professionals,
    SUM(views_count) as total_views,
    SUM(likes_count) as total_likes
FROM portfolio_images
WHERE moderation_status = 'approved'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

## Security & Moderation

### Content Moderation Workflow
1. **Upload** → `moderation_status = 'pending'`
2. **Auto-approve** for trusted professionals or **Manual review**
3. **Approved** → Visible in marketplace
4. **Rejected/Flagged** → Hidden with admin notes

### Privacy Implementation
- Row-level security based on `as_privacy_settings`
- Automatic filtering in views based on privacy preferences
- Separate visibility controls for marketplace vs profile

## Migration & Deployment

### Running the Migration
```bash
# Test on development first
psql -d fixia_dev -f marketplace-portfolio-migration.sql

# Verify tables created
\dt portfolio_*
\dt explorer_*
\dt featured_*

# Check indexes
\di idx_portfolio_*

# Verify triggers
\df update_portfolio_*
```

### Data Migration Strategy
1. **Phase 1:** Create new tables (zero downtime)
2. **Phase 2:** Migrate existing `as_portfolio` data to new `portfolio_images` 
3. **Phase 3:** Update application code to use new schema
4. **Phase 4:** Drop old tables after validation

## API Integration Points

### Required API Endpoints

**Portfolio Management:**
- `POST /api/portfolio/upload` - Upload new portfolio image
- `GET /api/portfolio/:userId` - Get professional's portfolio  
- `PUT /api/portfolio/:imageId` - Update image metadata
- `DELETE /api/portfolio/:imageId` - Delete portfolio image
- `POST /api/portfolio/:imageId/feature` - Set as featured image

**Favorites System:**
- `POST /api/favorites/professional/:userId` - Add professional to favorites
- `GET /api/favorites/mine` - Get user's favorites
- `DELETE /api/favorites/:favoriteId` - Remove from favorites

**Marketplace Browse:**
- `GET /api/marketplace/professionals` - Browse professionals with filters
- `GET /api/marketplace/featured` - Get featured professionals
- `GET /api/marketplace/trending` - Get trending portfolio content

**Analytics:**
- `POST /api/analytics/portfolio-view` - Track portfolio image view
- `POST /api/analytics/portfolio-like` - Like/unlike portfolio image
- `GET /api/analytics/professional/:userId` - Professional's metrics

## Performance Expectations

### Query Performance Targets
- **Marketplace browse:** < 100ms for 20 results
- **Portfolio load:** < 50ms for 50 images  
- **Favorites load:** < 30ms for 100 favorites
- **Search queries:** < 200ms with full-text search

### Scaling Projections
- **10,000 professionals:** Current schema handles easily
- **1M portfolio images:** Requires table partitioning by date
- **10M image views/month:** Consider analytics table partitioning
- **100K concurrent users:** Add read replicas and Redis caching

## Monitoring & Maintenance

### Key Metrics to Monitor
- Portfolio upload rates and success rates
- View/like engagement rates  
- Search query performance
- Moderation queue length
- Featured professional ROI

### Maintenance Tasks
- **Weekly:** Update professional ranking scores
- **Monthly:** Clean up old analytics data
- **Quarterly:** Analyze and optimize slow queries
- **As needed:** Rebalance featured professional positions

---

*This schema represents an enterprise-grade solution designed for the competitive Argentine service marketplace, incorporating lessons learned from global marketplace leaders while addressing Fixia's specific needs in Chubut province.*