import { api } from './api';
import type { ApiResponse, PaginatedResponse, Biodata } from '../types';

export interface BiodataFormData {
  appliedPosition: string;
  fullName: string;
  nationalIdNumber: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  religion: string;
  bloodType?: string;
  maritalStatus: string;
  ktpAddress: string;
  currentAddress: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  skills?: string;
  willingToBePlaced?: boolean;
  expectedSalary?: number;
  educationHistories?: object[];
  trainingHistories?: object[];
  employmentHistories?: object[];
}

export interface AdminBiodataQuery {
  page?: number;
  limit?: number;
  search?: string;
  appliedPosition?: string;
  latestEducation?: string;
}

/** Shape returned by all async mutation endpoints (HTTP 202) */
export interface JobEnqueuedResponse {
  jobId: string;
}

export const biodataService = {
  // ── Read (synchronous) ──────────────────────────────────────────────────

  async getMyBiodata(): Promise<Biodata> {
    const { data } = await api.get<ApiResponse<Biodata>>('/biodata');
    return data.data;
  },

  async getAdminBiodataList(query: AdminBiodataQuery = {}): Promise<PaginatedResponse<Biodata>> {
    const { data } = await api.get<PaginatedResponse<Biodata>>('/admin/biodata', {
      params: query,
    });
    return data;
  },

  async getAdminBiodataById(id: string): Promise<Biodata> {
    const { data } = await api.get<ApiResponse<Biodata>>(`/admin/biodata/${id}`);
    return data.data;
  },

  // ── Mutations (async — return jobId for polling) ─────────────────────────

  async createBiodata(payload: BiodataFormData): Promise<JobEnqueuedResponse> {
    const { data } = await api.post<ApiResponse<JobEnqueuedResponse>>('/biodata', payload);
    return data.data;
  },

  async updateBiodata(payload: BiodataFormData): Promise<JobEnqueuedResponse> {
    const { data } = await api.put<ApiResponse<JobEnqueuedResponse>>('/biodata', payload);
    return data.data;
  },

  async deleteBiodata(): Promise<JobEnqueuedResponse> {
    const { data } = await api.delete<ApiResponse<JobEnqueuedResponse>>('/biodata');
    return data.data;
  },

  async adminUpdateBiodata(id: string, payload: BiodataFormData): Promise<JobEnqueuedResponse> {
    const { data } = await api.put<ApiResponse<JobEnqueuedResponse>>(`/admin/biodata/${id}`, payload);
    return data.data;
  },

  async adminDeleteBiodata(id: string): Promise<JobEnqueuedResponse> {
    const { data } = await api.delete<ApiResponse<JobEnqueuedResponse>>(`/admin/biodata/${id}`);
    return data.data;
  },
};
