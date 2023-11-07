import Cookies from 'js-cookie';

export const getToken = () => {
    return Cookies.get('token');
};

export const getTokenValue = (tokenHeader) => {
    const tokenRegex = /token=([^;]+)/;
    const matches = tokenHeader.match(tokenRegex);
    console.log(matches)
    return matches ? matches[1] : null;
  };