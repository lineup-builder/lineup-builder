#!/bin/bash

# Navigate to the project directory
cd /Users/xander/Developer/lineup-builder

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: React lineup builder application"

# Add remote origin (you'll need to create this repository on GitHub first)
git remote add origin https://github.com/xanderbakx/lineup-builder.git

# Push to main branch
git push -u origin main

echo "Git setup complete!"
echo "Note: Make sure you've created the repository 'lineup-builder' on GitHub under your account first."
