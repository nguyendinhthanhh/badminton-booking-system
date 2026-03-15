import axiosClient from "../axiosConfig/axiosConfig";

const racketService = {
  getAllRackets: async (page = 0, size = 10) => {
    const response = await axiosClient.get("/rackets", {
      params: { page, size },
    });
    return response.data;
  },

  getRacketById: async (id) => {
    const response = await axiosClient.get(`/rackets/${id}`);
    return response.data;
  },

  createRacket: async (payload) => {
    const response = await axiosClient.post("/rackets", payload);
    return response.data;
  },

  updateRacket: async (id, payload) => {
    const response = await axiosClient.put(`/rackets/${id}`, payload);
    return response.data;
  },

  deleteRacket: async (id) => {
    await axiosClient.delete(`/rackets/${id}`);
  },
};

export default racketService;
