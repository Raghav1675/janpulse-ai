#!/usr/bin/env bash
# Install Node dependencies
npm install

# Generate Prisma Database Client
npx prisma generate
