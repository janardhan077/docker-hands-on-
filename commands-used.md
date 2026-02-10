# DevOps Project – Flask App Deployment using Docker on AWS EC2

This document shows the exact steps I followed to deploy my Flask application inside a Docker container on an AWS EC2 Ubuntu server.

---

## 1) Connect to the EC2 server

First I logged into my cloud server using the SSH key.

```
ssh -i mykey.pem ubuntu@15.207.87.249
```

---

## 2) Update the server packages

Before installing anything, I updated the system to avoid dependency issues.

```
sudo apt update
sudo apt upgrade -y
```

---

## 3) Install Docker

Then I installed Docker and enabled it so it starts automatically whenever the server boots.

```
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## 4) Verify Docker installation

I confirmed Docker was installed and running properly.

```
docker --version
docker ps
```

---

## 5) Clone my GitHub project

Next I downloaded my project files from GitHub into the server.

```
git clone https://github.com/janardhan077/flask-docker-ec2.git
cd flask-docker-ec2
```

---

## 6) Build the Docker image

Here Docker reads the Dockerfile and creates an image of my Flask app.

```
docker build -t flask-app .
```

---

## 7) Run the container

This command starts the container and exposes it to the internet using port mapping.

```
docker run -d -p 80:80 flask-app
```

Port 80 (public) → Port 80 (Flask inside container)

---

## 8) Verify the running container

I checked whether the container was running successfully.

```
docker ps
```

---

## 9) Access the application

Then I opened the application in the browser using the EC2 public IP.

```
http://15.207.87.249
```

---

## 10) Rebuild after making code changes

Whenever I updated the application code, I stopped the old container, removed it, rebuilt the image, and ran a new container.

```
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
docker build -t flask-app .
docker run -d -p 80:80 flask-app
```

---

This process demonstrates containerization, deployment, and basic server management — key DevOps fundamentals.

