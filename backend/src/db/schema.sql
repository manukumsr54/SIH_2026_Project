-- RAKSHA Database Schema (PostgreSQL + PostGIS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Disasters Source of Truth
CREATE TABLE IF NOT EXISTS disasters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Critical', 'High', 'Medium', 'Safe')),
    risk_score NUMERIC(5, 2) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    affected_population INTEGER NOT NULL DEFAULT 0,
    severity NUMERIC(5, 2) NOT NULL,
    infrastructure_damage NUMERIC(5, 2) NOT NULL,
    urgency NUMERIC(5, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    source VARCHAR(100) NOT NULL,
    source_event_id VARCHAR(100),
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 90.0,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    city_area VARCHAR(100),
    data_source_type VARCHAR(20) NOT NULL DEFAULT 'REAL' CHECK (data_source_type IN ('REAL', 'DEMO')),
    score_breakdown JSONB,
    geom geometry(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disasters_risk_level ON disasters(risk_level);
CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasters(status);
CREATE INDEX IF NOT EXISTS idx_disasters_geom ON disasters USING GIST(geom);

-- 2. Disaster Zones (Polygons / Risk Isochrones)
CREATE TABLE IF NOT EXISTS disaster_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    hazard_level VARCHAR(20) NOT NULL,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    radius_km NUMERIC(6, 2) NOT NULL,
    polygon_geojson JSONB,
    affected_facilities TEXT[],
    geom geometry(Polygon, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disaster_zones_geom ON disaster_zones USING GIST(geom);

-- 3. Satellite Observations
CREATE TABLE IF NOT EXISTS satellite_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE SET NULL,
    source VARCHAR(100) NOT NULL,
    sensor VARCHAR(100) NOT NULL,
    mode VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    bbox DOUBLE PRECISION[],
    cloud_coverage NUMERIC(5, 2) DEFAULT 0,
    resolution VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    processing_level VARCHAR(50) NOT NULL,
    data_source_type VARCHAR(20) NOT NULL DEFAULT 'REAL',
    geom geometry(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Damage Assessments
CREATE TABLE IF NOT EXISTS damage_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    sector_name VARCHAR(100) NOT NULL,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    damage_map_url TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    destroyed_buildings INTEGER NOT NULL DEFAULT 0,
    severe_damage INTEGER NOT NULL DEFAULT 0,
    moderate_damage INTEGER NOT NULL DEFAULT 0,
    minor_damage INTEGER NOT NULL DEFAULT 0,
    safe_buildings INTEGER NOT NULL DEFAULT 0,
    population_affected INTEGER NOT NULL DEFAULT 0,
    source_sensors VARCHAR(255) NOT NULL,
    before_timestamp TIMESTAMPTZ NOT NULL,
    after_timestamp TIMESTAMPTZ NOT NULL,
    assessment_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_source_type VARCHAR(20) NOT NULL DEFAULT 'DEMO',
    analysis_method TEXT NOT NULL,
    evidence_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Rescue Teams & Units
CREATE TABLE IF NOT EXISTS rescue_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'On Mission', 'Resting', 'En Route')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    distance_km NUMERIC(6, 2) DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 10,
    equipment TEXT[],
    assigned_disaster_id UUID REFERENCES disasters(id) ON DELETE SET NULL,
    base_station VARCHAR(255),
    last_location_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    geom geometry(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rescue_teams_status ON rescue_teams(status);
CREATE INDEX IF NOT EXISTS idx_rescue_teams_geom ON rescue_teams USING GIST(geom);

-- 6. Rescue Assignments (Transactional Log)
CREATE TABLE IF NOT EXISTS rescue_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES rescue_teams(id) ON DELETE CASCADE,
    disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'DEPLOYED',
    notes TEXT,
    completed_at TIMESTAMPTZ
);

-- 7. Safe Locations (Evacuation Centers, Hospitals, Shelters)
CREATE TABLE IF NOT EXISTS safe_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('evacuation_center', 'hospital', 'relief_camp', 'safe_zone')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 500,
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    contact VARCHAR(100),
    facilities TEXT[],
    geom geometry(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safe_locations_geom ON safe_locations USING GIST(geom);

-- 8. Offline Regional Route Packs
CREATE TABLE IF NOT EXISTS offline_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    size_mb NUMERIC(6, 2) NOT NULL DEFAULT 50.0,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    bounds JSONB NOT NULL,
    road_graph_data JSONB,
    last_synced TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    refresh_interval VARCHAR(20) NOT NULL DEFAULT '30s',
    critical_alerts BOOLEAN NOT NULL DEFAULT true,
    high_risk_alerts BOOLEAN NOT NULL DEFAULT true,
    evacuation_alerts BOOLEAN NOT NULL DEFAULT true,
    map_style VARCHAR(50) NOT NULL DEFAULT 'Satellite',
    auto_sync BOOLEAN NOT NULL DEFAULT true,
    offline_regions_cached TEXT[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. System Audit Events (Immutable Logs)
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at DESC);
