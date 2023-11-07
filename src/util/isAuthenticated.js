import Cookies from "js-cookie";

const isAuthenticated = Cookies.get('token');

export default isAuthenticated;
