import React from "react";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";

const BucketAccessSelect = ({ availableBuckets, predefinedPolicies, value, onChange }) => {
  const handleBucketChange = (e) => {
    onChange({
      bucket: e.value,
      bucketAction: null, // Reset the selected bucket action when changing the bucket
      objectAction: null, // Reset the selected object action when changing the bucket
    });
  };

  const handleBucketActionChange = (e) => {
    console.log(value)
    onChange({
      bucket: value.bucket,
      bucketAction: e.value,
      objectAction: null, // Reset the selected object action when changing the bucket action
    });
  };

  const handleObjectActionChange = (e) => {
    console.log(e)
    onChange({
      bucket: value.bucket,
      bucketAction: value.bucketAction,
      objectAction: e.value,
    });
  };

  return (
    <div className="p-grid p-dir-col">
      <div className="p-col">
        <label htmlFor="bucketAction">Select Bucket Action</label>
        <Dropdown
          id="bucketAction"
          value={value.bucketAction}
          options={predefinedPolicies.map((policy) => ({
            label: policy.name,
            value: policy.bucketAction,
          }))}
          onChange={handleBucketActionChange}
          optionLabel="label"
          placeholder="Select a bucket action"
          filter
          showClear
        />
      </div>

      <div className="p-col">
        <label htmlFor="objectAction">Select Object Action</label>
        <MultiSelect
          id="objectAction"
          value={value.objectAction}
          options={predefinedPolicies.map((policy) => ({
            label: policy.name,
            value: policy.objectAction,
          }))}
          onChange={handleObjectActionChange}
          optionLabel="label"
          placeholder="Select an object action"
          maxSelectedLabels={3}
          className="w-full md:w-20rem"
        />
      </div>
    </div>
  );
};

export default BucketAccessSelect;
