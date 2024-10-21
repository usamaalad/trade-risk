import { STATUS } from "@/utils";
import api from "../middleware/middleware";

export const fetchRisk = async ({
  draft,
  createdBy,
  page,
  limit,
}: {
  draft?: boolean;
  createdBy?: boolean;
  page?: number;
  limit?: number;
}) => {
  try {
    const { data } = await api.get(`/risk/?page=${page}&limit=${limit}`);
    return data.data;
  } catch (error: any) {
    console.log(error);
    return error.response?.data?.message || "Something went wrong";
  }
};

export const fetchMyRisk = async ({
  draft,
  page,
  limit,
}: {
  draft?: boolean;
  createdBy?: boolean;
  page?: number;
  limit?: number;
}) => {
  try {
    const { data } = await api.get(
      `/risk/fetch-my-risks?page=${page}&draft=${draft || false}&limit=${limit}`
    );
    return data.data;
  } catch (error: any) {
    console.log(error);
    return error.response?.data?.message || "Something went wrong";
  }
};

export const fetchSingleRisk = async (id: string) => {
  try {
    const { data } = await api.get(`/risk/${id}`);

    return data.data;
  } catch (error: any) {
    console.log(error);
    return error.response?.data?.message || "Something went wrong";
  }
};

export const onCreateRisk = async (payload: any) => {
  try {
    const response = await api.post("/risk", payload);
    if (response.status === STATUS.UNPROCESSABLE_ENTITY)
      return { success: false, response: response.data.message };
    if (response.status === STATUS.BAD_REQUEST)
      return { success: false, response: response.data.message };

    return { success: true, response: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, response: (error as any).response.data.message };
  }
};

export const onUpdateRisk = async ({
  id,
  payload,
}: {
  payload: any;
  id: string;
}) => {
  try {
    const response = await api.put(`/risk/${id}`, payload);
    if (response.status === STATUS.UNPROCESSABLE_ENTITY)
      return { success: false, response: response.data.message };
    if (response.status === STATUS.BAD_REQUEST)
      return { success: false, response: response.data.message };

    return { success: true, response: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, response: (error as any).response.data.message };
  }
};

export const deleteRiskDraft = async (id: string) => {
  try {
    const response = await api.delete(`/risk/${id}`);

    return { success: true, response: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, response: (error as any).response.data.message };
  }
};
