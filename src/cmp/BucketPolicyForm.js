import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import mc from "../util/mc";
import useToast from "./useToast";
import axiosClient from "../util/axiosClient";

const BucketPolicyForm = ({ bucketName, onHide }) => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [toast, showError, showSuccess] = useToast();

  useEffect(() => {
    // getPolicies();
    fetchUsers();
    initializePermissions();

  }, []);

  const initializePermissions = () => {
    const initialPermissions = {};
    users.forEach((user) => {
      initialPermissions[user.accessKey] = {
        fullControl: false,
        read: false,
        write: false,
      };
    });
    setPermissions(initialPermissions);
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get("/users");
      const fetchedUsers = response.data.users;
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getPolicies = async () => {
    try {
      const policies = await mc.getBucketPolicy(bucketName);
      console.log(policies);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePermissionChange = (user, permission, checked) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [user]: {
        ...prevPermissions[user],
        [permission]: checked,
      },
    }));
  };

  const savePermissions = async () => {
    try {
      const policy = generatePolicyFromPermissions();
      await mc.setBucketPolicy(bucketName, policy); // Используйте метод setBucketPolicy из библиотеки minio

      showSuccess("Permissions saved successfully");
      onHide();
    } catch (error) {
      showError("Failed to save permissions");
    }
  };

  const cancelChanges = () => {
    onHide();
  };

  const generatePolicyFromPermissions = () => {
    const policy = {
      Version: "2012-10-17",
      Statement: [],
    };

    for (const user in permissions) {
      const userPermissions = permissions[user];
      const statement = {
        Sid: `${bucketName}-Statement-${user}`,
        Effect: "Allow",
        Principal: {
          AWS: user,
        },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
        Condition: {},
      };

      for (const permission in userPermissions) {
        if (userPermissions[permission]) {
          switch (permission) {
            case "fullControl":
              statement.Action.push("s3:PutObject", "s3:DeleteObject");
              break;
            case "read":
              statement.Action.push("s3:GetObject");
              break;
            case "write":
              statement.Action.push("s3:PutObject");
              break;
            default:
              break;
          }
        }
      }

      policy.Statement.push(statement);
    }

    return JSON.stringify(policy, null, 2);
  };

  return (
    <Dialog
      visible={true}
      onHide={onHide}
      maximizable
      // style={{ textAlign: "center" }}
      header={`Bucket Policy  ${bucketName || ''}`}
      footer={
        <div>
          <Button
            label="Apply Changes"
            className="p-button-primary"
            onClick={() => fetchUsers()}
          />
          <Button
            label="Cancel"
            className="p-button-secondary"
            onClick={cancelChanges}
          />
        </div>
      }
    >
      <table className="p-table w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>Full Control</th>
            <th>Read</th>
            <th>Write</th>
            {/* <th>Edit Permissions</th>
            <th>Write Permissions</th> */}
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.accessKey}>
              <td>{user.accessKey}</td>
              <td>
                <Checkbox
                  checked={permissions[user.accessKey]?.fullControl || false}
                  onChange={(e) =>
                    handlePermissionChange(user.accessKey, "fullControl", e.checked)
                  }
                />
              </td>
              <td>
                <Checkbox
                  checked={permissions[user.accessKey]?.read || false}
                  onChange={(e) =>
                    handlePermissionChange(user.accessKey, "read", e.checked)
                  }
                />
              </td>
              <td>
                <Checkbox
                  checked={permissions[user.accessKey]?.write || false}
                  onChange={(e) =>
                    handlePermissionChange(user.accessKey, "write", e.checked)
                  }
                />
              </td>
              {/* <td>
                <Checkbox
                  checked={permissions[user.accesskey]?.editPermissions || false}
                  onChange={(e) =>
                    handlePermissionChange(
                      user.accesskey,
                      "editPermissions",
                      e.checked
                    )
                  }
                />
              </td>
              <td>
                <Checkbox
                  checked={permissions[user.accesskey]?.writePermissions || false}
                  onChange={(e) =>
                    handlePermissionChange(
                      user.accesskey,
                      "writePermissions",
                      e.checked
                    )
                  }
                />
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </Dialog>
  );
};

export default BucketPolicyForm;
