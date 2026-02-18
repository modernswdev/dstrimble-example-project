# dstrimble-example-project

Simple Node.js app with a minimal React-like front end and cookie-based login.

## Team Members

- Daniel Trimble
- (Add other team members here)

## Tech Stack

- Node.js 18
- Express 4.x
- cookie-parser
- pg (node-postgres)
- Minimal vanilla front-end JavaScript (no bundler required)
- Docker / docker-compose

## Project Idea

A compact example that demonstrates a minimal full-stack application: an Express server providing a tiny JSON API and cookie-based authentication, served alongside a small client-side UI that requires no build step. This is intended as a learning / prototype starter project.

## Mission Statement

Provide a minimal, easy-to-run example showing how to wire a server and client together with cookie-based auth and make it runnable locally or in a container with zero build tooling.

## How to run (local)

1. Open a terminal and change to the project folder:

   cd /Users/daniel/Projects/SWdevGA/dstrimble-example-project

2. Install dependencies:

   npm install

3. Start the server:

   npm start

   - Server will listen on http://localhost:3000
   - For development with automatic restart use:

     npm run dev

Note: the app can be pointed at a local Postgres instance by setting the standard POSTGRES_* environment variables (see Docker section for defaults used in docker-compose).

## Database (Postgres)

This project includes optional Postgres integration. The server uses `pg` and will create a simple `users` table on startup if it does not already exist.

Environment variables used by the app to connect to Postgres:

- POSTGRES_HOST (default: `db` in docker-compose)
- POSTGRES_PORT (default: `5432`)
- POSTGRES_USER (default: `example`)
- POSTGRES_PASSWORD (default: `example`)
- POSTGRES_DB (default: `exampledb`)

Important: For security, do not commit real credentials to the repository. Use environment files or your platform's secret management.

## Docker - build and run

Build the image (from project root):

docker build -t dstrimble-example-project .

Run the container (simple run):

docker run --rm -p 3000:3000 \
  -e POSTGRES_HOST=db \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_USER=example \
  -e POSTGRES_PASSWORD=example \
  -e POSTGRES_DB=exampledb \
  dstrimble-example-project

Note: Running the single container image above expects a reachable Postgres instance at the host you specify. For a one-command setup that includes Postgres, use docker-compose below.

Run with NODE_ENV set explicitly:

docker run --rm -e NODE_ENV=production -p 3000:3000 dstrimble-example-project

Development run (mount source, use nodemon inside container):

docker run --rm -it -p 3000:3000 \
  -v "$(pwd)":/usr/src/app \
  -v /usr/src/app/node_modules \
  dstrimble-example-project npm run dev

### Docker Compose

The included `docker-compose.yml` defines two services: `db` (Postgres) and `web` (this app). To build and start both services run:

docker-compose up --build

Possible troubleshooting notes:

- The compose `depends_on` ensures start order but does not guarantee the database is ready to accept connections. If the web service logs show connection errors at startup, either restart the web service after the db is up or use a small retry/wait loop. Example restart:

  docker-compose restart web

- To view logs for the db or web services:

  docker-compose logs -f db
  docker-compose logs -f web

- To remove and recreate the database volume (data will be lost):

  docker-compose down -v

## Security notes

- This example stores passwords in plaintext for simplicity. For any real application, store hashed passwords (bcrypt/argon2) and never commit secrets to source control.
- Use HTTPS and secure cookie flags in production.

## Further improvements (suggestions)

- Replace plaintext passwords with hashed passwords and add a registration flow.
- Add migrations and seed scripts (e.g. using node-pg-migrate or a simple SQL script).
- Add proper session/JWT handling and logout invalidation.
- Add automated tests and CI configuration.