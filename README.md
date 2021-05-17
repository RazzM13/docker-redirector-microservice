# A simplistic Docker based URL shortening / redirection microservice.

## Requirements:
- node;
- npm;
- docker;
- docker-compose.

## Usage:

To set up the project please take the following steps: 
- From a terminal within the project directory, please execute: `npm i`;
- Start up the project in either *Production mode* or *Development mode*;
- After all the services have successfully started, for analytics to work correctly, this additional command needs to be executed:
```
docker-compose exec analytics-postgres psql -U test -c "INSERT INTO sites (id, domain, inserted_at, updated_at, timezone, public) VALUES (0, 'localhost', now(), now(), 'Europe/Berlin', True);"
docker-compose exec analytics-postgres psql -U test -c "INSERT INTO shared_links (id, site_id, slug, inserted_at, updated_at, name) VALUES (0, 0, 'frontend', now(), now(), 'frontend');"
```

### Production mode:
`npm start` - should startup all required services and expose the following on your localhost:
- Frontend (i.e. redirection microservice UI) on port 8080;
- Backend (i.e. redirection microservice API) on port 8082;
- Documentation (i.e. Swagger-UI) on port 8081;
- Analytics (i.e. Plausible) on port 8083.

### Development mode:
`npm run dev` - should startup all the services mentioned above in development mode (i.e. with hot-reloading enabled) and additionally expose the following on your localhost:
- Backend database on port 27017.
