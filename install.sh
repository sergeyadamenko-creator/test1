#!/bin/bash

# Script for installing and setting up the B1 ID Portal

set -e  # Exit immediately if a command exits with a non-zero status

echo "B1 ID Portal Installation Script"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm and try again."
    exit 1
fi

# Clone the repository
REPO_URL="${1:-https://github.com/your-repo/b1-id-portal.git}"
TARGET_DIR="${2:-b1-portal}"

echo "Cloning repository from $REPO_URL to $TARGET_DIR..."
git clone "$REPO_URL" "$TARGET_DIR"

# Navigate to the project directory
cd "$TARGET_DIR"

# Install dependencies
echo "Installing frontend and backend dependencies..."
npm install

# Create a default .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating default .env file..."
    cat << EOF > .env
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_REALM=your-realm-name
PORT=3000
EOF
    echo "Created default .env file. Please update it with your actual configuration."
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Provide instructions for starting the application
echo ""
echo "Installation completed successfully!"
echo ""
echo "To start the application:"
echo "1. Update the .env file with your Keycloak configuration"
echo "2. Run 'npm start' to start the server"
echo ""
echo "For development mode:"
echo "1. Run 'npm run dev' in one terminal for the frontend"
echo "2. Run 'node server.js' in another terminal for the backend"
echo ""