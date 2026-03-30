# Lesson Plan: Containerization Fundamentals with Docker

This lesson plan is designed for an undergraduate course in Software Engineering or DevOps. It covers the conceptual "Why," the technical "How," and multi-container orchestration using the dstrimble-example-project.

---

## Part 1: The Fundamentals (The "Why")

### 1.1 The Problem: "It Works on My Machine"

Traditional development often fails due to environment drift. Differences in OS versions, missing libraries, or conflicting settings create bugs that are nearly impossible to reproduce across different machines.

### 1.2 What is a Container?

A container is a lightweight, standalone, executable package that includes everything needed to run an application: code, runtime, system tools, and libraries.

### 1.3 Containers vs. Virtual Machines (VMs)

| Feature | Virtual Machines (VMs) | Containers (Docker) |
| --- | --- | --- |
| OS | Includes a full guest OS | Shares the host OS kernel |
| Size | Large (Gigabytes) | Small (Megabytes) |
| Speed | Slow (Minutes to boot) | Fast (Seconds to start) |
| Efficiency | High overhead | Low overhead |

---

## Part 2: The Docker Lifecycle

To dockerize an application, we follow a three-step workflow: Build, Ship, and Run.

- Dockerfile (The Recipe): A text file with instructions on how to build the environment.
- Image (The Cake): A read-only snapshot created from the Dockerfile.
- Container (The Eating): A running instance of an image.

---

## Part 3: Building a Node.js Application (The "How")

### 3.1 The Dockerfile Anatomy

```dockerfile
FROM node:16-slim        # Start with a lightweight Node base
WORKDIR /usr/src/app     # Set internal working directory
COPY package*.json ./    # Copy dependencies first (optimizes caching)
RUN npm install          # Install dependencies
COPY . .                 # Copy the rest of the source code
EXPOSE 3000              # Document the port usage
CMD ["node", "index.js"] # The command to start the app
```

### 3.2 Essential CLI Commands

- Build the image: `docker build -t my-node-app .`
- Run the container: `docker run -d -p 8080:3000 --name web-server my-node-app`
- Cleanup: `docker stop web-server && docker rm web-server`

---

## Part 4: Multi-Container Orchestration (Docker Compose)

### 4.1 The docker-compose.yml Logic

Compose manages the web service and the db service together.

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: example
      POSTGRES_PASSWORD: example
    volumes:
      - db-data:/var/lib/postgresql/data
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - POSTGRES_HOST=db
    depends_on:
      - db
```

### 4.2 The "Magic" Compose Commands

- Start the full stack: `docker-compose up -d`
- Check status: `docker-compose ps`
- Shut down everything: `docker-compose down`
