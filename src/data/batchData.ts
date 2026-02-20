export interface Video {
  _id: string;
  title: string;
  link: string;
  duration: number;
  type: string;
}

export interface Subject {
  _id: string;
  title: string;
  totalVideos: number;
}

export interface BatchData {
  _id: string;
  title: string;
  image: string;
  subjects: Subject[];
}

// Pre-loaded videos for Project (CSS) chapter
const projectCSSVideos: Video[] = [
  { _id: "67921a19badd1d13290502c0", title: "Setting up", link: "https://fast.wistia.com/embed/medias/uumslsrgnh.m3u8", duration: 467, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c1", title: "Basics", link: "https://fast.wistia.com/embed/medias/i9m0nxil2p.m3u8", duration: 679, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c2", title: "Layout", link: "https://fast.wistia.com/embed/medias/qluvhmth9f.m3u8", duration: 568, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c3", title: "Sidebar (Nav)", link: "https://fast.wistia.com/embed/medias/n1lcytsj79.m3u8", duration: 631, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c4", title: "Sidebar (Library)", link: "https://fast.wistia.com/embed/medias/tqck86m5nu.m3u8", duration: 592, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c5", title: "Library Boxes", link: "https://fast.wistia.com/embed/medias/8b38pqjuqb.m3u8", duration: 773, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c6", title: "Sticky Nav", link: "https://fast.wistia.com/embed/medias/9m1bu3b18m.m3u8", duration: 883, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c7", title: "Cards", link: "https://fast.wistia.com/embed/medias/a310mp3ijl.m3u8", duration: 815, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c8", title: "Footer Line", link: "https://fast.wistia.com/embed/medias/kzyrz2f7mt.m3u8", duration: 233, type: "VIDEO" },
  { _id: "67921a19badd1d13290502c9", title: "Setting up Player", link: "https://fast.wistia.com/embed/medias/v58myl86an.m3u8", duration: 428, type: "VIDEO" },
  { _id: "67921a19badd1d13290502ca", title: "Player Controls", link: "https://fast.wistia.com/embed/medias/cl4qr2kwch.m3u8", duration: 321, type: "VIDEO" },
  { _id: "67921a19badd1d13290502cb", title: "Playback Bar", link: "https://fast.wistia.com/embed/medias/b488wte9s2.m3u8", duration: 693, type: "VIDEO" },
  { _id: "67921a19badd1d13290502cc", title: "Tailwind CSS", link: "https://fast.wistia.com/embed/medias/3ae8dn0640.m3u8", duration: 45, type: "VIDEO" },
];

// Initialize localStorage with pre-loaded data
const initializePreloadedData = () => {
  const key = 'sigma6_videos_68dd6e77ef30c312e1493790';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(projectCSSVideos));
  }
};

// Call initialization
if (typeof window !== 'undefined') {
  initializePreloadedData();
}

