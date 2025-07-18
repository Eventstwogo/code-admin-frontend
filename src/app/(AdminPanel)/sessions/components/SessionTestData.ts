import { Session } from '../types';

export const mockSessionData: Session[] = [
  {
    id: 1,
    user_id: "user123",
    device_type: "Desktop",
    browser: "Chrome 120.0.0.0",
    ip_address: "192.168.1.100",
    location: "New York, US",
    last_activity: "2024-01-15T10:30:00Z",
    created_at: "2024-01-15T08:00:00Z",
    is_active: true,
    is_current: true
  },
  {
    id: 2,
    user_id: "user123",
    device_type: "Mobile",
    browser: "Safari 17.0",
    ip_address: "10.0.0.1",
    location: "California, US",
    last_activity: "2024-01-14T15:45:00Z",
    created_at: "2024-01-14T14:00:00Z",
    is_active: false,
    is_current: false
  },
  {
    id: 3,
    user_id: "user123",
    device_type: "Tablet",
    browser: "Firefox 121.0",
    ip_address: "172.16.0.1",
    location: "London, UK",
    last_activity: "2024-01-13T09:15:00Z",
    created_at: "2024-01-13T09:00:00Z",
    is_active: true,
    is_current: false
  },
  {
    id: 4,
    user_id: "user456",
    device_type: null,
    browser: null,
    ip_address: null,
    location: null,
    last_activity: null,
    created_at: "2024-01-12T12:00:00Z",
    is_active: false,
    is_current: false
  }
];

export const mockEmptyResponse = {
  statusCode: 200,
  message: "Sessions retrieved successfully",
  data: {
    sessions: []
  }
};

export const mockSuccessResponse = {
  statusCode: 200,
  message: "Sessions retrieved successfully",
  data: {
    sessions: mockSessionData,
    pagination: {
      total: 4,
      page: 1,
      limit: 10,
      total_pages: 1
    }
  }
};

export const mockTerminateResponse = {
  statusCode: 200,
  message: "Session terminated successfully",
  data: {
    terminated_count: 1,
    success: true
  }
};

export const mockTerminateAllResponse = {
  statusCode: 200,
  message: "All sessions terminated successfully",
  data: {
    terminated_count: 3,
    success: true
  }
};

export const mockErrorResponse = {
  statusCode: 400,
  message: "User not found",
  data: null
};