# Docker Setup for Abay Grand Hotel Management System

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 24 or newer)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
- Windows (PowerShell) / macOS / Linux terminal

## Project Structure

```
Abay Grand Hotel/
├── backend/           # Express.js API server
│   ├── Dockerfile
│   └── .env.example
├── frontend/          # React customer-facing app
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── admin/             # React admin panel
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
├── .dockerignore
└── README-Docker.md
```

## Quick Start

### 1. Configure Environment Variables

Copy the example environment files and fill in your secrets:

```bash
# Backend
copy backend\.env.example backend\.env

# Frontend (optional - defaults used in Docker)
copy frontend\.env.example frontend\.env

# Admin (optional - defaults used in Docker)
copy admin\.env.example admin\.env
```

> **Important**: Edit `backend\.env` and set your actual values for:
> - `JWT_SECRET` and `JWT_REFRESH_SECRET` (choose strong random strings)
> - `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`
> - `CHAPA_SECRET_KEY`, `CHAPA_PUBLIC_KEY`
>
> The `MONGODB_URI` in `.env` is **not used** in Docker — it is overridden by `docker-compose.yml` to connect to the MongoDB container.

### 2. Build and Start

```bash
docker compose up --build
```

This builds all images and starts the services:

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost            |
| Admin     | http://localhost:81         |
| Backend   | http://localhost:4000       |
| MongoDB   | internal (not exposed)      |

### 3. Verify

- Open http://localhost in your browser → customer-facing hotel site
- Open http://localhost:81 in your browser → admin panel
- Backend health check: http://localhost:4000/api/health

## Commands

### Build images

```bash
docker compose build
```

### Build and start

```bash
docker compose up --build
```

### Start without rebuilding

```bash
docker compose up -d
```

### Stop services

```bash
docker compose down
```

### Stop and remove volumes (deletes MongoDB data)

```bash
docker compose down -v
```

### Restart all services

```bash
docker compose restart
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f admin
docker compose logs -f mongodb
```

### Access a running container

```bash
docker exec -it abay-backend sh
docker exec -it abay-frontend sh
docker exec -it abay-admin sh
docker exec -it abay-mongodb sh
```

## Data Persistence

### MongoDB Data

MongoDB data is stored in a named Docker volume `mongodb_data`. It persists across container restarts and is **not** removed unless you explicitly run:

```bash
docker compose down -v
```

### Uploaded Files

Uploaded images and files are stored in the `backend_uploads` volume, mounted at `/app/uploads` inside the backend container. This persists uploads across restarts.

## Backup and Restore

### Backup MongoDB to a file

```bash
docker exec abay-mongodb mongosh --eval "db.adminCommand('ping')" --quiet
```

Create a backup:

```bash
docker exec abay-mongodb mongodump --username root --password example --authenticationDatabase admin --db Abay_Grand_Hotel --out /tmp/backup
docker cp abay-mongodb:/tmp/backup ./mongodb-backup-$(Get-Date -Format 'yyyy-MM-dd')
docker exec abay-mongodb rm -rf /tmp/backup
```

### Restore MongoDB from a backup

```bash
docker cp ./mongodb-backup-YYYY-MM-DD abay-mongodb:/tmp/backup
docker exec abay-mongodb mongorestore --username root --password example --authenticationDatabase admin --db Abay_Grand_Hotel /tmp/backup/Abay_Grand_Hotel
docker exec abay-mongodb rm -rf /tmp/backup
```

## Environment Variables Reference

### Root `.env` (optional — for Docker Compose)

| Variable                  | Default   | Description                  |
|---------------------------|-----------|------------------------------|
| `MONGO_ROOT_USERNAME`     | `root`    | MongoDB root username        |
| `MONGO_ROOT_PASSWORD`     | `example` | MongoDB root password        |
| `MONGO_DATABASE`          | `Abay_Grand_Hotel` | MongoDB database name |

To customize, create a `.env` file in the project root and set these values. Docker Compose reads them automatically.

### Backend (`backend/.env`)

