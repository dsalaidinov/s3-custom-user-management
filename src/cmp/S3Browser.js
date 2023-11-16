import {
  ChonkyActions,
  ChonkyIconName,
  FileList,
  FileNavbar,
  FileToolbar,
  FullFileBrowser,
  setChonkyDefaults,
} from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import path from "path";
import env from "react-dotenv";
import { Toast } from "primereact/toast";
import { ProgressBar } from 'primereact/progressbar';

import useToast from "../cmp/useToast";
import React, { useCallback, useEffect, useState } from "react";
import mc from "../util/mc";
import { downloadFile } from "../util/util";
import UploadFile from "./UploadFile";
import NewPolicy from "./NewPolicy";
import { getUserPermissions } from "./permissions";
import FileDetailsDialog from './FileDetailsDialog';
import axiosClient from "../util/axiosClient";

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const user = JSON.parse(localStorage.getItem('user'))?.user;
const isAdmin = user.role === "admin";
const FOLDER_PREFIX = "";

// const fetchS3BucketContents = (bucket, prefix) => {
//   return new Promise(async (resolve, reject) => {
//     const files = [];

//     try {
//       const userPermissions = await getUserPermissions();

//       mc?.listObjects(bucket, prefix, false)
//         .on("data", (obj) => {
//           console.log(obj)
//           const isDir = obj?.name?.endsWith("/") || obj?.prefix?.endsWith("/");
//           const name = isDir
//             ? obj?.prefix
//               ? obj?.prefix?.slice(0, -1)
//               : obj?.name?.slice(0, -1)
//             : obj?.name;
//           const id = isDir
//             ? `${obj?.prefix ? obj?.prefix : obj?.name}`
//             : path?.join(prefix, name);

//           let formattedName;

//           if (isDir && !prefix) {
//             const formattedName = obj?.prefix
//               ? obj?.prefix?.slice(0, obj?.prefix.length - 1)
//               : obj?.name?.slice(0, obj?.name.length - 1);
//             files.push({ id, name: formattedName, isDir: true });
//           } else if (isDir && prefix) {
//             const formattedName = obj?.prefix
//               ? obj?.prefix?.slice(prefix.length, obj?.prefix.length - 1)
//               : obj?.name?.slice(0, obj?.name.length - 1);

//             if (prefix !== obj?.name) {
//               files.push({ id, name: formattedName, isDir: true });
//             }
//           } else if (!isDir && prefix) {
//             if (name?.includes("/")) {
//               const formattedName = obj?.name?.slice(prefix.length);
//               files.push({ id, name: formattedName, isDir: false, size: obj.size, lastModified: `${new Date(obj.lastModified).toLocaleString()}` });
//             }
//           } else if (!isDir && !prefix) {
//             const formattedName = path?.basename(name);            
//             files.push({ id, name: formattedName, isDir: false, size: obj.size, lastModified: `${new Date(obj.lastModified).toLocaleString()}` });
//           }
//         })
//         .on("end", () => {
//           const filteredObjects = files.filter((object) => {
//             if (userPermissions?.permissions["arn:aws:s3:::*"]) {
//               return object;
//             } else {
//               if (object.id !== undefined) {
//                 const objectArn = `arn:aws:s3:::${bucket}/${
//                   object.isDir ? object.id : object.id.slice(prefix.length)
//                 }`;
//                 const bucketArn = `arn:aws:s3:::${bucket}`;

//                 const objectPermissions =
//                   (userPermissions.permissions.hasOwnProperty(objectArn) &&
//                     userPermissions.permissions[objectArn]) ||
//                   [];
//                 const isFolder = object.isDir;
//                 if (isFolder) {
//                   const hasAccessToFolder = userPermissions["allowResources"]
//                     ? userPermissions["allowResources"]?.some((resource) => {
//                         const checkResource = resource.prefixes.filter(
//                           (res) => res === object.id
//                         );

