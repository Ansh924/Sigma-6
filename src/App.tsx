import { useState, useEffect } from 'react';
import { batchData, getSubjectVideos, saveSubjectVideos, clearSubjectVideos } from './data/batchData';
import SubjectCard from './components/SubjectCard';
import VideoCard from './components/VideoCard';
import VideoPlayer from './components/VideoPlayer';
import AddContentModal from './components/AddContentModal';
import LoginModal from './components/LoginModal';
import AdminPortal from './components/AdminPortal';

interface Video {
  _id: string;
  title: string;
  link: string;
  duration: number;
  type: string;
}

interface Subject {
  _id: string;
  title: string;
  totalVideos: number;
}

type View = 'batch' | 'subject' | 'video';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setUserId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('batch');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectVideos, setSubjectVideos] = useState<Video[]>([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

  // Check if user is already logged in
  useEffect(() => {
    const savedUserId = localStorage.getItem('sigma6_user_id');
    if (savedUserId) {
      setUserId(savedUserId);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (newUserId: string) => {
    setUserId(newUserId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    const currentUserId = localStorage.getItem('sigma6_user_id');
    if (currentUserId) {
      const logs = JSON.parse(localStorage.getItem('sigma6_admin_logs') || '[]');
      logs.push({
        type: 'logout',
        userId: currentUserId,
        timestamp: Date.now()
      });
      localStorage.setItem('sigma6_admin_logs', JSON.stringify(logs));
    }
    localStorage.removeItem('sigma6_user_id');
    localStorage.removeItem('sigma6_user_login_time');
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentView('batch');
  };

  const handleSubjectClick = (subject: Subject) => {
    const videos = getSubjectVideos(subject._id);
    setSelectedSubject(subject);
    setSubjectVideos(videos);
    setCurrentView('subject');
  };

  const handleVideoClick = (index: number) => {
    setSelectedVideoIndex(index);
    setCurrentView('video');
  };

  const handleBackToBatch = () => {
    setCurrentView('batch');
    setSelectedSubject(null);
    setSubjectVideos([]);
  };

  const handleCloseVideo = () => {
    setCurrentView('subject');
  };

  const handleNextVideo = () => {
    if (selectedVideoIndex < subjectVideos.length - 1) {
      setSelectedVideoIndex(selectedVideoIndex + 1);
    }
  };

  const handlePreviousVideo = () => {
    if (selectedVideoIndex > 0) {
      setSelectedVideoIndex(selectedVideoIndex - 1);
    }
  };

  const handleContentAdded = (videos: Video[]) => {
    if (selectedSubject) {
      saveSubjectVideos(selectedSubject._id, videos);
      setSubjectVideos(videos);
      setContentVersion(v => v + 1);
    }
  };

  const handleClearContent = () => {
    if (selectedSubject) {
      clearSubjectVideos(selectedSubject._id);
      setSubjectVideos([]);
      setContentVersion(v => v + 1);
    }
  };

  const hasLoadedContent = (subjectId: string) => {
    const videos = getSubjectVideos(subjectId);
    return videos.length > 0;
  };

  const totalVideos = batchData.subjects.reduce((sum, s) => sum + s.totalVideos, 0);

  // Show login modal if not logged in
  if (!isLoggedIn) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Batch Overview */}
      {currentView === 'batch' && (
        <>
          {/* Header */}
          <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                    <img
                      src={batchData.image}
                      alt={batchData.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{batchData.title}</h1>
                    <p className="text-sm">
                      <span className="text-gray-400">by </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">@Invisiblebots</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAdminPortal(true)}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                    title="Admin Portal"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Stats Bar */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                <div className="text-3xl font-bold text-white">{batchData.subjects.length}</div>
                <div className="text-purple-300 text-sm">Chapters</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                <div className="text-3xl font-bold text-white">{totalVideos}</div>
                <div className="text-blue-300 text-sm">Videos</div>
              </div>
            </div>

            {/* Subject Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" key={contentVersion}>
              {batchData.subjects.map((subject, index) => (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  index={index}
                  onClick={() => handleSubjectClick(subject)}
                  hasContent={hasLoadedContent(subject._id)}
                />
              ))}
            </div>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-gray-700/50">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                    @Invisiblebots
                  </span>
                </div>
                <p className="text-gray-500 text-sm text-center">
                  Premium Learning Platform • Made with ❤️ by @Invisiblebots
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </>
      )}

      {/* Subject View */}
      {currentView === 'subject' && selectedSubject && (
        <>
          {/* Header */}
          <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToBatch}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-white">{selectedSubject.title}</h1>
                    <p className="text-gray-400 text-sm">
                      {subjectVideos.length} videos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddContent(true)}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {subjectVideos.length > 0 ? 'Manage Content' : 'Add Content'}
                </button>
              </div>
            </div>
          </header>

          {/* Video Grid */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            {subjectVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subjectVideos.map((video, index) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    index={index}
                    onClick={() => handleVideoClick(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Content Available</h3>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  This chapter doesn't have any videos yet. Add content using the button above.
                </p>
                <button
                  onClick={() => setShowAddContent(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Content
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Video Player */}
      {currentView === 'video' && subjectVideos[selectedVideoIndex] && (
        <VideoPlayer
          video={subjectVideos[selectedVideoIndex]}
          onClose={handleCloseVideo}
          onNext={handleNextVideo}
          onPrevious={handlePreviousVideo}
          hasNext={selectedVideoIndex < subjectVideos.length - 1}
          hasPrevious={selectedVideoIndex > 0}
        />
      )}

      {/* Add Content Modal */}
      {showAddContent && selectedSubject && (
        <AddContentModal
          subjectId={selectedSubject._id}
          subjectTitle={selectedSubject.title}
          onClose={() => setShowAddContent(false)}
          onContentAdded={handleContentAdded}
          onClearContent={handleClearContent}
          hasExistingContent={subjectVideos.length > 0}
        />
      )}

      {/* Admin Portal */}
      {showAdminPortal && (
        <AdminPortal onClose={() => setShowAdminPortal(false)} />
      )}
    </div>
  );
}

export default App;
