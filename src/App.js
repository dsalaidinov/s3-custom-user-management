import React from "react";

import history from "./history";
import { Router, Route, Switch } from "react-router";
import ListBuckets from "./cmp/ListBuckets";
import BrowseBucket from "./cmp/BrowseBucket";
import AppLayout from "./Layout/AppLayout";
import "./App.css"
import LoginPage from "./Layout/LoginPage";
import ListS3Systems from "./cmp/ListS3Systems";
import ListUsers from "./cmp/ListUsers";
import ListPolicies from "./cmp/ListPolicies";
import NewUser from "./cmp/NewUser";
import NewPolicy from "./cmp/NewPolicy";

const App = () => {
  return (
    <Router history={history}>
    <AppLayout>
        <Switch>
          <Route exact path={["/", "/home"]} component={ListBuckets} />
          <Route exact path={["/s3systems"]} component={ListS3Systems} />
          <Route exact path={["/users"]} component={ListUsers} />
          <Route exact path={["/policies"]} component={ListPolicies} />
          <Route exact path={["/policies/new"]} component={NewPolicy} />
          <Route exact path={["/users/new"]} component={NewUser} />
          <Route exact path={["/login"]} component={LoginPage} />
          <Route exact path={["/buckets/:bucketName"]} component={BrowseBucket} />
        </Switch>
    </AppLayout>
    </Router>
  );
};

export default App;
