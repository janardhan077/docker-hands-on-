# Docker Cheat Sheet

## Container Commands
- `docker run -it ubuntu bash` → Run interactive container
- `docker run -d -p 8080:80 nginx` → Run detached with port mapping
- `docker ps` → List running containers
- `docker ps -a` → List all containers
- `docker stop <container>` → Stop container
- `docker rm <container>` → Remove container
- `docker exec -it <container> bash` → Enter running container
- `docker logs <container>` → View container logs

## Image Commands
- `docker build -t myapp:v1 .` → Build image from Dockerfile
- `docker images` → List images
- `docker pull nginx` → Pull image from Docker Hub
- `docker push <username>/myapp:v1` → Push image to Docker Hub
- `docker tag myapp:v1 <username>/myapp:v1` → Tag image
- `docker rmi <image>` → Remove image

## Volume Commands
- `docker volume create mydata` → Create named volume
- `docker volume ls` → List volumes
- `docker volume inspect mydata` → Inspect volume details
- `docker volume rm mydata` → Remove volume

## Network Commands
- `docker network create mynet` → Create custom network
- `docker network ls` → List networks
- `docker network inspect mynet` → Inspect network
- `docker network connect mynet <container>` → Connect container to network

## Compose Commands
- `docker compose up -d` → Start services in background
- `docker compose down` → Stop and remove services
- `docker compose ps` → List compose services
- `docker compose logs -f` → Follow logs
- `docker compose build` → Build services

## Cleanup Commands
- `docker system df` → Check Docker disk usage
- `docker system prune -f` → Remove unused containers, networks, cache
- `docker image prune -a -f` → Remove unused images
- `docker volume prune -f` → Remove unused volumes

## Dockerfile Instructions
- `FROM` → Base image
- `RUN` → Execute command during build
- `COPY` → Copy files into image
- `WORKDIR` → Set working directory
- `EXPOSE` → Document container port
- `CMD` → Default command
- `ENTRYPOINT` → Fix
