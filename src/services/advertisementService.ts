// services/advertisementService.ts

import axiosInstance from '@/lib/axiosInstance';
import { Advertisement } from '@/app/(AdminPanel)/Advertisements/columns';

export interface CreateAdvertisementRequest {
  title: string;
  banner: File;
  target_url?: string;
}

export interface UpdateAdvertisementRequest {
  title?: string;
  banner?: File;
  target_url?: string;
}

export interface AdvertisementResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  data: Advertisement[];
}

export interface SingleAdvertisementResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  data: Advertisement;
}

class AdvertisementService {
  private readonly baseUrl = '/api/v1/advertisements';

  // Get all advertisements
  async getAdvertisements(): Promise<Advertisement[]> {
    try {
      const response = await axiosInstance.get<AdvertisementResponse>(this.baseUrl);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      throw error;
    }
  }

  // Create new advertisement
  async createAdvertisement(data: CreateAdvertisementRequest): Promise<Advertisement> {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('banner', data.banner);
      
      if (data.target_url) {
        formData.append('target_url', data.target_url);
      } else {
        formData.append('target_url', ''); // Send empty value as specified
      }

      const response = await axiosInstance.post<SingleAdvertisementResponse>(
        this.baseUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error creating advertisement:', error);
      throw error;
    }
  }

  // Update advertisement
  async updateAdvertisement(id: string, data: UpdateAdvertisementRequest): Promise<Advertisement> {
    try {
      const formData = new FormData();
      
      if (data.title) {
        formData.append('title', data.title);
      }
      
      if (data.banner) {
        formData.append('banner', data.banner);
      }
      
      if (data.target_url !== undefined) {
        formData.append('target_url', data.target_url || '');
      }

      const response = await axiosInstance.put<SingleAdvertisementResponse>(
        `${this.baseUrl}/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  }

  // Delete advertisement
  async deleteAdvertisement(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  }

  // Get single advertisement
  async getAdvertisement(id: string): Promise<Advertisement> {
    try {
      const response = await axiosInstance.get<SingleAdvertisementResponse>(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching advertisement:', error);
      throw error;
    }
  }
}

export const advertisementService = new AdvertisementService();