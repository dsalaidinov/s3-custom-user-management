import { useLocation, useParams } from "react-router-dom";
import ListObjects from "./ListObjects";
import React, { useRef } from "react";

const BrowsePath = () => {
  const { bucketName } = useParams();

  const { search } = useLocation();

  const params = new URLSearchParams(search);

  const prefixPath = params.get("path") || "";

  const childRef = useRef(null); // Добавьте этот хук useRef

  return (
    <ListObjects
      key="browse-path"
      bucketName={bucketName}
      path={`${prefixPath}`}
      ref={childRef} // Передайте ref в ListObjects
    />
  );
};

export default BrowsePath;
