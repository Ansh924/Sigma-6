import React, { useState } from 'react';

interface Video {
  _id: string;
  title: string;
  link: string;
  duration: number;
  type: string;
}

interface AddContentModalProps {
  subjectId: string;
  subjectTitle: string;
  onClose: () => void;
  onContentAdded: (videos: Video[]) => void;
  onClearContent?: () => void;
  hasExistingContent?: boolean;
}

const CONTENT_PIN = '6780';

const AddContentModal: React.FC<AddContentModalProps> = ({
  subjectId,
  subjectTitle,
  onClose,
  onContentAdded,
  onClearContent,
  hasExistingContent = false,
}) => {
  const [step, setStep] = useState<'pin' | 'content' | 'clear-pin'>('pin');
  const [pin, setPin] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CONTENT_PIN) {
      setStep('content');
      setError('');
      setPin('');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleClearPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CONTENT_PIN) {
      if (onClearContent) {
        onClearContent();
      }
      onClose();
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const parsed = JSON.parse(jsonContent);

      // Validate the JSON structure
      if (parsed.status !== 200) {
        throw new Error('Invalid response status. Expected status: 200');
      }

      if (!parsed.data || !parsed.data.chapters || !Array.isArray(parsed.data.chapters)) {
        throw new Error('Invalid JSON structure. Expected data.chapters array.');
      }

      if (parsed.data.subject_id !== subjectId) {
        throw new Error(`Subject ID mismatch. Expected: ${subjectId}, Got: ${parsed.data.subject_id}`);
      }

      // Transform chapters to videos
      const videos: Video[] = parsed.data.chapters.map((chapter: {
        _id: string;
        title: string;
        link: string;
        duration: number;
        type: string;
      }) => ({
        _id: chapter._id,
        title: chapter.title,
        link: chapter.link,
        duration: chapter.duration || 0,
        type: chapter.type || 'VIDEO',
      }));

      if (videos.length === 0) {
        throw new Error('No videos found in the JSON content.');
      }

      onContentAdded(videos);
      onClose();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startClearContent = () => {
    setStep('clear-pin');
    setPin('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              {step === 'clear-pin' ? 'Clear Content' : 'Add Content'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{subjectTitle}</p>
            <p className="text-xs mt-1">
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

        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xl tracking-widest"
                autoFocus
              />
              <p className="text-gray-500 text-xs mt-2 text-center">
                Enter the content management PIN to continue
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pin.length !== 4}
                className="flex-1 py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify PIN
              </button>
            </div>

            {hasExistingContent && (
              <button
                type="button"
                onClick={startClearContent}
                className="w-full py-3 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors mt-2"
              >
                Clear Existing Content
              </button>
            )}
          </form>
        )}

        {step === 'clear-pin' && (
          <form onSubmit={handleClearPinSubmit} className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-400 font-medium">Warning</p>
                  <p className="text-red-300 text-sm">This will remove all videos from this chapter.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter PIN to confirm
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-xl tracking-widest"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('pin');
                  setPin('');
                  setError('');
                }}
                className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={pin.length !== 4}
                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Content
              </button>
            </div>
          </form>
        )}

        {step === 'content' && (
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paste JSON Content
              </label>
              <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                placeholder='{"status": 200, "data": {"subject_id": "...", "chapters": [...]}}'
                rows={12}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
                autoFocus
              />
              <p className="text-gray-500 text-xs mt-2">
                Expected format: JSON with status: 200 and data.chapters array matching subject_id: {subjectId.slice(0, 15)}...
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('pin');
                  setJsonContent('');
                  setError('');
                }}
                className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!jsonContent.trim() || isLoading}
                className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add Videos
                  </>
                )}
              </button>
            </div>

            {hasExistingContent && (
              <button
                type="button"
                onClick={startClearContent}
                className="w-full py-3 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors"
              >
                Clear Existing Content Instead
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default AddContentModal;