export const getSubjectVideos = (subjectId: string): Video[] => {
  const key = `sigma6_videos_${subjectId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const saveSubjectVideos = (subjectId: string, videos: Video[]): void => {
  const key = `sigma6_videos_${subjectId}`;
  localStorage.setItem(key, JSON.stringify(videos));
};

export const clearSubjectVideos = (subjectId: string): void => {
  const key = `sigma6_videos_${subjectId}`;
  localStorage.removeItem(key);
};

export const batchData: BatchData = {
  _id: "sigma-6",
  title: "Sigma 6.0",
  image: "https://api.asia-se1.learnworlds.com/imagefile/https://lwfiles.mycourse.app/62a6cd5e1e9e2fbf212d608d-public/df1eebe6d544879f1ea440354f7b4060.jpg?client_id=62a6cd5e1e9e2fbf212d608d&width=400&height=0",
  subjects: [
    { _id: "68dd6e77ef30c312e1493782", title: "Introduction", totalVideos: 4 },
    { _id: "68dd6e77ef30c312e1493790", title: "Project (CSS)", totalVideos: 13 },
    { _id: "68dd6e77ef30c312e149379a", title: "JavaScript (Part 10)", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e14937a4", title: "Miscellaneous", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e14937b9", title: "Project - Phase 3 (Part b)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e1493783", title: "Prerequisites", totalVideos: 1 },
    { _id: "68dd6e77ef30c312e1493788", title: "CSS - Getting Started", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e149378e", title: "Mini Project (CSS)", totalVideos: 9 },
    { _id: "68dd6e77ef30c312e149379f", title: "Terminal", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e14937aa", title: "MongoDB (Part 1)", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e14937c4", title: "Tailwind", totalVideos: 7 },
    { _id: "68dd6e77ef30c312e149378d", title: "CSS - Part 6", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e1493791", title: "JavaScript (Part 1)", totalVideos: 21 },
    { _id: "68dd6e77ef30c312e1493798", title: "JavaScript (Part 8)", totalVideos: 13 },
    { _id: "68dd6e77ef30c312e149379e", title: "JavaScript (Part 13)", totalVideos: 4 },
    { _id: "68dd6e77ef30c312e14937a6", title: "Starting with SQL", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e14937a7", title: "SQL (Part 2)", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e14937ac", title: "MongoDB with Express", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e1493794", title: "JavaScript (Part 4)", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e14937a2", title: "Backend 2 (Node : Express)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e1493796", title: "JavaScript (Part 6)", totalVideos: 17 },
    { _id: "68dd6e77ef30c312e14937b2", title: "Database Relationships", totalVideos: 9 },
    { _id: "68dd6e77ef30c312e14937b3", title: "Project - Phase 2 (Part a)", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e14937bc", title: "React (Part 1)", totalVideos: 12 },
    { _id: "68dd6e77ef30c312e14937a1", title: "Backend 1 (Node.js)", totalVideos: 12 },
    { _id: "68dd6e77ef30c312e14937b8", title: "Project - Phase 3 (Part a)", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e14937bd", title: "React (Part 2)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e1493786", title: "HTML (Level 2)", totalVideos: 13 },
    { _id: "68dd6e77ef30c312e1493799", title: "JavaScript (Part 9)", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e14937b1", title: "Project - Phase 1 (Part c)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e14937b4", title: "Project - Phase 2 (Part b)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e14937c3", title: "React (Major-Project)", totalVideos: 6 },
    { _id: "68dd6e77ef30c312e149377f", title: "Welcome to Sigma 6.0!", totalVideos: 0 },
    { _id: "68dd6e77ef30c312e1493785", title: "HTML (Level 1) - Part B", totalVideos: 9 },
    { _id: "68dd6e77ef30c312e14937b0", title: "Backend 7 (Errors)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e1493780", title: "Join Telegram Channel!", totalVideos: 0 },
    { _id: "68dd6e77ef30c312e149378f", title: "Bootstrap", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e14937a0", title: "Git & Github", totalVideos: 20 },
    { _id: "68dd6e77ef30c312e14937a3", title: "Backend 3 (Node : EJS)", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e14937a5", title: "Backend 4 (REST)", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e14937ad", title: "Project - Phase 1 (Part a)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e14937c5", title: "Supplement : Redux & Redux Toolkit", totalVideos: 9 },
    { _id: "68dd6e77ef30c312e1493784", title: "HTML (Level 1) - Part A", totalVideos: 7 },
    { _id: "68dd6e77ef30c312e149378c", title: "CSS - Part 5", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e1493793", title: "JavaScript (Part 3)", totalVideos: 25 },
    { _id: "68dd6e77ef30c312e14937a8", title: "Backend 5 (Node with SQL)", totalVideos: 12 },
    { _id: "68dd6e77ef30c312e14937a9", title: "Installation of MongoDb", totalVideos: 0 },
    { _id: "68dd6e77ef30c312e14937af", title: "Backend 6 (Middlewares)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e14937b5", title: "Project - Phase 2 (Part c)", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e14937b6", title: "Project - Phase 2 (Part d)", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e14937ba", title: "Project - Phase 3 (Part c)", totalVideos: 5 },
    { _id: "68dd6e77ef30c312e1493787", title: "HTML (Level 3)", totalVideos: 16 },
    { _id: "68dd6e77ef30c312e1493797", title: "JavaScript (Part 7)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e149379c", title: "JavaScript (Part 11)", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e149379d", title: "JavaScript (Part 12)", totalVideos: 15 },
    { _id: "68dd6e77ef30c312e14937c0", title: "Miscellaneous", totalVideos: 0 },
    { _id: "68dd6e77ef30c312e14937c1", title: "React (Part 5)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e149378b", title: "CSS - Part 4", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e1493795", title: "JavaScript (Part 5)", totalVideos: 12 },
    { _id: "68dd6e77ef30c312e14937ae", title: "Project - Phase 1 (Part b)", totalVideos: 7 },
    { _id: "68dd6e77ef30c312e1493781", title: "Live Mentorship Sessions", totalVideos: 0 },
    { _id: "68dd6e77ef30c312e149378a", title: "CSS - Part 3", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e1493792", title: "JavaScript (Part 2)", totalVideos: 19 },
    { _id: "68dd6e77ef30c312e14937ab", title: "MongoDB (Part 2)", totalVideos: 13 },
    { _id: "68dd6e77ef30c312e14937bf", title: "React (Part 4)", totalVideos: 8 },
    { _id: "68dd6e77ef30c312e14937c6", title: "Certificate of Completion", totalVideos: 0 },
    { _id: "68dd6e77ef30c312e14937b7", title: "Project - Phase 2 (Part e)", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e14937bb", title: "Project - Phase 3 (Part d)", totalVideos: 6 },
    { _id: "68dd6e77ef30c312e1493789", title: "CSS - Part 2", totalVideos: 17 },
    { _id: "68dd6e77ef30c312e149379b", title: "JavaScript (Mini-Project)", totalVideos: 10 },
    { _id: "68dd6e77ef30c312e14937be", title: "React (Part 3)", totalVideos: 11 },
    { _id: "68dd6e77ef30c312e14937c2", title: "React (Part 6)", totalVideos: 9 },
  ],
};
