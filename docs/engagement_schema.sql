-- PayIntelli Academy - Engagement Events Table
-- Tracks user actions for analytics (join, vote, download, view, open).
-- Run after schema.sql (depends on users, events). Safe to re-run.

-- ============================================
-- ENGAGEMENT EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (
        action_type IN (
            'JOIN_EVENT',
            'VOTE_POLL',
            'DOWNLOAD_MATERIAL',
            'VIEW_MATERIAL',
            'OPEN_EVENT'
        )
    ),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries (IF NOT EXISTS = safe to re-run)
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON engagement_events(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_event_id ON engagement_events(event_id);
CREATE INDEX IF NOT EXISTS idx_engagement_action_type ON engagement_events(action_type);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON engagement_events(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_engagement_user_event ON engagement_events(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_engagement_event_created ON engagement_events(event_id, created_at);
