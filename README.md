# dstrimble-example-project

Simple Node.js app with a minimal React-like front end and cookie-based login.

## Team Members

- Daniel Trimble
- (Add other team members here)

## Tech Stack

- Node.js 18
- Express 4.x
- cookie-parser
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


## Docker - build and run

Build the image (from project root):

docker build -t dstrimble-example-project .

Run the container (simple run):

docker run --rm -p 3000:3000 dstrimble-example-project

Run with NODE_ENV set explicitly:

docker run --rm -e NODE_ENV=production -p 3000:3000 dstrimble-example-project

Development run (mount source, use nodemon inside container):

docker run --rm -it -p 3000:3000 \
  -v "$(pwd)":/usr/src/app \
  -v /usr/src/app/node_modules \
  dstrimble-example-project npm run dev

Or use docker-compose (convenient for development):

docker-compose up --build

Notes

- The Dockerfile installs only production dependencies by default. The "dev" container command above mounts the project and runs the dev script so nodemon (devDependency) is available locally. If you prefer a single-image dev workflow, I can add a separate Dockerfile for development.
- If port 3000 is in use, map another host port (e.g. `-p 8080:3000`).