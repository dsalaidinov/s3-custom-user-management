import React, { useState, useEffect } from "react";
import mc from "../util/mc";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import axiosClient from "../util/axiosClient";
import { Dropdown } from "primereact/dropdown";
import predefinedPolicies from "./predefinedPolicies";
import useToast from "../cmp/useToast";

const NewPolicy = ({
  visible,
  onHide,
  onPolicyCreated,
  selectedFile,
  selectedBucket,
  selectedResource = "bucket",
  prefix,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    selectedBucket: null,
    selectedBucketAction: null,
    selectedObjectAction: null,
    resourceType: "",
  });
  const [toast, , showSuccess] = useToast();
  const [error, setError] = useState("");
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    if (selectedBucket) {
      setFormData({
        ...formData,
        selectedBucket,
      });
    }

    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    const res = await mc.listBuckets();
    setBuckets(res);
  };

  const handleBucketAndPolicyChange = (newValue) => {
    setFormData({
      ...formData,
      selectedBucket: newValue.bucket,
      selectedBucketAction: newValue.bucketAction,
      selectedObjectAction: newValue.objectAction,
    });
  };

  const handleHide = () => {
    setFormData({
      name: "",
      selectedBucket: null,
      selectedBucketAction: null,
      selectedObjectAction: null,
    });
    setError("");
    onHide();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const policyStatements = [];
      const selectedResourceType = selectedResource;
      const selectedObjectAction = formData.selectedObjectAction;
      const selectedBucketAction = formData.selectedBucketAction;

      if (selectedResourceType === "file") {
        if (selectedObjectAction) {
          const folderPrefix = prefix[0] !== "/" ? "/" + prefix : prefix;
          const path = `${selectedBucket}${folderPrefix}${selectedFile.name}`;

          selectedObjectAction.forEach((action) => {
            policyStatements.push({
              Effect: "Allow",
              Action: action,
              Resource: [`arn:aws:s3:::${path}`],
            });
          });

          selectedObjectAction.forEach((action) => {
            if (action[0] === "s3:GetObject") {
              const splittedPath = prefix?.split("/");
              const s3Prefix = [];

              for (let i = 0; i < 3; i++) {
                const pathSegment = splittedPath.slice(0, i + 1).join("/");
                s3Prefix.push(
                  pathSegment.endsWith("/")
                    ? `${pathSegment}`
                    : `${pathSegment}/`
                );
              }

              s3Prefix.push(`${prefix}${selectedFile.name}/`);

              policyStatements.push({
                Effect: "Allow",
                Action: "s3:ListBucket",
                Resource: [`arn:aws:s3:::${selectedBucket}`],
                Condition: {
                  StringLike: {
                    "s3:delimiter": ["/"],
                    "s3:prefix": ["", ...new Set(s3Prefix)],
                  },
                },
              });
            }
          });
        }
      } else if (selectedResourceType === "folder") {
        const folderPrefix = prefix[0] !== "/" ? "/" + prefix : prefix;
        let prefixForList;

        if (prefix === "") {
          prefixForList = prefix[0] !== "/" ? prefix : prefix.slice(1);
        }

        const path = `${selectedBucket}${folderPrefix}${selectedFile.name}/*`;

        selectedBucketAction.forEach((action) => {
          if (action[0] === "s3:ListBucket") {
            const splittedPath = prefix?.split("/");
            const s3Prefix = [];

            for (let i = 0; i < 3; i++) {
              const pathSegment = splittedPath.slice(0, i + 1)?.join("/");
              if ( pathSegment.endsWith("/") && pathSegment.length != 1) {
                s3Prefix.push(pathSegment);
              } else if(!pathSegment.endsWith("/") && pathSegment.length != 1) {
                s3Prefix.push(`${pathSegment}/`);
              }
             
              console.log(s3Prefix)
            }
            s3Prefix.push(`${prefix === '/' || prefix === '' ? '' : prefix}${selectedFile.name}/`);

            policyStatements.push({
              Effect: "Allow",
              Action: action,
              Resource: [`arn:aws:s3:::${selectedBucket}`],
              Condition: {
                StringLike: {
                  "s3:delimiter": ["/"],
                  "s3:prefix": ["", ...new Set(s3Prefix)],
                },
              },
            });
          } else {
            policyStatements.push({
              Effect: "Allow",
              Action: action,
              Resource: [`arn:aws:s3:::${path}`],
            });
          }
        });
      } else if (selectedResourceType === "bucket") {
        if (selectedBucketAction) {
          selectedBucketAction.forEach((action) => {
            policyStatements.push({
              Effect: "Allow",
              Action: action,
              Resource: [`arn:aws:s3:::${formData.selectedBucket}`],
            });
          });
        }
      }
      const policy = {
        Version: "2012-10-17",
        Statement: policyStatements,
      };
      await axiosClient.post(`/policies`, {
        name: formData.name,
        policy: JSON.stringify(policy),
      });

      handleHide();
      setError("");
      showSuccess(`Policy created successfully!`);
      onPolicyCreated(formData.name);
    } catch (error) {
      setError(error?.error?.detailedMessage || error?.error?.message);
      console.error("Error creating policy:", error);
    }
  };

  const dialogFooter = (
    <div className="p-d-flex p-jc-between">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
      />
      <Button
        label="Create Policy"
        icon="pi pi-check"
        className="p-button-success"
        onClick={onSubmit}
      />
    </div>
  );

  const handleObjectActionChange = (e) => {
    console.log(e);
    setFormData({
      ...formData,
      selectedObjectAction: e.value,
    });
  };

  const getObjectActionsForDropdown = () => {
    const filePolicy = predefinedPolicies.file;

    if (filePolicy) {
      return filePolicy.map((action) => ({
        name: action.name,
        value: action.permissions,
      }));
    }

    return [];
  };

  const getBucketActionsForDropdown = () => {
    const filePolicy = predefinedPolicies.bucket;

    if (filePolicy) {
      return filePolicy.map((action) => ({
        name: action.name,
        value: action.permissions,
      }));
    }

    return [];
  };

  const getFolderActionsForDropdown = () => {
    const filePolicy = predefinedPolicies.folder;
    if (filePolicy) {
      return filePolicy.map((action) => ({
        name: action.name,
        value: action.permissions,
      }));
    }

    return [];
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        style={{ width: "30vw" }}
        onHide={handleHide}
        maximizable
        header="Create New Policy"
        footer={dialogFooter}
      >
        <form onSubmit={onSubmit} className="p-fluid">
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="name">Policy Name *</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {selectedResource === "file" && (
            <div className="p-col">
              <label htmlFor="objectAction">Select Action</label>
              <MultiSelect
                id="objectAction"
                value={formData.selectedObjectAction}
                options={getObjectActionsForDropdown()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedObjectAction: e.value,
                  })
                }
                optionLabel="name"
                placeholder="Select an object action"
                maxSelectedLabels={3}
                className="w-full md:w-20rem"
              />
            </div>
          )}

          {selectedResource === "folder" && (
            <div className="p-col">
              <label htmlFor="folderAction">Select Action</label>
              <MultiSelect
                id="folderAction"
                value={formData.selectedBucketAction}
                options={getFolderActionsForDropdown()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedBucketAction: e.value,
                  })
                }
                optionLabel="name"
                placeholder="Select a folder action"
                maxSelectedLabels={3}
                className="w-full md:w-20rem"
              />
            </div>
          )}

          {!selectedFile && (
            <div className="p-field" style={{ marginBottom: "1rem" }}>
              <label>Select Bucket</label>
              <Dropdown
                value={formData.selectedBucket}
                options={buckets.map((bucket) => ({
                  label: bucket.name,
                  value: bucket.name,
                }))}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedBucket: e.value,
                    selectedBucketAction: null,
                    selectedObjectAction: null,
                  })
                }
                placeholder="Select a bucket"
                filter
                showClear
              />
            </div>
          )}

          {selectedResource === "bucket" && formData.selectedBucket && (
            <div className="p-col">
              <label htmlFor="bucketAction">Select Action</label>
              <MultiSelect
                id="bucketAction"
                value={formData.selectedBucketAction}
                options={getBucketActionsForDropdown()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedBucketAction: e.value,
                  })
                }
                optionLabel="name"
                placeholder="Select a bucket action"
                maxSelectedLabels={3}
                className="w-full md:w-20rem"
              />
            </div>
          )}
          <div style={{ marginTop: "1rem" }}>
            {error && <Message severity="error" text={error} />}
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default NewPolicy;
