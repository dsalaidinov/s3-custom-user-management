# Custom S3 Management Service

## Overview
Welcome to the Custom S3 Management Service, a comprehensive solution for managing S3-compatible systems and user access. This project is divided into two main parts:
- **Backend API**: For managing users, S3 systems, and performing various S3-related operations.
- **Frontend Interface**: A user-friendly web interface for managing S3 buckets, users, and policies.

## Table of Contents
- [System Architecture](#system-architecture)
- [Backend API](#backend-api)
- [Frontend Interface](#frontend-interface)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Conclusion](#conclusion)

## System Architecture
The application consists of two main components:

- **Backend API**: Runs on a specified IP and port, handling user management and S3 operations.
- **Frontend Interface**: Developed with React, communicates with the backend to provide an intuitive interface for managing S3 resources.

## Backend API
For detailed information about the backend API, including endpoints and usage instructions, please refer to the [Backend README](backend/README.md).

## Frontend Interface
For detailed information about the frontend interface, including installation and configuration instructions, please refer to the [Frontend README](s3-browser/README.md).

## Installation
### Prerequisites
- Node.js and npm installed
- Running Minio Server on the same subnet as the application
- Nginx (for production) with proper configuration

### Steps
1. Clone the repository.
    ```sh
    git clone https://github.com/yourusername/yourrepository.git
    cd yourrepository
    ```
2. Install dependencies for both backend and frontend.
    ```sh
    cd backend
    npm install
    cd ../s3-browser
    npm install
    ```

## Configuration
### Backend
Create a `.env` file in the `backend` directory with the following contents:
```sh
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_pass
JWT_SECRET=your_jwt_secret
```

### Frontend
Create a `.env` file in the `s3-browser` directory with the following contents:
```sh
S3_API=192.168.0.61
USE_SSL=false
S3_API_PORT=9000
PORT=3000
```

## Running the Application
### Development Mode
To run the backend:
```sh
cd backend
npm run start
```
To run the frontend:
```sh
cd s3-browser
npm run start
```

### Production Mode
1. Build the frontend application:
    ```sh
    cd s3-browser
    npm run build
    ```
2. Copy the contents of the `build` directory to your Nginx static file directory.
3. Configure Nginx to proxy requests to the Minio REST API.
4. Start or reload Nginx.

## Troubleshooting
- Ensure Minio Server and the application are on the same subnet.
- Verify Nginx configuration for proxying the Minio REST API.
- Check environment variables in the `.env` files.

## Conclusion
This documentation provides a comprehensive guide for setting up and using the Custom S3 Management Service. With this service, you can efficiently manage your S3 buckets, users, and policies, making your S3 server administration smoother. For more detailed information, refer to the individual README files for the backend and frontend.
