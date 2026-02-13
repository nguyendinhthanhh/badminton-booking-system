import axiosClient from "../axiosConfig/axiosConfig";

const shuttlecockService = {
  getWarehouses: async () => {
    const response = await axiosClient.get("/warehouses");
    return response.data;
  },

  getShuttlecocksByWarehouse: async (warehouseId, page = 0, size = 20) => {
    const response = await axiosClient.get(
      `/products/warehouse/${warehouseId}/shuttlecocks`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  createShuttlecock: async (warehouseId, payload) => {
    const response = await axiosClient.post(
      `/products/warehouse/${warehouseId}/shuttlecocks`,
      payload
    );
    return response.data;
  },

  updateShuttlecock: async (warehouseId, productId, payload) => {
    await axiosClient.put(
      `/products/warehouse/${warehouseId}/shuttlecocks/${productId}`,
      payload
    );
  },

  deleteShuttlecock: async (warehouseId, productId) => {
    await axiosClient.delete(
      `/products/warehouse/${warehouseId}/shuttlecocks/${productId}`
    );
  },
};

export default shuttlecockService;
