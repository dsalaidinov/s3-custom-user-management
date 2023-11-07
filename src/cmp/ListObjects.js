import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import mc from "../util/mc";
import prettyBytes from "pretty-bytes";
import { orderBy } from "lodash";
import history from "../history";
import JSZip from "jszip";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { iconMapping } from "../config/icons";

const getAsNode = (objectInfo) => {
  const {
    name = "",
    pathName,
    displayKey,
    leaf,
    children,
    size,
    ...dataKeys
  } = objectInfo;

  return {
    key: `${pathName}/${name}`,
    data: {
      ...dataKeys,
      name: displayKey,
      size: size > 0 ? prettyBytes(size) : "",
    },
    leaf: leaf,
    children: children,
  };
};

const listObjectsOfPrefix = (bName = "", pathName, keyPrefix = "") => {
  // return new Promise((resolve, reject) => {
  //   let objList = [];
  //   try {
  //     const objectsStream = mc.listObjectsV2(bName, pathName, false, "");
  //     objectsStream.on("data", async (chunk) => {
  //       const { name: objectName = "", prefix } = chunk;

  //       //TODO Start After.
  //       //const displayPathName = objectName.indexOf("/") !== -1 ? objectName.substring(pathName.lastIndexOf("/") + 1) : objectName;
  //       const displayPathName =
  //         objectName.indexOf("/") !== -1
  //           ? objectName.substring(pathName.lastIndexOf("/"))
  //           : objectName;
  //       let nodeInfo;
  //       if (!prefix) {
  //         nodeInfo = getAsNode({
  //           ...chunk,
  //           name: objectName,
  //           displayKey: displayPathName,
  //           leaf: true,
  //           pathName: `${keyPrefix}`,
  //         });
  //       } else {
  //         let displayPrefix = prefix.substring(0, prefix.length - 1);
  //         displayPrefix =
  //           displayPrefix.indexOf("/") !== -1
  //             ? displayPrefix.substring(pathName.length - 1)
  //             : displayPrefix;
  //         nodeInfo = getAsNode({
  //           ...chunk,
  //           name: prefix,
  //           displayKey: displayPrefix,
  //           children: null,
  //           leaf: false,
  //           pathName: `${keyPrefix}`,
  //         });
  //       }

  //       if (nodeInfo) {
  //         objList.push(nodeInfo);
  //       }
  //     });
  //     objectsStream.on("error", (err) => {
  //       reject([]);
  //     });
  //     objectsStream.on("end", () => {
  //       resolve(objList);
  //     });
  //   } catch (err) {
  //     console.log("Error in list objects", err);
  //     reject([]);
  //   }
  // });
  return new Promise((resolve, reject) => {
    let objList = [];
    try {
      const objectsStream = mc.listObjectsV2(bName, pathName, false, "");
      objectsStream.on("data", async (chunk) => {
        const { name: objectName = "", prefix } = chunk;

        // Оставляем только файлы, исключая папки
        if (!prefix) {
          const displayPathName =
            objectName.indexOf("/") !== -1
              ? objectName.substring(pathName.lastIndexOf("/"))
              : objectName;
          let nodeInfo = getAsNode({
            ...chunk,
            name: objectName,
            displayKey: displayPathName,
            leaf: true,
            pathName: `${keyPrefix}`,
          });
          if (nodeInfo) {
            objList.push(nodeInfo);
          }
        }
      });
      objectsStream.on("error", (err) => {
        reject([]);
      });
      objectsStream.on("end", () => {
        resolve(objList);
      });
    } catch (err) {
      console.log("Error in list objects", err);
      reject([]);
    }
  });
};

