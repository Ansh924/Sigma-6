import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (userId: string) => void;
}

const USER_PIN = '8945';

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (pin === USER_PIN) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('sigma6_user_id', userId);
        localStorage.setItem('sigma6_user_login_time', Date.now().toString());
        
        // Log the login
        const logs = JSON.parse(localStorage.getItem('sigma6_admin_logs') || '[]');
        logs.push({
          type: 'login',
          userId,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        });
        localStorage.setItem('sigma6_admin_logs', JSON.stringify(logs));
        
        onLogin(userId);
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-purple-500/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-1">
            <img
              src="https://api.asia-se1.learnworlds.com/imagefile/https://lwfiles.mycourse.app/62a6cd5e1e9e2fbf212d608d-public/df1eebe6d544879f1ea440354f7b4060.jpg?client_id=62a6cd5e1e9e2fbf212d608d&width=400&height=0"
              alt="Sigma 6.0"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sigma 6.0</h1>
          <p className="text-sm mb-2">
            <span className="text-gray-400">by </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">@Invisiblebots</span>
          </p>
          <p className="text-gray-400 text-sm">Enter your access PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
              Access PIN
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-[0.5em]"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4 || isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Unlock Access
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Protected content • Powered by <span className="text-purple-400">@Invisiblebots</span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
