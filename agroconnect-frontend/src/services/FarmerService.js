import api from "../api/axios";

export const getAllFarmers = () => {
    return api.get("/farmer");
};

export const addFarmer = (farmer) => {
    return api.post("/farmer", farmer);
};

export const getFarmerById = (id) => {
    return api.get(`/farmer/${id}`);
};

export const updateFarmer = (id, farmer) => {
    return api.put(`/farmer/${id}`, farmer);
};

export const deleteFarmer = (id) => {
    return api.delete(`/farmer/${id}`);
};