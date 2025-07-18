# Session Management Module

This module provides comprehensive session management capabilities for administrators to monitor and control user sessions across the platform, including personal session management.

## Features

### 1. Session Overview
- **Statistics Dashboard**: Shows total sessions, active sessions, inactive sessions, and unique users
- **Real-time Updates**: Refresh functionality to get latest session data
- **User-specific Views**: Search and filter sessions by user ID

### 2. Session Monitoring
- **Device Information**: Display device type (Desktop, Mobile, Tablet) with appropriate icons
- **Location Tracking**: Shows user location (if available)
- **Browser Information**: Browser and version details
- **IP Address**: User's IP address
- **Activity Timestamps**: Last activity and session creation time
- **Status Indicators**: Visual badges for active/inactive sessions

### 3. Session Management
- **Individual Termination**: Terminate specific sessions
- **Bulk Termination**: Terminate all sessions for a user
- **Current Session Protection**: Option to keep current session when terminating all
- **Confirmation Dialogs**: Safety prompts before terminating sessions

### 4. Advanced Filtering
- **Active Only Filter**: Toggle between active sessions and all sessions
- **Limit Control**: Set maximum number of sessions to display
- **Search by User ID**: Find sessions for specific users

## API Endpoints Used

### Admin Session Management (Any User)

#### GET /api/v1/admin/sessions/
- **Purpose**: Retrieve user sessions
- **Parameters**: 
  - `user_id` (required): User ID to search sessions for
  - `active_only` (optional): Filter for active sessions only (default: true)
  - `limit` (optional): Maximum number of sessions to return (default: 10)

#### DELETE /api/v1/admin/sessions/{session_id}
- **Purpose**: Terminate a specific session
- **Parameters**:
  - `session_id` (path): ID of the session to terminate
  - `user_id` (query): User ID for verification

#### DELETE /api/v1/admin/sessions/
- **Purpose**: Terminate all user sessions
- **Parameters**:
  - `user_id` (query): User ID whose sessions to terminate
  - `keep_current` (query): Whether to keep current session (default: true)

### Personal Session Management (Current User)

#### GET /api/v1/admin/me/sessions/
- **Purpose**: Get all sessions for the current user
- **Parameters**: 
  - `active_only` (optional): Filter for active sessions only (default: true)
  - `limit` (optional): Maximum number of sessions to return (default: 10)

#### DELETE /api/v1/admin/me/sessions/{session_id}
- **Purpose**: Terminate a specific session for the current user
- **Parameters**:
  - `session_id` (path): ID of the session to terminate

#### DELETE /api/v1/admin/me/sessions/
- **Purpose**: Terminate all sessions for the current user except the current one
- **Parameters**:
  - `keep_current` (query): Whether to keep current session (default: true)

## Pages

- **`/sessions`** - Main session management page for administrators to manage any user's sessions
- **`/sessions/my-sessions`** - Personal session management page for current user

## Component Structure

```
sessions/
├── page.tsx                 # Main admin session management page
├── my-sessions/
│   └── page.tsx            # Personal session management page
├── types.ts                 # TypeScript type definitions
├── utils.ts                 # Utility functions
├── hooks/
│   ├── index.ts            # Hook exports
│   ├── useSessionManagement.ts   # Admin session management operations
│   └── useMySessionManagement.ts # Personal session management operations
└── components/
    ├── index.ts            # Component exports
    ├── SessionTable.tsx    # Sessions table component (supports both admin and personal views)
    ├── SessionStats.tsx    # Statistics cards component
    ├── SessionFilters.tsx  # Search and filter component
    └── TerminateDialogs.tsx # Termination confirmation dialogs (supports both contexts)
```

## Usage

### Admin Session Management (`/sessions`)

1. **Navigate to Sessions**: Click on "Sessions" in the admin sidebar
2. **Search for User**: Enter a user ID in the search field
3. **Apply Filters**: Toggle active-only mode and set display limit
4. **View Sessions**: Browse session details in the table
5. **Manage Sessions**: Use dropdown actions to terminate individual sessions
6. **Bulk Actions**: Use "Terminate All" button for bulk session termination
7. **Access Personal Sessions**: Click "My Sessions" button to manage your own sessions

### Personal Session Management (`/sessions/my-sessions`)

1. **Navigate to My Sessions**: Click "My Sessions" from the main sessions page
2. **Apply Filters**: Toggle active-only mode and set display limit
3. **View Your Sessions**: Browse your session details in the table
4. **Manage Your Sessions**: Use dropdown actions to terminate individual sessions
5. **Bulk Actions**: Use "Terminate All" button to terminate all your sessions
6. **Return to Admin View**: Click "Back to All Sessions" to return to admin view

## Security Considerations

- All session operations require admin authentication
- Confirmation dialogs prevent accidental terminations
- Current session protection prevents admin lockout
- Audit trail through toast notifications
- Error handling for API failures

## Performance Features

- Pagination support through limit parameter
- Loading states for better UX
- Efficient data fetching with proper caching
- Responsive design for mobile devices
- Error boundaries for graceful failure handling

## Future Enhancements

- Real-time session monitoring with WebSocket
- Advanced filtering by device type, location, etc.
- Session duration analytics
- Export functionality for session data
- Session history tracking
- Geographic session mapping