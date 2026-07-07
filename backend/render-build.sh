#!/usr/bin/env bash
# Install Node dependencies
npm install

# Generate Prisma Database Client
npx prisma generate

# Set up Python virtual environment and install ML packages
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r ml-engine/requirements.txt