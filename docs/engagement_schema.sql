-- PayIntelli Academy - Engagement Events Table
-- Track user behavior for analytics

-- ============================================
-- ENGAGEMENT EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT engagement_events_action_type_check CHECK (
        action_type IN (
            'JOIN_EVENT',
            'VOTE_POLL',
            'DOWNLOAD_MATERIAL',
            'VIEW_MATERIAL',
            'OPEN_EVENT'
        )
    )
);

-- Indexes for efficient queries
CREATE INDEX idx_engagement_user_id ON engagement_events(user_id);
CREATE INDEX idx_engagement_event_id ON engagement_events(event_id);
CREATE INDEX idx_engagement_action_type ON engagement_events(action_type);
CREATE INDEX idx_engagement_created_at ON engagement_events(created_at);

-- Composite index for user+event queries
CREATE INDEX idx_engagement_user_event ON engagement_events(user_id, event_id);
