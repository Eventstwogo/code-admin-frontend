export type Session = {
  id: number;
  user_id: string;
  device_type: string | null;
  browser: string | null;
  ip_address: string | null;
  location: string | null;
  last_activity: string | null;
  created_at: string | null;
  is_active: boolean;
  is_current?: boolean;
};

export type SessionStats = {
  total_sessions: number;
  active_sessions: number;
  inactive_sessions: number;
  unique_users: number;
};

export type SessionListResponse = {
  statusCode: number;
  message: string;
  data: {
    sessions: Session[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
};

export type SessionTerminateResponse = {
  statusCode: number;
  message: string;
  data: {
    terminated_count: number;
    success: boolean;
  };
};

export type SessionFilters = {
  user_id: string;
  active_only: boolean;
  limit: number;
};