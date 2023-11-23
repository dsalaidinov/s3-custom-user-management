import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Tag } from 'primereact/tag';
import mc from "../util/mc";

import NewUser from "./NewUser";
import EditUser from "./EditUser";
import axiosClient from "../util/axiosClient";
import useToast from "../cmp/useToast";

const ListUsers = () => {
  const [displayNewUserDialog, setDisplayNewUserDialog] = useState(false);
  const [displayEditUserDialog, setDisplayEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, showError, showSuccess] = useToast();
  const [users, setUsers] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [policies, setPolicies] = useState(null);
  const [s3systems, setS3Systems] = useState([]);

  useEffect(() => {
    fetchS3Systems();
    fetchUsers();
    // fetchBuckets();
    // fetchPolicies();
  }, []);

  const fetchS3Systems = async () => {
    try {
      const response = await axiosClient.get("/s3systems/list");
      const fetchedS3Systems = response.data;
      setS3Systems(fetchedS3Systems);
    } catch (error) {
      console.error("Error fetching S3 systems:", error);
    }
  };

  const fetchBuckets = async () => {
    const res = await mc.listBuckets();
    setBuckets(res);
  };

  const fetchPolicies = async () => {
    try {
      const response = await axiosClient.get("/policies");
      const fetchedPolicies = response.data.policies;
      setPolicies(fetchedPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get("/users/list");
      const fetchedUsers = response.data;
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const deleteUser = async (accessKey) => {
    try {
      await axiosClient.post("/remove-user", { accessKey });
      showSuccess(`User '${accessKey}' removed successfully!`);
    } catch (error) {
      console.error(
        "Error removing user:",
        error?.error?.detailedMessage || error?.error?.message
      );
      showError(
        `Error removing user '${accessKey}' ${
          error?.error?.detailedMessage ||
          error?.error?.message ||
          error?.details
        }`
      );
    }
  };

  const handleEditUser = (user) => {
    setDisplayEditUserDialog(true);
    setSelectedUser(user);
  };

  const handleCloseEdit = () => {
    setSelectedUser(null);
  };

  const renderActions = (rowData) => {
    return (
      <div className="p-d-flex p-jc-between">
        <Button
          icon="pi pi-cog"
          style={{ marginRight: "1rem" }}
          className="p-button-rounded p-button-info p-button"
          onClick={() => handleEditUser(rowData)}
        />
        {/* <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deleteUser(rowData.accessKey)}
        /> */}
      </div>
    );
  };

  // const statusBodyTemplate = (rowData) => {
  //   return <Tag value={rowData.status} severity={getStatus(rowData)}></Tag>;
  // };

  const S3SystemsBodyTemplate = (rowData) => {
    console.log(rowData);
    const systemIds = rowData.s3systems;
    const systemNames = systemIds?.map(id => {
      const system = s3systems.find(s => s._id === id);
      return system ? <Tag value={system?.name} className="mr-1"></Tag> : '';
    });

  return systemNames;
  };

  const getStatus = (user) => {
    switch (user.inventoryStatus) {
        case 'enabled':
            return 'success';

        case 'disabled':
            return 'warning';

       default:
            return null;
    }
};

  const onUserUpdated = () => {
    showSuccess(`User updated successfully!`);
    fetchUsers();
  }

  const userTableHeader = (
    <div className="flex justify-between gap-5 p-2">
      <h1 className="font-bold">Users</h1>
      <div>
        <Button
          icon="pi pi-refresh"
          rounded='true'
          raised='true'
          onClick={() => fetchUsers()}
          style={{ marginRight: "0.25rem" }}
        />
        <Button
          label="Create New User"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => setDisplayNewUserDialog(true)}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <div className="p-card p-shadow-4 content-container">
        {userTableHeader}
        <DataTable
          value={users}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          size="small"
          className="p-datatable-striped"
        >
          <Column field="username" sortable style={{ width: '25%' }} header="Username"></Column>
          {/* <Column field="policy" header="Policies"></Column>*/}
          <Column field="s3systems" sortable header="S3 Systems" body={S3SystemsBodyTemplate} style={{ minWidth: '50rem' }}></Column> 
          <Column header="Actions" body={renderActions} style={{ minWidth: '10rem' }}></Column>
        </DataTable>

        <NewUser
          visible={displayNewUserDialog}
          onHide={() => setDisplayNewUserDialog(false)}
          onUserCreated={() => fetchUsers()}
        />

        {selectedUser && (
          <EditUser
            user={selectedUser}
            buckets={buckets}
            s3systems={s3systems}
            onClose={handleCloseEdit}
            onUserUpdated={onUserUpdated}
          />
        )}
      </div>
    </>
  );
};

export default ListUsers;
