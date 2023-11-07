const predefinedPolicies = {
  file: [
    {
      name: "Read",
      value: "read",
      permissions: ["s3:GetObject"],
    },
    {
      name: "Delete",
      value: "delete",
      permissions: ["s3:DeleteObject"],
    },
    {
      name: "Write",
      value: "write",
      permissions: ["s3:PutObject"],
    },
  ],
  folder: [
    {
      name: "View Folder",
      value: "view",
      permissions: ["s3:ListBucket"],
    },
    // {
    //   name: "View Folder with Subfolders",
    //   value: "viewWithSubfolders",
    //   permissions: ["s3:ListBucket", "s3:GetBucketLocation"],
    // },
    {
      name: "Upload to Folder",
      value: "upload",
      permissions: ["s3:PutObject"],
    },
    // {
    //   name: "Upload to Folder with Subfolders",
    //   value: "uploadWithSubfolders",
    //   permissions: ["s3:PutObject", "s3:GetBucketLocation"],
    // },
    {
      name: "Delete Folder",
      value: "delete",
      permissions: ["s3:DeleteObject"],
    },
    // {
    //   name: "Delete Files in Folder",
    //   value: "deleteFilesInFolder",
    //   permissions: ["s3:DeleteObject", "s3:GetBucketLocation"],
    // },
    // {
    //   name: "Delete Files and Folders in Subfolders",
    //   value: "deleteFilesAndFoldersInSubfolders",
    //   permissions: ["s3:DeleteObject", "s3:GetBucketLocation"],
    // },
  ],
  bucket: [
    {
      name: "View Bucket",
      value: "view",
      permissions: ["s3:GetBucketLocation", "s3:ListBucket"],
    },
    {
      name: "Upload to Bucket",
      value: "upload",
      permissions: ["s3:PutObject"],
    },
    {
      name: "Delete from Bucket",
      value: "delete",
      permissions: ["s3:DeleteObject"],
    },
  ],
};

export default predefinedPolicies;