//                         if (checkResource) {
//                           return object.isDir
//                             ? object.id.startsWith(
//                                 resource.prefixes.filter(
//                                   (res) => res === object.id
//                                 )[0]
//                               )
//                             : object.name.startsWith(
//                                 resource.prefixes.filter(
//                                   (res) => res === object.name
//                                 )
//                               );
//                         } else {
//                           return false;
//                         }
//                       })
//                     : userPermissions.permissions[bucketArn].includes(
//                         "s3:ListBucket"
//                       )
//                     ? true
//                     : false;

//                   if (!hasAccessToFolder) {
//                     return false;
//                   }

//                   return object;
//                 } else {
//                   const hasAccessToFile =
//                     objectPermissions.includes("s3:GetObject");

//                     if (!hasAccessToFile) {
//                     return false;
//                   }
//                   return true;
//                 }
//               }
//             }
//           });

//           resolve(filteredObjects);
//         })
//         .on("error", (err) => reject(err));
//     } catch (error) {
//       console.error("Error listing objects with permissions:", error);
//       return [];
//     }
//     // }
//   });
// };

const fetchS3BucketContents = async (bucket, prefix) => {
  try {
    const systemId = isAdmin ? localStorage.getItem("s3system") : user.s3systems;
    const response = await axiosClient.get(`/buckets/list-objects-by-user`, {
      params: {
        s3System: systemId,
        userId: user._id,
        bucketName: bucket,
        prefix: prefix || "",
      },
    });

    const filteredObjects = response.data || [];

    const filteredFiles = filteredObjects.reduce((files, object) => {
      const isDir = object?.name?.endsWith("/") || object?.prefix?.endsWith("/");
      const name = isDir
        ? object?.prefix
          ? object?.prefix?.slice(prefix.length, -1)
          : object?.name?.slice(prefix.length, -1)
        : object?.name;

      if (name !== "" && name !== ".") {
        const id = isDir
          ? `${prefix}${name}`
          : path?.join(prefix, name);

        if (!files.find((file) => file.id === id)) {
          let formattedName;

          if (isDir) {
            formattedName = name;
          } else {
            formattedName = path?.basename(name);
          }

          files.push({
            id,
            name: formattedName,
            isDir,
            size: object.size,
            lastModified: `${new Date(object.lastModified).toLocaleString()}`,
          });
        }
      }

      return files;
    }, []);

    return filteredFiles;
  } catch (error) {
    return [];
  }
};

const CreateFolderAction = {
  id: "create_folder",
  requiresSelection: false,
  button: {
    name: "Create Folder",
    toolbar: true,
    contextMenu: false,
    icon: ChonkyIconName.folderCreate,
  },
};

const SetPolicyAction = {
  id: "set_policy",
  requiresSelection: false,
  button: {
    name: "Set Policy",
    toolbar: true,
    contextMenu: false,
    // icon: ChonkyIconName.person,
  },
};

const RefreshObjectsAction = {
  id: "refresh_objects",
  requiresSelection: false,
  button: {
    name: "Refresh",
    toolbar: true,
    contextMenu: false,
    icon: ChonkyIconName.loading,
  },
};

