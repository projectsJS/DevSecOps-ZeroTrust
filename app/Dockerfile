FROM node:20 AS frontend-build

WORKDIR /workspace

COPY frontend ./frontend
COPY app ./app

RUN npm ci --prefix frontend
RUN npm run build --prefix frontend


FROM python:3.11-slim

WORKDIR /app

COPY app/requirements.txt ./requirements.txt

RUN apt-get update && apt-get upgrade -y && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /var/lib/apt/lists/*

COPY app ./
COPY --from=frontend-build /workspace/app/static ./static

EXPOSE 5000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]