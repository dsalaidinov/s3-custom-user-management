import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import baseURL from "../config/baseUrl";
import { Container, Row, Col } from "react-grid-system";

const EditPolicy = ({ user, onClose, onUserUpdated }) => {
  const [username, setUsername] = useState("");
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [allPolicies, setAllPolicies] = useState([
    {
      "name": "readonly",
      "policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"s3:GetBucketLocation\",\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::*\"]}]}"
    },
    {
      "name": "readwrite",
      "policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"s3:*\"],\"Resource\":[\"arn:aws:s3:::*\"]}]}"
    },
    {
      "name": "writeonly",
      "policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"s3:PutObject\"],\"Resource\":[\"arn:aws:s3:::*\"]}]}"
    },
    {
      "name": "consoleAdmin",
      "policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"admin:*\"]},{\"Effect\":\"Allow\",\"Action\":[\"kms:*\"]},{\"Effect\":\"Allow\",\"Action\":[\"s3:*\"],\"Resource\":[\"arn:aws:s3:::*\"]}]}"
    },
    {
      "name": "diagnostics",
      "policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"admin:Profiling\",\"admin:Prometheus\",\"admin:ServerInfo\",\"admin:ServerTrace\",\"admin:TopLocksInfo\",\"admin:BandwidthMonitor\",\"admin:ConsoleLog\",\"admin:OBDInfo\"],\"Resource\":[\"arn:aws:s3:::*\"]}]}"
    }
  ]);
  const [allGroups, setAllGroups] = useState(["guests"]);

  useEffect(() => {
    setUsername(user.accessKey);
    setSelectedPolicies(user.policy);
    setSelectedGroups(user.memberOf);
    // fetchPolicies();
    // fetchGroups();
  }, [user]);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${baseURL}/policies`);
      const fetchedPolicies = response.data.policies;
      setAllPolicies(fetchedPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${baseURL}/groups`);
      const fetchedGroups = response.data.groups;
      setAllGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const updatedUser = {
        id: user.id,
        accessKey: username,
        policy: selectedPolicies,
        memberOf: selectedGroups,
      };

      await axios.put(`${baseURL}/users/${user.id}`, updatedUser);
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <Dialog
      visible={true}
      style={{ width: "30vw" }}
      onHide={onClose}
      header="Edit User"
      footer={
        <div className="p-d-flex p-jc-between">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onClose}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleUpdateUser}
          />
        </div>
      }
    >
      <Container>
        <Row>
          <Col xs={12}>
            <div className="p-field">
              <label htmlFor="username" className="text-1xl font-bold">Username: {username}</label>
              {/* <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              /> */}
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="p-field">
              <label htmlFor="policies" className="text-1xl font-bold">Policies</label>
              <div className="checkbox-group">
                {allPolicies?.map((policy) => (
                  <div className="checkbox-option" key={policy.name}>
                    <input
                      type="checkbox"
                      id={policy.name}
                      value={policy.name}
                      checked={selectedPolicies?.includes(policy.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPolicies([
                            ...selectedPolicies,
                            policy.name,
                          ]);
                        } else {
                          setSelectedPolicies(
                            selectedPolicies.filter(
                              (selectedPolicy) =>
                                selectedPolicy !== policy.name
                            )
                          );
                        }
                      }}
                    />
                    <label htmlFor={policy.name}>{policy.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="p-field">
              <label htmlFor="groups" className="text-1xl font-bold">Groups</label>
              <div className="checkbox-group">
                {allGroups.map((group) => (
                  <div className="checkbox-option" key={group}>
                    <input
                      type="checkbox"
                      id={group}
                      value={group}
                      checked={selectedGroups?.includes(group)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroups([...selectedGroups, group]);
                        } else {
                          setSelectedGroups(
                            selectedGroups.filter(
                              (selectedGroup) => selectedGroup !== group
                            )
                          );
                        }
                      }}
                    />
                    <label htmlFor={group}>{group}</label>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Dialog>
  );
};

export default EditPolicy;
