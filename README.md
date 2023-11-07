# Custom S3 Manager

Welcome to the Custom S3 Manager documentation. This application, developed with React, PrimeReact UI, Tailwind CSS, Minio JavaScript SDK, and Chonky File Browser Component, allows you to efficiently manage your Server. You can handle tasks such as managing S3 buckets, users, and policies with a user-friendly interface.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Usage](#usage)
7. [Troubleshooting](#troubleshooting)
8. [Conclusion](#conclusion)

# System Architecture

The application interacts with a Server operating on two ports:
1. Port 9000 hosts the S3 API for bucket management.
2. Port 9001 hosts the Minio REST API for user and policy management.

To connect to the S3 API, the application utilizes the `minio-js` library with the following connection parameters:

```javascript
const mc = new minio.Client({
    endPoint: env.S3_API,
    useSSL: env.USE_SSL,
    port: env.S3_API_PORT,
    accessKey: accessKey,
    secretKey: secretKey
});
```
To connect to both the S3 API and Minio REST API, you must set accessKey and secretKey after authentication. The Minio REST API is proxied through Nginx to handle CORS issues. In a production environment, static files are served via Nginx.

# Prerequisites
Before running the application, ensure that you have the following prerequisites:

Node.js and npm installed.
A running Minio Server on the same subnet as the application.
Nginx (for production) with proper configuration.

## Installation
Follow these steps to install the application:

Clone the application's source code from the repository.

Navigate to the application's root directory in your terminal.

Run the following command to install the required dependencies:
```
npm install
```

## Configuration
Before running the application, you need to configure some settings:
Create a .env file in the project's root directory. Define the Minio Server's IP address and other relevant settings:

```
S3_API=192.168.0.61 (Minio Server's IP address)
USE_SSL=false (Set to true if using SSL)
S3_API_PORT=9000 (Minio Server's port)
PORT=3000 (Local development port)
```

In the **package.json** file, add a proxy configuration to handle the Minio REST API through Nginx. Replace 192.168.0.61 with the appropriate Minio Server IP address:
```
"proxy": "http://192.168.0.61"
```
## Running the Application
You can run the application in development or production mode:

## Development Mode
To run the application locally for development, use the following command:
```
npm run start
```
The application will be accessible at http://localhost:3000.

## Production Mode
For production deployment, follow these steps:
Build the application:
```
npm run build
```

1. Copy the contents of the build directory to your Nginx static file directory (usually located in /var/www/html).
2. Configure Nginx to proxy requests to the Minio REST API by adding appropriate location blocks.
3. Start or reload Nginx for the changes to take effect.

## Usage
The application offers the following functionalities:
1. S3 Bucket Management: Create, delete, upload, download, create folders, and delete files.
2. User Management.
3. Policy Management.

## Troubleshooting
If you encounter issues, consider the following:
Ensure Minio Server and the application are on the same subnet.
Verify the Nginx configuration for proxying the Minio REST API.
Check the environment variables in the .env file.

## Conclusion
This documentation provides a detailed guide for setting up and using the Minio S3 Manager application. With this application, you can efficiently manage your S3 buckets, users, and policies, making your Minio Server administration smoother. If you encounter any difficulties, consult the troubleshooting section or reach out to the application's support team for assistance.
