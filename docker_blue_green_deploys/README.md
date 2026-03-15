# Docker Blue-Green Deployment

This project demonstrates **Blue-Green Deployment using Docker and Nginx**.
Blue-Green deployment is a technique used to release new versions of an application **without downtime**.

In this setup:

* **Blue environment** → current running version
* **Green environment** → new version of the application
* **Nginx** acts as a load balancer to switch traffic between them.

---

## Project Structure

```
docker_blue_green_deploy
│
├── docker-compose.yml
│
├── blue
│   ├── Dockerfile
│   └── app.py
│
├── green
│   ├── Dockerfile
│   └── app.py
│
└── nginx
    └── nginx.conf
```

---

## Technologies Used

* Docker
* Docker Compose
* Nginx
* Python (Flask)

---

## How Blue-Green Deployment Works

1. The **Blue version** of the application runs in one container.
2. The **Green version** runs in another container.
3. **Nginx** routes user traffic to one version.
4. When a new version is ready, the traffic is switched from **Blue → Green** without stopping the application.

This ensures **zero downtime deployment**.

---

## Setup Instructions

### 1 Clone the Repository

```
git clone https://github.com/your-username/docker_blue_green_deploy.git
cd docker_blue_green_deploy
```

### 2 Start the Containers

```
docker-compose up --build
```

### 3 Open in Browser

```
http://localhost:8080
```

You will see either the **Blue** or **Green** version depending on the Nginx configuration.

---

## Switching Deployment

To switch traffic between versions, update the `nginx.conf` file.

Example:

Blue Version

```
server blue:5000;
```

Green Version

```
server green:5000;
```

After updating, restart Nginx:

```
docker-compose restart nginx
```

---

## Advantages of Blue-Green Deployment

* Zero downtime deployments
* Easy rollback to previous version
* Safer production releases
* Better reliability

---

## Author

Janardhan

---

## DevOps Learning

This project is part of my **DevOps learning journey**, practicing deployment strategies using Docker.

