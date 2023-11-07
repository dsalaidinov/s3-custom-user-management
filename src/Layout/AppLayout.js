import React, { useEffect, Fragment } from "react";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";

import Header from "../Layout/Header";
import AppBody from "../Layout/AppBody";
import Footer from "../Layout/Footer";

const AppLayout = ({ children }) => {
  const history = useHistory();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!Cookies.get('token')) {
      history.push("/login");
    }
  }, [token, history]);

  return (
    <Fragment>
      <Header />
      <div className="flex justify-center items-center" style={{ marginBottom: "3rem" }}>
        <AppBody>{children}</AppBody>
      </div>
      <Footer />
    </Fragment>
  );
};

export default AppLayout;
