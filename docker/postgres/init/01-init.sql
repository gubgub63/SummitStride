-- Enable PostGIS extension for geographical data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create development database if not exists
SELECT 'CREATE DATABASE summitstride_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'summitstride_test');

-- Connect to test database and enable PostGIS
\c summitstride_test;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;