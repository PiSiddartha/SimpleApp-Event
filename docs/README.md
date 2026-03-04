# PayIntelli Academy - Backend Structure

## Project Overview

Serverless backend for PayIntelli Academy seminar engagement platform.

## Architecture

- **Lambda**: AWS Lambda for compute
- **API Gateway**: REST API layer
- **RDS PostgreSQL**: Database
- **S3**: Material storage
- **Cognito**: Authentication

## Project Structure

```
payintelli-seminar-platform/
├── lambdas/
│   ├── events/          # Event management
│   ├── attendance/      # QR attendance tracking
│   ├── polls/           # Real-time polling
│   ├── materials/       # File uploads/downloads
│   └── analytics/        # Engagement analytics
├── shared/
│   ├── db.py           # PostgreSQL connection
│   ├── auth.py         # Cognito JWT verification
│   └── models.py       # Data models
└── infra/
    └── terraform/       # Infrastructure as code
```

## Lambda Structure (handler → service → repository)

Each lambda follows clean architecture:

1. **handler.py**: Entry point, routes requests
2. **service.py**: Business logic
3. **repository.py**: Database operations

## Environment Variables

```
DB_HOST: PostgreSQL host
DB_PORT: PostgreSQL port
DB_NAME: Database name
DB_USER: Database user
DB_PASSWORD: Database password
COGNITO_USER_POOL_ID: Cognito pool ID
COGNITO_APP_CLIENT_ID: Cognito app client ID
AWS_REGION: AWS region
CORS_ORIGIN: Allowed CORS origin
```

## API Endpoints

### Events
- `POST /events` - Create event (organizer+)
- `GET /events` - List events
- `GET /events/{id}` - Get event
- `PUT /events/{id}` - Update event (organizer+)
- `DELETE /events/{id}` - Delete event (organizer+)

### Attendance
- `POST /attendance` - Mark attendance (QR scan)
- `GET /attendance` - List user's attendance
- `GET /attendance/event/{id}` - Get event attendance

### Polls
- `POST /polls` - Create poll (organizer+)
- `GET /polls?event_id=` - List polls
- `GET /polls/{id}` - Get poll
- `POST /polls/{id}/vote` - Cast vote
- `GET /polls/{id}/results` - Get poll results

### Materials
- `POST /materials` - Create material (organizer+)
- `GET /materials?event_id=` - List materials
- `GET /materials/{id}` - Get material
- `POST /materials/{id}/download` - Get download URL

### Analytics
- `GET /analytics/event/{id}` - Event analytics (organizer+)
- `GET /analytics/overview` - Platform overview (organizer+)
- `GET /analytics/student/{id}` - Student analytics (organizer+)

## Deployment

See `infra/terraform/` for AWS infrastructure setup.
