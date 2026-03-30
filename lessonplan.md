# Lesson Plan: Containerization Fundamentals with Docker

This lesson plan is designed for an undergraduate course (Software Engineering/DevOps). It moves from the conceptual "Why" to the hands-on "How," using the `dstrimble-example-project` as a real-world reference.

---

## Part 1: The Fundamentals (The "Why")

### 1.1 The Problem: "It Works on My Machine"
In traditional development, moving code from a laptop to a server often fails because of **Environment Drift**. Differences in OS versions, missing libraries, or conflicting settings create bugs that are impossible to reproduce.

### 1.2 What is a Container?
A container is a lightweight, standalone, executable package that includes everything needed to run an application: **code, runtime, system tools, and libraries.** 

### 1.3 Containers vs. Virtual Machines (VMs)

| Feature | Virtual Machines (VMs) | Containers (Docker) |
| :--- | :--- | :--- |
| **OS** | Includes a full Guest OS | Shares the Host OS kernel |
| **Size** | Large (Gigabytes) | Small (Megabytes) |
| **Speed** | Slow (Minutes to boot) | Fast (Seconds to start) |
| **Efficiency** | High overhead | Low overhead |

---

## Part 2: The Docker Lifecycle

To "Dockerize" an application, we follow a three-step workflow: **Build, Ship, and Run.**

1.  **Dockerfile (The Recipe):** A text file with instructions on how to build the environment.
2.  **Image (The Cake):** A read-only snapshot created from the Dockerfile. This is your portable "executable."
3.  **Container (The Eating):** A running instance of an image. You can run many containers from one image.

---

## Part 3: Building a Node.js Application (The "How")

Using the `Dockerfile` from the example project, we examine how to package a web server.

### 3.1 The Dockerfile Anatomy
```dockerfile
FROM node:16-slim       # Start with a lightweight Node base
WORKDIR /usr/src/app    # Set internal working directory
COPY package*.json ./   # Copy dependencies first (optimizes caching)
RUN npm install         # Install dependencies
COPY . .                # Copy the rest of the source code
EXPOSE 3000             # Document the port usage
CMD ["node", "index.js"] # The command to start the app
