docker run hello-world
docker run -itd ubuntu
docker ps
docker ps -a
docker create nginx
docker exec -it <container_id> /bin/bash
docker exec <container_id> ls /
docker logs -f <container_id>
docker inspect <container_id>
docker images
docker image history nginx
docker system df
docker rm <container_id>
docker rmi <image_id>
  
Created containers using docker run and docker create.

Listed running and stopped containers using docker ps and docker ps -a.

Entered a running container using docker exec -it <container_id> /bin/bash.

Explored the container filesystem using Linux commands like ls and pwd.

Ran single commands inside a container without entering it using docker exec.

Viewed container logs in real time using docker logs -f.

Inspected container details such as IP address, ports, and mounts using docker inspect.

Checked Docker disk usage using docker system df.

Learned how Docker images are built using layers and viewed them using docker image history.
