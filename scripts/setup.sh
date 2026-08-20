#!/bin/bash
# SkillForge - Hackathon Setup Script
# Fulfills the "Linux + Shell Scripting" requirement

echo "======================================"
echo "🚀 Initializing SkillForge Environment"
echo "======================================"

echo "1. Checking directory structure..."
if [ ! -d "python-service" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Must be run from the root of the repository."
    exit 1
fi

echo "2. Setting up Python virtual environment..."
cd python-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "3. Ready to launch!"
echo "Run 'docker-compose up --build' to start all microservices."
echo "======================================"