const S3Browser = ({ bucketName }) => {
  const [error, setError] = useState(null);
  const [folderPrefix, setFolderPrefix] = useState(FOLDER_PREFIX);
  const [files, setFiles] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [policyDialogVisible, setPolicyDialogVisible] = useState(false);
  const [policyType, setPolicyType] = useState("");
  const [toast, showError, showSuccess] = useToast();
  const [isDetailsDialogVisible, setIsDetailsDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleModal = () => setOpened((o) => !o);

  const fetchTopLevelContents = async (bucket) => {
    try {
      const files = await fetchS3BucketContents(bucket, FOLDER_PREFIX);
      setFiles(files);
    } catch (error) {
      setError(error.message);
    }
  };

  let customActions = [
    RefreshObjectsAction,
    CreateFolderAction,
    ChonkyActions.DeleteFiles,
    ChonkyActions.UploadFiles,
    ChonkyActions.DownloadFiles,
  ];

  if (isAdmin) {
    customActions.push(SetPolicyAction);
  }

  const createFolder = async (folderName) => {
    const folderKey = folderPrefix
      ? `${folderPrefix}${folderName}/`
      : `${folderName}/`;
     

    mc.putObject(bucketName, folderKey, "", async (error, data) => {
      if (error) {
        console.log(error);
        showError(`Error creating folder: ${error?.message}`);
      } else {
        console.log("Folder created successfully!");
        fetchFolderContents(bucketName, folderPrefix);
      }
    });
  };

  const handleCreateFolderAction = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      createFolder(folderName);
    }
  };

  const handleDeleteObjectAction = async (object) => {
    try {
      await mc.removeObject(bucketName, object);
      const files = await fetchS3BucketContents(bucketName, folderPrefix);
      setFiles(files);
      showSuccess(`Successfully deleted ${object}`);
    } catch (err) {
      showError(`Error deleting! ${err?.message}`);
    }
  };

  useEffect(() => {
    setFolderPrefix("");
    fetchTopLevelContents(bucketName);
  }, [bucketName]);

  const fetchFolderContents = useCallback(async (bucket, prefix) => {
    try {
      setIsLoading(true);
      const files = await fetchS3BucketContents(bucket, prefix);
      setFiles(files);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  }, []);

  const folderChain = React.useMemo(() => {
    let folderChain;
    if (folderPrefix === "/") {
      folderChain = [];
    } else {
      let currentPrefix = "";
      folderChain = folderPrefix
        .replace(/\/*$/, "")
        .split("/")
        .map((prefixPart) => {
          currentPrefix = currentPrefix
            ? path.join(currentPrefix, prefixPart)
            : prefixPart;
          return {
            id: currentPrefix,
            name: prefixPart,
            isDir: true,
          };
        });
    }
    folderChain.unshift({
      id: "/",
      name: bucketName,
      isDir: true,
    });
    return folderChain;
  }, [folderPrefix, bucketName]);

  const handleDoubleClickFile = useCallback(
    async (data) => {
      if (data.payload?.file?.isDir) {
        const newPrefix = `${data.payload.file.id.replace(/\/*$/, "")}/`;
        try {
          setIsLoading(true);
          const newFiles = await fetchS3BucketContents(bucketName, newPrefix);
          setFiles(newFiles);
          setFolderPrefix(newPrefix);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          setError(error.message);
        }
      } else {
        const file = data.payload?.file;
        let { name, isDir, id } = file;
        const newId = `${folderPrefix}${name}`;
        if (isDir) return;
        const contentType = "application/octet-stream";
        const systemId = isAdmin ? localStorage.getItem("s3system") : user.s3systems;
        downloadFile(bucketName, folderPrefix ? newId : id, systemId, user._id, contentType);
      }
    },
    [setFolderPrefix, fetchFolderContents, bucketName, folderPrefix]
  );

  const openFileDetailsDialog = (file) => {
    setSelectedFile(file);
    setIsDetailsDialogVisible(true);
  };

  const closeFileDetailsDialog = () => {
    setSelectedFile(null);
    setIsDetailsDialogVisible(false);
  };

  const handleFileSelection = (selectedFile) => {
    console.log(selectedFile)
    if (selectedFile) {
      openFileDetailsDialog(selectedFile);
    } else {
      console.log("Display detailed information for non-image file:", selectedFile);
    }
  };

  const handleFileAction = useCallback(
    async (data) => {
      console.log("data file action", data);

      if(data.id === "mouse_click_file" && !data.payload?.file?.isDir) {
        handleFileSelection(data.payload?.file);
      }

      if (
        data.id === "open_parent_folder" ||
        data.payload?.targetFile?.name === bucketName
      ) {
        setFolderPrefix("");
        let files = await fetchS3BucketContents(bucketName, "");
        setFiles(files);
      } else if (data.id === "open_files" && data.payload?.targetFile?.isDir) {
        const newPrefix = `${data.payload?.targetFile.id.replace(/\/*$/, "")}/`;
        setFolderPrefix(newPrefix);
        let files = await fetchS3BucketContents(bucketName, newPrefix);
        setFiles(files);
      }
      if (data?.payload?.clickType === "double") {
        console.log("double click");
        handleDoubleClickFile(data);
      } else {
        if (data.id === ChonkyActions.OpenFiles.id) {
          if (data.payload.files && data.payload.files.length !== 1) return;
          if (!data.payload.targetFile || !data.payload.targetFile.isDir)
            return;

          const newPrefix = `${data.payload.targetFile.id.replace(
            /\/*$/,
            ""
          )}/`;
          setFolderPrefix(newPrefix);
        }
      }

      if (data.id === "download_files") {
        const file = data.state?.selectedFilesForAction[0];
        console.log(folderPrefix);
        let { name, isDir, id } = file;
        const newId = `${folderPrefix}${name}`;
        if (isDir) return;
        const contentType = "application/octet-stream";
        downloadFile(bucketName, folderPrefix ? newId : id, contentType);
      }

      if (data.id === "upload_files") {
        console.log(folderPrefix);
        setOpened(true);
      }

      if (data.id === "create_folder") {
        handleCreateFolderAction();
      }

      if (data.id === "refresh_objects") {
        const files = await fetchS3BucketContents(bucketName, folderPrefix);
        setFiles(files);
      }

      if (data.id === "delete_files") {
        const file = data.state?.selectedFilesForAction[0];
        const { isDir } = file;
        if (isDir) {
          handleDeleteObjectAction(file.id);
        } else {
          const id = file.id.slice(folderPrefix.length);
          handleDeleteObjectAction(id);
        }
      }

      if (data.id === "set_policy") {
        const file = data.state?.selectedFilesForAction[0];
        const { name, isDir } = file;

        if (isDir) {
          setPolicyType("folder");
        } else {
          setPolicyType("file");
        }

        const newId = `${folderPrefix}${name}`;
        const updatedFile = { ...file, id: newId };
        setSelectedFile(updatedFile);
        setPolicyDialogVisible(true);
      }
    },
    [setFolderPrefix, handleDoubleClickFile, folderPrefix, bucketName]
  );

  return (
    <>
      <Toast ref={toast} />
      <div className="story-wrapper">
        <div style={{ height: 400 }}>
          <UploadFile
            bucketName={bucketName}
            pathPrefix={folderPrefix}
            onRefresh={() => {
              toggleModal();
              fetchFolderContents(bucketName, folderPrefix);
            }}
            visible={opened}
            setOpened={setOpened}
          />

          <FullFileBrowser
            instanceId="AWS S3 Browser"
            files={files}
            folderChain={folderChain}
            onFileAction={handleFileAction}
            // onOpenFolder={handleOpenFolder}
            fileActions={customActions}
          >
            <FileNavbar />
            <FileToolbar />
            <FileList
              onFileAction={handleFileAction}
              onFileDoubleAction={handleDoubleClickFile}
            />
          </FullFileBrowser>
          {isLoading && 
          <div className="card">
            <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar>
          </div>
          }
          <FileDetailsDialog
            bucket={bucketName}
            path={folderPrefix}
            visible={isDetailsDialogVisible}
            onHide={closeFileDetailsDialog}
            file={selectedFile}
          />
          <NewPolicy
            visible={policyDialogVisible}
            onHide={() => setPolicyDialogVisible(false)}
            selectedFile={selectedFile}
            selectedBucket={bucketName}
            onPolicyCreated={fetchFolderContents}
            selectedResource={policyType}
            prefix={folderPrefix}
          />
        </div>
      </div>
    </>
  );
};

export default S3Browser;
