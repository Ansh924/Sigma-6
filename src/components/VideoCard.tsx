interface Video {
  _id: string;
  title: string;
  link: string;
  duration: number;
  type: string;
}

interface VideoCardProps {
  video: Video;
  index: number;
  onClick: () => void;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const VideoCard = ({ video, index, onClick }: VideoCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:bg-gray-700/50 hover:scale-[1.02] border border-gray-700/50 hover:border-purple-500/50 group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs font-medium">
          {formatDuration(video.duration)}
        </div>

        {/* Index Badge */}
        <div className="absolute top-2 left-2 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {index + 1}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{video.type}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
