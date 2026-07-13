import API from "./axios";

// Talent submits task
export const submitTask = (taskId, formData) =>
  API.post(`/submissions/${taskId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Admin
export const fetchAllSubmissions = (page = 1, limit = 5) =>
  API.get("/submissions/admin/all", {
    params: { page, limit },
  });

export const fetchSubmission = (taskId) =>
  API.get(`/submissions/${taskId}`);

export const reviewSubmission = (id, reviewStatus) =>
  API.put(`/submissions/${id}/review`, {
    reviewStatus,
  });