const ListObjects = forwardRef(({ bucketName, path, onDelete }, ref) => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadObjectList = async (bucketName, path) => {
    let objList = await listObjectsOfPrefix(bucketName, path);

    let sortedList = orderBy(objList, ["leaf", "name"], ["asc", "desc"]);

    setObjects((prev = []) => {
      return [...prev, ...sortedList];
    });
  };

  // useImperativeHandle(ref, () => ({
  //   refresh(b = bucketName, p = path) {
  //     loadBucketObjects(b, p);
  //   },
  //   refreshChildren(evt) {
  //     onExpand(evt);
  //   },
  // }));

  useImperativeHandle(ref, () => ({
    refresh() {
      loadBucketObjects(bucketName, path);
    },
    refreshChildren(evt) {
      onExpand(evt);
    },
  }));

  const loadBucketObjects = (bucketName, path) => {
    setObjects([]);
    if (!bucketName) {
      return;
    }
    loadObjectList(bucketName, path);
  };

  useEffect(() => {
    loadBucketObjects(bucketName, path);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketName, path]);

  const openPreView = (path, contentType) => {
    mc.getObject(bucketName, path, function (err, dataStream) {
      if (err) {
        console.log("err", err);
        return;
      }
      const chunks = [];
      dataStream.on("data", function (chunk) {
        chunks.push(chunk);
      });
      dataStream.on("end", function () {
        console.log("File downloaded successfully");
        const blob = new Blob(chunks, { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", path.split("/").pop());
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      dataStream.on("error", function (err) {
        console.log(err);
      });
    });
  };

  const renderSizeColumn = (rowData) => {
    return <span>{rowData.data.size}</span>;
  };

  const renderDateColumn = (rowData) => {
    const lmd = rowData.data.lastModified;
    const date = lmd
      ? new Date(rowData.data.lastModified).toLocaleString()
      : "";

    return <span>{date}</span>;
  };

  const renderTypeColumn = (rowData) => {
    const fileType = rowData?.data?.metadata?.Items?.find(
      (item) => item.Key === "content-type"
    )?.Value;

    const type = rowData?.data?.prefix ? "" : rowData?.data?.name.split(".")[1];
    const iconClass = iconMapping[type] || iconMapping.default;
    return <i className={iconClass}>{type}</i>;
  };

  const openPreviewWithSignedUrl = async (path) => {
    setLoading(true);
    const signedUrl = await mc.presignedGetObject(bucketName, path);
    setLoading(false);
    window.open(signedUrl, "_blank");
  };

  const downloadObject = async (objectKey) => {
    setLoading(true);

    try {
      const objectInfo = await mc.statObject(bucketName, objectKey);
      if (objectInfo.isDirectory) {
        const folderPath = `${bucketName}/${objectKey}`;
        const zipData = await createZipFromFolder(folderPath);
        downloadZip(zipData, `${objectKey}.zip`);
      } else {
        openPreView(objectKey);
      }

      setLoading(false);
    } catch (error) {
      console.log("Error downloading object:", error);
      setLoading(false);
    }
  };

  const createZipFromFolder = async (folderPath) => {
    return new Promise((resolve, reject) => {
      const archive = new JSZip();

      const stream = mc.listObjectsV2(bucketName, folderPath, true);

      stream.on("data", (obj) => {
        const filePath = obj.name;
        const fileName = filePath.substring(folderPath.length + 1);

        if (!obj.prefix) {
          mc.getObject(bucketName, filePath, (err, dataStream) => {
            if (err) {
              console.log("Error downloading file:", err);
              reject(err);
            } else {
              const chunks = [];
              dataStream.on("data", (chunk) => {
                chunks.push(chunk);
              });
              dataStream.on("end", () => {
                const fileData = Buffer.concat(chunks);
                archive.file(fileName, fileData);
              });
              dataStream.on("error", (err) => {
                console.log("Error downloading file:", err);
                reject(err);
              });
            }
          });
        }
      });

      stream.on("end", () => {
        archive.generateAsync({ type: "nodebuffer" }).then((zipData) => {
          resolve(zipData);
        });
      });

      stream.on("error", (error) => {
        console.log("Error listing objects:", error);
        reject(error);
      });
    });
  };

  const downloadZip = (zipData, fileName) => {
    const blob = new Blob([zipData], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const onExpand = async (event) => {
    // if (!event.node.children) {
    //   const { node: { key: nodePath } = {} } = event;
    //   loadBucketObjects(bucketName, `${path}${nodePath}`);
    //   history.push(`/buckets/${bucketName}?path=${path}${nodePath}`);
    //   // loadBucketObjects(bucketName, nodePath.substring(1, path.length));
    //   // history.push(
    //   //   `/buckets/${bucketName}?path=${nodePath.substring(1, nodePath.length)}`
    //   // );
    // }
    if (!event.node.children && event.node.leaf) {
      const { node: { key: nodePath } = {} } = event;
      loadBucketObjects(bucketName, `${path}${nodePath}`);
      history.push(`/buckets/${bucketName}?path=${path}${nodePath}`);
    }
  };

  const rowClassName = (node) => {
    return { "p-highlight": false, "object-tree-row": true };
  };

  const actionTemplate = (node, column) => {
    const fileType = node?.data?.metadata?.Items?.find(
      (item) => item.Key === "content-type"
    )?.Value;

    return (
      <div className="flex gap-2">
        <button className="p-link" onClick={() => downloadObject(node.key)}>
          <i className="pi pi-download"></i>
        </button>
        <button
          type="button"
          className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"
          onClick={() => {
            onDelete?.({ node: node });
          }}
        >
          <i className="pi pi-trash"></i>
        </button>
        {node.leaf ? null : 
        // (
        //   <button
        //     type="button"
        //     className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"
        //     onClick={() => {
        //       let path = node.key;
        //       listObjectsOfPrefix(bucketName, path.substring(
        //         1,
        //         path.length
        //       ));
        //       history.push(
        //         `/buckets/${bucketName}?path=${path.substring(
        //           1,
        //           path.length - 1
        //         )}`
        //       );
        //     }}
        //   >
        //     <i className="pi pi-window-maximize"></i>
        //   </button>
        // )
        null
        }
        {fileType ? (
          <button
            type="button"
            className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"
            onClick={() => {
              downloadObject(node.key);
            }}
          >
            <i className="pi pi-download"></i>
          </button>
        ) : null}
        {fileType ? (
          <button
            type="button"
            className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"
            onClick={() => {
              openPreviewWithSignedUrl(node.key);
            }}
          >
            <i className="pi pi-link"></i>
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <TreeTable
      className="object-tree-table"
      value={objects}
      paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
      onExpand={onExpand}
      loading={loading}
      scrollable
      rowClassName={rowClassName}
    >
      <Column field="name" header="Name" expander></Column>
      <Column field="size" header="Size" body={renderSizeColumn}></Column>
      <Column field="type" header="Type" body={renderTypeColumn}></Column>
      <Column
        field="date"
        header="Last Modified"
        body={renderDateColumn}
      ></Column>
      <Column
        field="actions"
        header="Actions"
        body={actionTemplate}
        style={{ textAlign: "center", width: "100px" }}
      />
    </TreeTable>
  );
});
export default ListObjects;
