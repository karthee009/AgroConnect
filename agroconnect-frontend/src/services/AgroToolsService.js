import api from "../api/axios";

export const getMarketPrices = (params = {}) => api.get("/agri-info/market-prices", { params });
export const getSchemes = () => api.get("/agri-info/schemes");
export const getFarmFinance = (farmerId) => api.get(`/finance/farmer/${farmerId}`);
export const addFarmTransaction = (farmerId, transaction) => api.post(`/finance/farmer/${farmerId}`, transaction);
export const deleteFarmTransaction = (id) => api.delete(`/finance/${id}`);
export const checkLoanAffordability = (farmerId, values) => api.post(`/eligibility/farmer/${farmerId}`, values);
export const getEligibilityChecklist = () => api.get("/eligibility/documents-checklist");
export const getLoanHistory = (loanId) => api.get(`/loan-history/${loanId}`);
export const getLoanDocuments = (loanId) => api.get(`/loan-documents/loan/${loanId}`);
export const uploadLoanDocument = (loanId, file) => {
  const body = new FormData();
  body.append("file", file);
  return api.post(`/loan-documents/loan/${loanId}`, body);
};
export const downloadLoanDocument = (documentId) => api.get(`/loan-documents/${documentId}/download`, { responseType: "blob" });
