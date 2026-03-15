<<<<<<< HEAD

FROM python:3.9-slim

# Working directory

WORKDIR /app

# Copy src code to container

COPY . .

# Run the build commands

RUN pip install -r requirements.txt

# expose port 80

EXPOSE 80

# serve the app / run the app (keep it running)

CMD ["python","run.py"]
=======
FROM nginx:apline
COPY index.hmtl /usr/share/nginx/html/
EXPOSE 80
>>>>>>> 469d152 (feat:newdir)
