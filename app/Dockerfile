FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN apt-get update && apt-get upgrade -y && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /var/lib/apt/lists/*

ENV SECRET_KEY=mysecret123

EXPOSE 5000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]