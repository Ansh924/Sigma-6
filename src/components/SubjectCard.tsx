interface Subject {
  _id: string;
  title: string;
  totalVideos: number;
}

interface SubjectCardProps {
  subject: Subject;
  index: number;
  onClick: () => void;
  hasContent?: boolean;
}

const SubjectCard = ({ subject, index, onClick, hasContent = false }: SubjectCardProps) => {
  const hasVideos = subject.totalVideos > 0 || hasContent;

  return (
    <div
      onClick={onClick}
      className={`relative bg-gray-800/50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700/50 hover:scale-[1.02] border border-gray-700/50 hover:border-purple-500/50 group ${
        !hasVideos ? 'opacity-60' : ''
      }`}
    >
      {/* Index Badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
        {index + 1}
      </div>

      {/* Content Loaded Badge */}
      {hasContent && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 rounded-full text-white text-xs font-medium shadow-lg">
          Loaded
        </div>
      )}

      {/* Title */}
      <h3 className="text-white font-medium mt-2 mb-3 pr-8 line-clamp-2 group-hover:text-purple-300 transition-colors">
        {subject.title}
      </h3>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{subject.totalVideos} videos</span>
        </div>
      </div>

      {/* Coming Soon Badge */}
      {!hasVideos && (
        <div className="mt-3 text-xs text-yellow-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Coming Soon
        </div>
      )}

      {/* Arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default SubjectCard;
