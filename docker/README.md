# Docker Configuration

## Services

### PostgreSQL with PostGIS
- **Image**: postgis/postgis:16-3.4
- **Port**: 5432
- **Database**: coach_ia_hugo_dev
- **Username**: coach_user
- **Password**: coach_password_dev
- **Extensions**: PostGIS, PostGIS Topology

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Persistence**: Enabled with appendonly

## Usage

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Connect to PostgreSQL
psql -h localhost -p 5432 -U coach_user -d coach_ia_hugo_dev

# Connect to Redis
redis-cli -h localhost -p 6379
```

## Data Volumes

Data is persisted in Docker volumes:
- `postgres_data`: PostgreSQL data
- `redis_data`: Redis data

## Health Checks

Both services include health checks to ensure they're running properly before dependent services start.