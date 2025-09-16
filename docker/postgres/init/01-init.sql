-- Enable PostGIS extension for geographical data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create development database if not exists
SELECT 'CREATE DATABASE coach_ia_hugo_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'coach_ia_hugo_test');

-- Connect to test database and enable PostGIS
\c coach_ia_hugo_test;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;