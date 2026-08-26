import api from "../api/axios";

export const getAllLoans = () => {
    return api.get("/loan");
};

export const getLoanByfarmerId = (farmerid) => {
    return api.get(`/loan/farmer/${farmerid}`);
};

export const getLoanById = (loanid) => {
    return api.get(`/loan/loanbyid/${loanid}`);
};

export const getLoansByUserId = (userId) => {
    return api.get(`/loan/user/${userId}`);
};

export const addLoan = (farmerid, loan) => {
    return api.post(`/loan/farmer/${farmerid}`, loan);
};

export const updateLoan = (loanid, loan) => {
    return api.put(`/loan/updateloan/${loanid}`, loan);
};
export const deleteLoan = (loanId) => {
    return api.delete(`/loan/${loanId}`);
};