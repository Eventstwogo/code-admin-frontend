// lib/auth.ts
import axiosInstance from './axiosInstance';
import useStore from './Zustand';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  uid?: string | number;
  rid?: string | number;
  exp?: number;
  [key: string]: unknown;
}

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // First try the new logout endpoint with access token
    if (token) {
      try {
        await axiosInstance.post('/api/v1/admin/logout');
        console.log('Logout successful via /admin/logout');
      } catch (logoutError) {
        console.error('Error with /admin/logout, trying token revoke:', logoutError);
        
        // Fallback to token revoke if logout fails
        if (refreshToken) {
          await axiosInstance.post('/api/v1/admin/token/revoke', {
            refresh_token: refreshToken
          });
          console.log('Token revoked successfully');
        }
      }
    } else if (refreshToken) {
      // If no access token but have refresh token, revoke it
      await axiosInstance.post('/api/v1/admin/token/revoke', {
        refresh_token: refreshToken
      });
      console.log('Token revoked successfully');
    }
  } catch (error) {
    console.error('Error during logout process:', error);
    // Continue with logout even if server calls fail
  } finally {
    // Clear local storage and update store
    const { logout } = useStore.getState();
    logout();
    localStorage.removeItem('id');
    
    // Redirect to login page
    window.location.href = '/';
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload | null;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token || !refreshToken) return false;
    
    // Check if token is expired or will expire in the next 5 minutes
    const decoded = jwt.decode(token) as JWTPayload | null;
    if (!decoded || !decoded.exp) return false;
    
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    // Refresh if token expires in the next 5 minutes (300 seconds)
    if (timeUntilExpiry < 300) {
      const response = await axiosInstance.post('/api/v1/admin/token/refresh', {
        refresh_token: refreshToken
      });
      
      const { access_token, refresh_token: newRefreshToken, session_id } = response.data.data;
      
      // Update tokens in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('sessionId', session_id.toString());
      
      // Update the store with new token data
      const newDecoded = jwt.decode(access_token) as JWTPayload | null;
      if (newDecoded?.uid && newDecoded?.rid) {
        const { login } = useStore.getState();
        login(access_token, newRefreshToken, session_id.toString());
      }
      
      console.log('Token refreshed successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    await logoutUser();
    return false;
  }
};