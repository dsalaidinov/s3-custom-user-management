import { Request, Response } from "express";
import AWS from "@aws-sdk/client-s3";
import { Client as MinioClient } from "minio";
import S3System, { S3SystemType } from "../models/s3systems";
import AccessPolicy from "../models/access-policy";
import { Permissions } from "../interface/permissions";
import { S3Client } from "../config/s3client";


/**
 * @swagger
 * /api/buckets/create:
 *   post:
 *     summary: Create a new bucket.
 *     tags:
 *       - Buckets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bucketName:
 *                 type: string
 *               s3System:
 *                 type: string
 *             required:
 *               - bucketName
 *               - s3System
 *     responses:
 *       201:
 *         description: Bucket created successfully.
 *       400:
 *         description: Bad Request. S3System settings not available for this type.
 *       500:
 *         description: Internal Server Error.
 */
export const createBucket = async (req: Request, res: Response) => {
  try {
    const { bucketName, s3System } = req.body;

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({
        message: "There are no S3System settings available for this type",
      });
    }

    let s3;

    const params = {
      Bucket: bucketName,
    };

    if (existingS3System.type === S3SystemType.AmazonS3) {
      s3 = new AWS.S3({
        credentials: {
          accessKeyId: existingS3System.accessKey,
          secretAccessKey: existingS3System.secretKey,
        },
        region: existingS3System.region,
      });
      await s3.createBucket(params).promise();
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      s3 = new MinioClient({
        useSSL: existingS3System.useSSL,
        endPoint: existingS3System.endpoint,
        accessKey: existingS3System.accessKey,
        secretKey: existingS3System.secretKey,
      });
      await s3.makeBucket(`${bucketName.toLowerCase()}`);
    }

    res.status(201).json({ message: "Bucket created" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Error creating bucket: ${error.message}` });
  }
};

/**
 * @swagger
 * /api/buckets/list:
 *   get:
 *     summary: Get a list of buckets.
 *     tags:
 *       - Buckets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: s3System
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of buckets.
 *       400:
 *         description: Bad Request. S3System settings not available for this type.
 *       500:
 *         description: Internal Server Error.
 */ 
export const getBuckets = async (req: Request, res: Response) => {
  try {
    const { s3System } = req.query;

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({
        message: "There are no S3System settings available for this type",
      });
    }

    let s3, buckets;

    if (existingS3System.type === S3SystemType.AmazonS3) {
      s3 = new AWS.S3({
        credentials: {
          accessKeyId: existingS3System.accessKey,
          secretAccessKey: existingS3System.secretKey,
        },
        region: existingS3System.region,
      });

      buckets = await s3.listBuckets().promise();
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      s3 = new MinioClient({
        useSSL: existingS3System.useSSL,
        endPoint: existingS3System.endpoint,
        accessKey: existingS3System.accessKey,
        secretKey: existingS3System.secretKey,
      });

      buckets = await s3.listBuckets();
    }

    return res.status(200).json(buckets);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch resources" });
  }
};

/**
 * @swagger
 * /api/buckets/list-by-user:
 *   get:
 *     summary: Get a list of buckets accessible by the user.
 *     tags:
 *       - Buckets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: s3System
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of accessible buckets.
 *       400:
 *         description: Bad Request. S3System settings not available for this type.
 *       403:
 *         description: Forbidden. Access denied.
 *       500:
 *         description: Internal Server Error.
 */
export const getBucketsByUser = async (req: Request, res: Response) => {
  try {
    const { s3System } = req.query;
    const user = req.user;

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({
        message: "There are no S3System settings available for this type",
      });
    }

    let s3, buckets;

    if (existingS3System.type === S3SystemType.AmazonS3) {
      s3 = new AWS.S3({
        credentials: {
          accessKeyId: existingS3System.accessKey,
          secretAccessKey: existingS3System.secretKey,
        },
        region: existingS3System.region,
      });

      buckets = await s3.listBuckets().promise();
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      s3 = new MinioClient({
        useSSL: existingS3System.useSSL,
        endPoint: existingS3System.endpoint,
        accessKey: existingS3System.accessKey,
        secretKey: existingS3System.secretKey,
      });

      buckets = await s3.listBuckets();

      if (user?.role === "admin") {
        return res.status(200).json(buckets);
      }
    }

    const accessPolicies = await AccessPolicy.find({
      s3System: s3System,
      user: user._id,
    });

    const filteredBuckets = [];

    for (const bucket of buckets) {
      const hasReadPermission = accessPolicies.some((policy) => {
        return (
          policy.resourceName === bucket.name &&
          (policy?.permissions === Permissions.READ ||
            policy?.permissions === Permissions.READ_WRITE)
        );
      });

      if (hasReadPermission) {
        filteredBuckets.push(bucket);
      }
    }
    return res.status(200).json(filteredBuckets);
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ error: "Failed to fetch resources: " + error.message });
  }
};

/**
 * @swagger
 * /api/buckets/list-objects-by-user:
 *   get:
 *     summary: Get a list of objects in a bucket accessible by the user.
 *     tags:
 *       - Buckets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: s3System
 *         schema:
 *           type: string
 *       - in: query
 *         name: bucketName
 *         schema:
 *           type: string
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of accessible objects in the bucket.
 *       400:
 *         description: Bad Request. S3System settings not available for this type.
 *       403:
 *         description: Forbidden. Access denied.
 *       500:
 *         description: Internal Server Error.
 */
export const getObjectsInBucketByUser = async (req: Request, res: Response) => {
  try {
    const { s3System, bucketName, prefix } = req.query;
    console.log(s3System);
    const user = req.user;

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({
        message: "There are no S3System settings available for this type",
      });
    }

    let s3 = S3Client(existingS3System);

    const accessPolicies = await AccessPolicy.find({
      s3System: s3System,
      user: user._id,
    });

    let filteredObjects = [];

    if (existingS3System.type === S3SystemType.AmazonS3) {
      filteredObjects = await s3?.listObjectsV2({ Bucket: bucketName });
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      const objectStream = s3.listObjectsV2(bucketName, prefix);

      objectStream.on("data", (object) => {
        if (user?.role === "admin") {
          filteredObjects.push(object);
        } else {
          const isAccessibleForAllObjects = accessPolicies.some((policy) => {
            return (
              policy.resourceName === bucketName &&
              (policy?.permissions === Permissions.READ_WRITE ||
                policy.permissions === Permissions.READ) &&
              policy.path === "*"
            );
          });

          if (isAccessibleForAllObjects) {
            filteredObjects.push(object);
            return;
          }

          const isAccessible = accessPolicies.some((policy) => {
            return (
              policy.resourceName === bucketName &&
              (policy.permissions === Permissions.READ_WRITE ||
                policy.permissions === Permissions.READ) &&
              ((policy.path !== "*" && object.name?.startsWith(policy.path)) ||
                object.prefix?.startsWith(policy.path))
            );
          });

          if (isAccessible) {
            filteredObjects.push(object);
          }
        }
      });

      objectStream.on("end", () => {
        console.log("filteredObjects", filteredObjects);
        return res.status(200).json(filteredObjects);
      });

      objectStream.on("error", (error) => {
        console.error("Error reading objects:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch resources " + error.message });
      });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch resources " + error.message });
  }
};

/**
 * @swagger
 * /api/buckets/download:
 *   get:
 *     summary: Download an object from a bucket.
 *     tags:
 *       - Buckets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: s3System
 *         schema:
 *           type: string
 *       - in: query
 *         name: bucketName
 *         schema:
 *           type: string
 *       - in: query
 *         name: objectKey
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Object downloaded successfully.
 *       400:
 *         description: Bad Request. S3System settings not available for this type.
 *       403:
 *         description: Forbidden. Access denied.
 *       500:
 *         description: Internal Server Error.
 */
export const downloadObject = async (req: Request, res: Response) => {
  try {
    const { s3System, bucketName, objectKey } = req.query as {
      s3System: string;
      bucketName: string;
      objectKey: string;
    };

    const user = req.user;

    if (user?.role !== "admin") {
      const accessPolicies = await AccessPolicy.find({
        s3System: s3System,
        user: user._id,
      });

      const isAccessible = accessPolicies.some((policy) => {
        return (
          policy.resourceName === bucketName &&
          (policy.permissions === Permissions.READ_WRITE ||
            policy.permissions === Permissions.READ) &&
          (policy.path === "*" || objectKey.startsWith(policy.path))
        );
      });

      if (!isAccessible) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({
        message: "There are no S3System settings available for this type",
      });
    }

    let s3 = S3Client(existingS3System);

    if (existingS3System.type === S3SystemType.AmazonS3) {
      const params = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const data = await s3.getObject(params).promise();

      res.attachment(objectKey);
      res.send(data.Body);
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      s3.fGetObject(bucketName, objectKey, objectKey, (err: any) => {
        if (err) {
          console.error("Error downloading object:", err);
          return res.status(500).json({ error: "Failed to download object" });
        }

        res.attachment(objectKey);
        res.download(objectKey);
      });
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch resources " + error.message });
  }
};

/**
 * @swagger
 * /api/buckets/upload:
 *   post:
 *     summary: Upload an object to a bucket.
 *     tags:
 *       - Buckets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               s3System:
 *                 type: string
 *               bucketName:
 *                 type: string
 *               prefix:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - s3System
 *               - bucketName
 *               - file
 *     responses:
 *        200:
 *          description: File uploaded successfully.
 *        400:
 *          description: Bad Request. S3System settings not available for this type.
 *        500:
 *          description: Internal Server Error.
 */
export const uploadObject = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const { s3System, bucketName, prefix } = req.body;
    const { originalname, path, mimetype } = req.file;

    const existingS3System = await S3System.findOne({ _id: s3System });
    if (!existingS3System) {
      return res.status(400).json({
        message: "There are no S3System settings available for this type",
      });
    }

    let s3;

    if (existingS3System.type === S3SystemType.AmazonS3) {
      s3 = new AWS.S3({
        credentials: {
          accessKeyId: existingS3System.accessKey,
          secretAccessKey: existingS3System.secretKey,
        },
        region: existingS3System.region,
      });
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      s3 = new MinioClient({
        useSSL: existingS3System.useSSL,
        endPoint: existingS3System.endpoint,
        accessKey: existingS3System.accessKey,
        secretKey: existingS3System.secretKey,
        partSize: 1024 * 1024 * 64,
      });
    }

    await s3.putObject(
      bucketName,
      `${prefix ? prefix : ""}${originalname}`,
      require("fs").createReadStream(path),
      "application/octet-stream"
    );

    require("fs").unlinkSync(path);

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload the file" });
  }
};

/**
 * @swagger
 * /api/buckets/preview:
 *   get:
 *     summary: Preview an object from a bucket.
 *     tags:
 *       - Buckets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: s3System
 *         schema:
 *           type: string
 *       - in: query
 *         name: bucketName
 *         schema:
 *           type: string
 *       - in: query
 *         name: objectKey
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Object previewed successfully.
 *       400:
 *         description: Bad Request. S3System settings not available for this type.
 *       403:
 *         description: Forbidden. Access denied.
 *       500:
 *         description: Internal Server Error.
 */
export const previewObject = async (req: Request, res: Response) => {
  try {
    const { s3System, bucketName, objectKey } = req.query as {
      s3System: string;
      bucketName: string;
      objectKey: string;
    };

    const user = req.user;

    if (user?.role !== "admin") {
      const accessPolicies = await AccessPolicy.find({
        s3System: s3System,
        user: user._id,
      });

      const isAccessible = accessPolicies.some((policy) => {
        return (
          policy.resourceName === bucketName &&
          (policy.permissions === Permissions.READ_WRITE ||
            policy.permissions === Permissions.READ) &&
          (policy.path === "*" || objectKey.startsWith(policy.path))
        );
      });

      if (!isAccessible) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({
        message: "There are no S3System settings available for this type",
      });
    }

    let s3 = S3Client(existingS3System);

    if (existingS3System.type === S3SystemType.AmazonS3) {
      const params = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const data = await s3.getObject(params).promise();

      res.status(200).json({ data: data.Body.toString("base64") });
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      const objectStream = await s3.getObject(
        bucketName,
        objectKey,
        function (err, dataStream) {
          if (err) {
            console.log("err", err);
            return res.status(500).json({ error: "Failed to preview object" });
          }
          const chunks = [];
          let fileSize = 0;

          dataStream.on("data", function (chunk) {
            chunks.push(chunk);
            fileSize += chunk.length;
          });
          dataStream.on("end", () => {
            console.log("Finished streaming object");
            res.setHeader('Content-Length', fileSize);
            res.status(200).json(chunks);
            res.end();
          });

          dataStream.on("error", (error) => {
            console.error("Error streaming object:", error);
            res.status(500).json({ error: "Failed to stream object" });
          });

          dataStream.on("close", () => {
            console.log("Closed object stream");
          });
        }
      );
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch resources " + error.message });
  }
};