| Variable                 | Required | Description                                |
|--------------------------|----------|--------------------------------------------|
| `PORT`                   | No       | Backend port (default: 4000)               |
| `MONGODB_URI`            | No*      | Overridden by docker-compose in Docker     |
| `MONGODB_DB_NAME`        | No       | MongoDB database name                      |
| `ATLAS_MONGODB_URI`      | No       | Atlas URI for sync feature                 |
| `JWT_SECRET`             | **Yes**  | JWT signing secret                         |
| `JWT_REFRESH_SECRET`     | **Yes**  | JWT refresh token secret                   |
| `CLOUDINARY_NAME`        | **Yes**  | Cloudinary cloud name                      |
| `CLOUDINARY_API_KEY`     | **Yes**  | Cloudinary API key                         |
| `CLOUDINARY_SECRET_KEY`  | **Yes**  | Cloudinary API secret                      |
| `CHAPA_SECRET_KEY`       | **Yes**  | Chapa secret key                           |
| `CHAPA_PUBLIC_KEY`       | **Yes**  | Chapa public key                           |
| `CHAPA_WEBHOOK_SECRET`   | No       | Chapa webhook secret                       |
| `CHAPA_ENCRYPTION_KEY`   | No       | Chapa encryption key                       |
| `CHAPA_CALLBACK_URL`     | No       | Chapa callback URL                         |
| `CHAPA_RETURN_URL`       | No       | Chapa return URL                           |
| `FRONTEND_URL`           | No       | Frontend URL for CORS                      |
| `ADMIN_URL`              | No       | Admin URL for CORS                         |
| `BACKEND_URL`            | No       | Backend URL for callbacks                  |
| `ADMIN_EMAIL`            | No       | Default admin email for seeding            |
| `ADMIN_PASSWORD`         | No       | Default admin password for seeding         |

\* Not required in Docker because docker-compose overrides it.

### Frontend (`frontend/.env`)

| Variable         | Required | Description                        |
|------------------|----------|------------------------------------|
| `VITE_API_URL`   | **Yes**  | Backend API URL (set via build arg in Docker) |

### Admin (`admin/.env`)

| Variable         | Required | Description                        |
|------------------|----------|------------------------------------|
| `VITE_API_URL`   | **Yes**  | Backend API URL (set via build arg in Docker) |

## Ports

| Service  | Host Port | Container Port | Purpose              |
|----------|-----------|----------------|----------------------|
| Frontend | 80        | 80             | Customer-facing site |
| Admin    | 81        | 80             | Admin panel          |
| Backend  | 4000      | 4000           | REST API             |
| MongoDB  | (none)    | 27017          | Database (internal)  |

> MongoDB is **not exposed** to the host for security. Only the backend can connect to it.

## Troubleshooting

### "Connection refused" when backend tries to connect to MongoDB

MongoDB takes a moment to initialize on first run. The backend has `depends_on` with `condition: service_healthy`, so it waits for MongoDB to be ready. If issues persist, check MongoDB logs:

```bash
docker compose logs mongodb
```

### Frontend shows blank page or API errors

1. Verify backend is running: `curl http://localhost:4000/api/health`
2. Check frontend logs: `docker compose logs frontend`
3. Check that `VITE_API_URL` was built correctly: open DevTools in the browser and check the Network tab for failing requests

### Port already in use

If port 80, 81, or 4000 is already in use on your machine, change the host port in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"   # frontend on port 8080 instead of 80
```

### Permission errors on uploads

The backend runs as a non-root user (`appuser`). If uploads fail with permission errors, check the uploads volume:

```bash
docker compose exec backend ls -la /app/uploads
```

### Rebuild a single service

```bash
docker compose build backend
docker compose up -d backend
```

### Reset everything (delete all data)

```bash
docker compose down -v
docker compose up --build
```

> **Warning**: This deletes all MongoDB data and uploaded files.

## Security Notes

- The `.env` files are **never** copied into Docker images (listed in `.dockerignore`)
- MongoDB is not exposed to the host (no port mapping)
- The backend runs as a non-root user
- Secrets are passed as environment variables at runtime, not baked into images
