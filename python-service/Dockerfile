FROM python:3.12-slim

WORKDIR /app

COPY python-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY agent ./agent
COPY rag ./rag
COPY python-service ./python-service

EXPOSE 5000

CMD ["python", "python-service/app.py"]
