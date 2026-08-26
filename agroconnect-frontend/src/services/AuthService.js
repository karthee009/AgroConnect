import api from "../api/axios";

export const loginUser = (loginData) => {
    return api.post("/auth/login", loginData);
};

export const registerUser = (registerData) => {
    return api.post("/auth/register", registerData);
};

export const getLoggedInUser = () => {
    return api.get("/auth/me");
};

export const logoutUser = () => {
    return api.post("/auth/logout");
};