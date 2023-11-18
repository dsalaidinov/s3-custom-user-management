# S3 User Management Backend API ###
This is the backend API for managing users and their access to Amazon S3 or S3 Compatible systems. The API provides endpoints for user creation, listing users, creating and managing S3 systems, assigning access policies, and performing various S3-related operations.

For more detailed information about the API endpoints and usage, please refer to the http://IP:PORT/api-docs/.

## Table of Contents ##
* Endpoints
  * Create User
  * List Users
  * Create S3 System
  * List S3 Systems
  * Update S3 System
  * Get S3 Systems by User
  * Assign Access
  * Get Assignments
  * Create Bucket
  * Get Buckets
  * Get Buckets by User
  * Get Objects in Bucket by User
  * Download Object
  * Upload Object
  * Preview Object

## Endpoints
### Create User ###
  * Endpoint: POST /api/users/create
  * Description: Create a new user.
  * Parameters:
    * username (string): The username of the new user.
    * password (string): The password for the new user.
  * Response: JSON representation of the created user.

### List Users ###
  * Endpoint: GET /api/users/list
  * Description: Get a list of all users.
  * Response: JSON array of user objects.

### Create S3 System ###
  * Endpoint: POST /api/s3systems/create
  * Description: Create a new S3 system.
  * Parameters:
    * name (string): The name of the new S3 system.
    * type (string, enum): The type of the S3 system (AmazonS3 or S3Compatible).
    * accessKey (string): The access key for the S3 system.
    * secretKey (string): The secret key for the S3 system.
    * region (string, optional): The region of the S3 system.
    * endpoint (string, optional): The endpoint of the S3 system.
    * port (string, optional): The port of the S3 system.
    * useSSL (boolean, optional): Whether to use SSL for the S3 system.
  * Response: JSON representation of the created S3 system.

### List S3 Systems
  * Endpoint: GET /api/s3systems/list
  * Description: Get a list of all S3 systems.
  * Response: JSON array of S3 system objects.

### Update S3 System
  * Endpoint: PUT /api/s3systems/update/:id
  * Description: Update an existing S3 system.
  * Parameters:
    * id (string): The ID of the S3 system to update.
    * (Any fields to be updated in the request body)
  * Response: JSON representation of the updated S3 system.

### Get S3 Systems by User
  * Endpoint: GET /api/s3systems/list-system-by-user
  * Description: Get a list of S3 systems accessible by the authenticated user.
  * Security: Requires a valid JWT token.
  * Response: JSON array of accessible S3 system objects.

### Assign Access
  * Endpoint: POST /api/policies/assign
  * Description: Assign access to a user for a specific S3 system.
  * Parameters:
    * userId (string): The ID of the user.
    * s3SystemId (string): The ID of the S3 system.
    * resourceName (string): The name of the resource.
    * path (string): The path to the resource.
    * resourceType (string, enum): The type of the resource.
    * permissions (string, enum): The permissions to assign.
  * Security: Requires a valid JWT token.
  * Response: JSON representation of the assigned access policy.

### Get Assignments
  * Endpoint: GET /api/policies/assignments
  * Description: Get a list of all access policy assignments.
  * Security: Requires a valid JWT token.
  * Response: JSON array of access policy objects.

### Create Bucket
 * Endpoint: POST /api/buckets/create
 * Description: Create a new bucket in an S3 system.
 * Parameters:
   * bucketName (string): The name of the new bucket.
   * s3System (string): The ID of the S3 system.
 * Security: Requires a valid JWT token.
 * Response: JSON representation of the created bucket.

### Get Buckets
 * Endpoint: GET /api/buckets/list
 * Description: Get a list of all buckets in an S3 system.
 * Parameters:
   * s3System (string): The ID of the S3 system.
 * Security: Requires a valid JWT token.
 * Response: JSON array of bucket objects.

### Get Buckets by User
 * Endpoint: GET /api/buckets/list-by-user
 * Description: Get a list of buckets accessible by the authenticated user.
 * Parameters:
   * s3System (string): The ID of the S3 system.
   * Security: Requires a valid JWT token.
 * Response: JSON array of accessible bucket objects.
### Get Objects in Bucket by User
 * Endpoint: GET /api/buckets/list-objects-by-user
 * Description: Get a list of objects in a bucket accessible by the authenticated user.
 * Parameters:
   * s3System (string): The ID of the S3 system.
   * bucketName (string): The name of the bucket.
   * prefix (string, optional): The prefix to filter objects.
 * Security: Requires a valid JWT token.
 * Response: JSON array of accessible object objects.
### Download Object
 * Endpoint: GET /api/buckets/download
 * Description: Download an object from a bucket.
 * Parameters:
   * s3System (string): The ID of the S3 system.
   * bucketName (string): The name of the bucket.
   * objectKey (string): The key of the object to download.
 * Security: Requires a valid JWT token.
 * Response: Download of the object.
### Upload Object
 * Endpoint: POST /api/buckets/upload
 * Description: Upload an object to a bucket.
 * Parameters:
   * s3System (string): The ID of the S3 system.
   * bucketName (string): The name of the bucket.
   * prefix (string, optional): The prefix for the object.
 * Security: Requires a valid JWT token and a file upload.
 * Response: JSON message indicating successful upload.
### Preview Object
 * Endpoint: GET /api/buckets/preview
 * Description: Preview an object from a bucket.
 * Parameters:
   * s3System (string): The ID of the S3 system.
   * bucketName (string): The name of the bucket.
   * objectKey (string): The key of the object to preview.
 * Security: Requires a valid JWT token.
 * Response: JSON representation or download link for the object preview.

