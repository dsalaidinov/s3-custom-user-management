import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const PolicyTable = () => {
  const [policy, setPolicy] = useState({
    fullControl: false,
    read: false,
    write: false,
    editPermissions: false,
    writePermissions: false,
  });

  const handleCheckboxChange = (event, field) => {
    setPolicy((prevPolicy) => ({
      ...prevPolicy,
      [field]: event.target.checked,
    }));
  };

  return (
    <DataTable value={[policy]} className="p-datatable-striped">
      <Column
        field="fullControl"
        header="Full Control"
        body={(rowData) => (
          <input
            type="checkbox"
            checked={rowData.fullControl}
            onChange={(e) => handleCheckboxChange(e, "fullControl")}
          />
        )}
      />
      <Column
        field="read"
        header="Read"
        body={(rowData) => (
          <input
            type="checkbox"
            checked={rowData.read}
            onChange={(e) => handleCheckboxChange(e, "read")}
          />
        )}
      />
      <Column
        field="write"
        header="Write"
        body={(rowData) => (
          <input
            type="checkbox"
            checked={rowData.write}
            onChange={(e) => handleCheckboxChange(e, "write")}
          />
        )}
      />
      <Column
        field="editPermissions"
        header="Edit Permissions"
        body={(rowData) => (
          <input
            type="checkbox"
            checked={rowData.editPermissions}
            onChange={(e) => handleCheckboxChange(e, "editPermissions")}
          />
        )}
      />
      <Column
        field="writePermissions"
        header="Write Permissions"
        body={(rowData) => (
          <input
            type="checkbox"
            checked={rowData.writePermissions}
            onChange={(e) => handleCheckboxChange(e, "writePermissions")}
          />
        )}
      />
    </DataTable>
  );
};

export default PolicyTable;
