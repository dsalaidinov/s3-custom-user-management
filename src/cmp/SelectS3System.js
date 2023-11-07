import React, { useEffect, useState } from "react";
import { Dropdown } from 'primereact/dropdown';

import axiosClient from "../util/axiosClient";
const currentS3System = localStorage.getItem('s3system');

const SelectS3System = ({ onSelect }) => {
    const [selectedS3System, setSelectedS3System] = useState(null);
    const [s3systems, setS3Systems] = useState([]);

    const fetchS3Systems = async () => {
        try {
            const response = await axiosClient.get("/s3-systems/list");
            const fetchedS3Systems = response.data;
            setS3Systems(fetchedS3Systems);
        } catch (error) {
            console.error("Error fetching S3 systems:", error);
        }
    };

    useEffect(() => {
        fetchS3Systems();
        if (currentS3System) {
            const system = s3systems.find((system) => system._id === currentS3System);
            console.log(system)
            if (system) {
                setSelectedS3System(system.name);
            }
        }
    }, []);

    const handleSelectS3System = (event) => {
        setSelectedS3System(event.target?.value);
        onSelect(event.target?.value._id);
        localStorage.setItem('s3system', event.target?.value?._id)
    }

    return (
        <div>
            <Dropdown
                severity="info"
                value={selectedS3System}
                onChange={handleSelectS3System}
                options={s3systems}
                optionLabel="name"
                placeholder="Select S3 System"
            />
        </div>);
};

export default SelectS3System;