import React, { useState, useEffect } from 'react';

interface LogEntry {
  type: 'login' | 'video_start' | 'video_pause' | 'logout';
  userId: string;
  timestamp: number;
  videoId?: string;
  videoTitle?: string;
  userAgent?: string;
  progress?: number;
}

interface AdminPortalProps {
  onClose: () => void;
}

const ADMIN_PIN = '6780';

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');

  useEffect(() => {
    if (isAuthenticated) {
      loadLogs();
    }
  }, [isAuthenticated]);

  const loadLogs = () => {
    const savedLogs = JSON.parse(localStorage.getItem('sigma6_admin_logs') || '[]');
    setLogs(savedLogs.sort((a: LogEntry, b: LogEntry) => b.timestamp - a.timestamp));
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin PIN');
      setPin('');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUniqueUsers = () => {
    const loginLogs = logs.filter(log => log.type === 'login');
    const uniqueUsers = new Map<string, LogEntry>();
    loginLogs.forEach(log => {
      if (!uniqueUsers.has(log.userId)) {
        uniqueUsers.set(log.userId, log);
      }
    });
    return Array.from(uniqueUsers.values());
  };

  const getUserActivity = (userId: string) => {
    return logs.filter(log => log.userId === userId);
  };

  const removeUser = (userId: string) => {
    if (confirm('Are you sure you want to remove this user and all their activity logs?')) {
      // Remove all logs for this user
      const updatedLogs = logs.filter(log => log.userId !== userId);
      localStorage.setItem('sigma6_admin_logs', JSON.stringify(updatedLogs));
      
      // Remove video progress for this user
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sigma6_progress_') && key.includes(userId)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reload logs
      setLogs(updatedLogs);
    }
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      localStorage.setItem('sigma6_admin_logs', '[]');
      setLogs([]);
    }
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Mobile')) return '📱 Mobile';
    if (userAgent.includes('Tablet')) return '📱 Tablet';
    return '💻 Desktop';
  };

  const getBrowserInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Admin Portal</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter admin PIN"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors"
            >
              Access Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  const uniqueUsers = getUniqueUsers();
  const totalVideoWatches = logs.filter(log => log.type === 'video_start').length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Admin Portal</h2>
            <p className="text-sm mt-1">
              <span className="text-gray-400">Powered by </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">@Invisiblebots</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-gray-700">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4">
            <div className="text-3xl font-bold text-white">{uniqueUsers.length}</div>
            <div className="text-purple-300 text-sm">Total Users</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4">
            <div className="text-3xl font-bold text-white">{logs.filter(l => l.type === 'login').length}</div>
            <div className="text-blue-300 text-sm">Total Logins</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4">
            <div className="text-3xl font-bold text-white">{totalVideoWatches}</div>
            <div className="text-green-300 text-sm">Videos Watched</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Users ({uniqueUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Activity Log ({logs.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'users' ? (
            <div className="space-y-4">
              {uniqueUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>No users logged in yet</p>
                </div>
              ) : (
                uniqueUsers.map((user, index) => {
                  const userActivity = getUserActivity(user.userId);
                  const videoCount = userActivity.filter(a => a.type === 'video_start').length;
                  
                  return (
                    <div key={user.userId} className="bg-gray-700/50 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-white font-medium">User #{index + 1}</p>
                              <p className="text-gray-400 text-xs">{user.userId.slice(0, 20)}...</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <p className="text-gray-300 text-sm">{getDeviceInfo(user.userAgent)}</p>
                            <p className="text-gray-500 text-xs">{getBrowserInfo(user.userAgent)}</p>
                          </div>
                          <button
                            onClick={() => removeUser(user.userId)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                            title="Remove User"
                          >
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">First Login:</span>
                          <span className="text-white ml-2">{formatDate(user.timestamp)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Videos Watched:</span>
                          <span className="text-white ml-2">{videoCount}</span>
                        </div>
                      </div>
                      {videoCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-xs mb-2">Recent Videos:</p>
                          <div className="flex flex-wrap gap-2">
                            {userActivity
                              .filter(a => a.type === 'video_start')
                              .slice(0, 5)
                              .map((activity, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                  {activity.videoTitle?.slice(0, 20) || 'Unknown'}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No activity logged yet</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.type === 'login' ? 'bg-green-500/20 text-green-400' :
                      log.type === 'video_start' ? 'bg-blue-500/20 text-blue-400' :
                      log.type === 'logout' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {log.type === 'login' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      )}
                      {log.type === 'video_start' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {log.type === 'logout' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        {log.type === 'login' && 'User logged in'}
                        {log.type === 'video_start' && `Started watching: ${log.videoTitle || 'Unknown'}`}
                        {log.type === 'logout' && 'User logged out'}
                        {log.type === 'video_pause' && `Paused: ${log.videoTitle || 'Unknown'}`}
                      </p>
                      <p className="text-gray-500 text-xs">{log.userId.slice(0, 25)}...</p>
                    </div>
                    <div className="text-gray-400 text-xs text-right">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Clear All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
