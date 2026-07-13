import API from "./axios";

export const fetchAllTasks = (page = 1, limit = 2) =>
  API.get("/tasks", {
    params: { page, limit },
  });
export const fetchTaskById = (id) => API.get(`/tasks/${id}`);
export const createTask = (task) => API.post("/tasks", task);
export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const fetchTalents = () => API.get("/users/talents");