import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import LogoutButton from "../cmp/Logout";

const Header = () => {
  //TODO: replace to strong check token value
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const pathname = window.location.pathname;

  return (
    <header className=" w-full h-16 drop-shadow-lg text-white " style={{ backgroundColor: '#277cbc' }}>
      <div className="container px-4 md:px-0 h-full mx-auto flex justify-between items-center">
        {token && pathname !== '/login' && (
          <ul
            id="menu"
            className="hidden fixed  bg-gray-800 z-50
                md:relative md:flex md:p-4 md:bg-transparent md:flex-row md:space-x-6"
          >
            {isAdmin && (<li className="p-1 flex items-center">
              <Link
                className="text-white opacity-75 hover:opacity-100 duration-300 border-gray-200 p-1 flex items-center"
                to="/s3systems"
              >
                S3 Systems
              </Link>
            </li>)}
            <li className="p-1 flex items-center">
              <Link
                className="text-white opacity-75 hover:opacity-100 duration-300 border-gray-200 p-1 flex items-center"
                to="/home"
              >
                Buckets
              </Link>
            </li>
            {isAdmin && (<li className="p-1 flex items-center">
              <Link
                className="text-white opacity-75 hover:opacity-100 duration-300 border-gray-200 p-1 flex items-center"
                to="/users"
              >
                Users
              </Link>
            </li>)}
            {
              isAdmin && (
                <li className="p-1 flex items-center">
                  <Link
                    className="text-white opacity-75 hover:opacity-100 duration-300 border-gray-200 p-1 flex items-center"
                    to="/policies"
                  >
                    Policies
                  </Link>
                </li>)
            }
            <li className="p-1 flex items-center">
              {token && pathname !== '/login' && <LogoutButton />}
            </li>
          </ul>
        )}
        <div className="md:p-2">HUE</div>
      </div>
    </header>
  );
};

export default Header;
