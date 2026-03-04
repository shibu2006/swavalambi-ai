import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Star, FileText, Award, ShieldCheck, Bell, HelpCircle, LogOut, ChevronRight, Camera } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import FloatingAssistant from '../components/FloatingAssistant';
import { useProfilePictureUpload } from '../hooks/useProfilePictureUpload';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:8000/api";

const LEVEL_LABELS: Record<number, string> = {
  0: 'Beginner',
  1: 'Novice',
  2: 'Developing',
  3: 'Competent',
  4: 'Proficient',
  5: 'Expert',
};

const INTENT_LABELS: Record<string, string> = {
  job: 'Job Seeker',
  upskill: 'Skill Learner',
  loan: 'Entrepreneur',
};

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [skillRating, setSkillRating] = useState(0);
  const [intent, setIntent] = useState('job');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showReassessmentWarning, setShowReassessmentWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfilePicture, isUploading } = useProfilePictureUpload();

  const handleLogout = () => {
    // Clear all user data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  const handleReassessment = async () => {
    // Get user ID
    const userId = localStorage.getItem("swavalambi_user_id");
    
    // Clear chat history from DynamoDB if user is logged in
    if (userId) {
      try {
        await fetch(`${API_BASE}/users/${userId}/chat-history`, {
          method: 'DELETE'
        });
        console.log("[INFO] Cleared chat history from DynamoDB");
      } catch (error) {
        console.error("[ERROR] Failed to clear chat history:", error);
      }
    }
    
    // Clear session and profile data for fresh assessment
    sessionStorage.removeItem("swavalambi_session_id");
    localStorage.removeItem("swavalambi_skill_rating");
    localStorage.removeItem("swavalambi_intent");
    localStorage.removeItem("swavalambi_skill");
    // Add flag to indicate this is a reassessment
    sessionStorage.setItem("is_reassessment", "true");
    // Force full page reload to ensure clean state
    window.location.href = "/assistant?reassess=true";
  };

  useEffect(() => {
    // Start with localStorage values as immediate fallback
    const userId     = localStorage.getItem('swavalambi_user_id') || '';
    const localName  = localStorage.getItem('swavalambi_name') || '';
    const localSkill = localStorage.getItem('swavalambi_skill') || '';
    const localRating = parseInt(localStorage.getItem('swavalambi_skill_rating') || '0', 10);
    const localIntent = localStorage.getItem('swavalambi_intent') || 'job';
    const localProfilePic = localStorage.getItem('swavalambi_profile_picture');

    setName(localName);
    setSkill(localSkill);
    setSkillRating(localRating);
    setIntent(localIntent);
    if (localProfilePic) setProfilePicture(localProfilePic);

    // Fetch from DynamoDB if user is logged in
    if (userId && userId !== 'demo') {
      fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          if (data.name)         { setName(data.name); localStorage.setItem('swavalambi_name', data.name); }
          if (data.skill)        { setSkill(data.skill); localStorage.setItem('swavalambi_skill', data.skill); }
          if (data.skill_rating != null) { setSkillRating(data.skill_rating); localStorage.setItem('swavalambi_skill_rating', String(data.skill_rating)); }
          if (data.intent)       { setIntent(data.intent); localStorage.setItem('swavalambi_intent', data.intent); }
          if (data.profile_picture) { 
            setProfilePicture(data.profile_picture); 
            localStorage.setItem('swavalambi_profile_picture', data.profile_picture);
          }
        })
        .catch(() => {/* silently use localStorage fallback */});
    }
  }, []);

  // Migrate base64 images to S3
  useEffect(() => {
    const migrateBase64ToS3 = async () => {
      const profilePic = localStorage.getItem('swavalambi_profile_picture');
      const userId = localStorage.getItem('swavalambi_user_id');
      
      // Check if it's base64 (starts with data:image)
      if (profilePic && profilePic.startsWith('data:image') && userId && userId !== 'demo') {
        try {
          console.log('Migrating base64 profile picture to S3...');
          
          // Convert base64 to blob
          const response = await fetch(profilePic);
          const blob = await response.blob();
          const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
          
          // Upload to S3
          const result = await uploadProfilePicture(userId, file);
          
          if (result.success && result.url) {
            setProfilePicture(result.url);
            console.log('Successfully migrated to S3:', result.url);
          }
        } catch (error) {
          console.error('Migration failed:', error);
        }
      }
    };
    
    migrateBase64ToS3();
  }, [uploadProfilePicture]);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = localStorage.getItem('swavalambi_user_id');
    if (!userId || userId === 'demo') {
      alert('Please log in to upload profile picture');
      return;
    }

    console.log('Starting profile picture upload...', { userId, fileName: file.name, fileSize: file.size });

    const result = await uploadProfilePicture(userId, file);

    console.log('Upload result:', result);

    if (result.success && result.url) {
      console.log('Setting profile picture to:', result.url);
      setProfilePicture(result.url);
      // Force a re-render by also updating localStorage
      localStorage.setItem('swavalambi_profile_picture', result.url);
    } else {
      console.error('Upload failed:', result.error);
      alert(result.error || 'Failed to upload profile picture');
    }
  };

  const skillLabel   = skill ? skill.charAt(0).toUpperCase() + skill.slice(1) : 'Artisan';
  const levelLabel   = LEVEL_LABELS[skillRating] ?? 'Beginner';
  const roleLabel    = skill ? `Skilled ${skillLabel}` : 'Skilled Worker';
  const intentLabel  = INTENT_LABELS[intent] ?? 'Job Seeker';
  const displayName  = name || roleLabel;
  // Initials: first letter of real name, or skill, or 'A'
  const initials     = (name || skill || 'A').charAt(0).toUpperCase();

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
      <header className="flex items-center bg-background-light p-4 justify-between sticky top-0 z-10 border-b border-slate-200">
        <Link
          to="/home"
          className="text-slate-900 flex size-10 items-center justify-center cursor-pointer hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-bold leading-tight flex-1 text-center">Profile</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex items-center justify-center text-slate-900 hover:bg-slate-200 rounded-full p-2 transition-colors">
            <Settings size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {/* Avatar + name */}
        <section className="flex p-6">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              {/* Profile Picture with Upload Button */}
              <div className="relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureUpload}
                  accept="image/*"
                  className="hidden"
                />
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-primary/30 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/15 border-4 border-primary/30 flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-extrabold text-primary">{initials}</span>
                  </div>
                )}
                
                {/* Camera button overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  title="Change profile picture"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera size={20} />
                  )}
                </button>
              </div>
              
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-bold tracking-tight">{displayName}</p>
                <p className="text-slate-500 text-sm mt-0.5">{roleLabel}</p>
                <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <Star className="text-primary fill-current" size={16} />
                  <p className="text-primary text-sm font-semibold">
                    Level {skillRating} — {levelLabel}
                  </p>
                </div>
                <p className="text-slate-500 mt-2 text-base">{intentLabel}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => {
                  if (skillRating === 0) {
                    // First time assessment, no warning needed
                    handleReassessment();
                  } else {
                    // Show warning for reassessment
                    setShowReassessmentWarning(true);
                  }
                }}
                className="flex-1 text-center bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-md shadow-primary/20 transition-colors text-sm"
              >
                {skillRating === 0 ? 'Start Assessment' : 'Retake Assessment'}
              </button>
              <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3 rounded-xl border border-primary/20 transition-colors text-sm">
                Share Profile
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-xl text-center border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500">Skill Level</p>
            <p className="text-lg font-bold text-primary">{skillRating}/5</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500">Badges</p>
            <p className="text-lg font-bold text-primary">{skillRating > 0 ? skillRating : 0}</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500">Status</p>
            <p className="text-lg font-bold text-primary">{skillRating >= 3 ? '🔓' : '🔒'}</p>
          </div>
        </section>

        {/* Documents */}
        <section>
          <div className="flex items-center justify-between px-4 pb-4">
            <h3 className="text-lg font-bold">My Documents</h3>
            <button className="text-primary text-sm font-medium hover:underline">Add New</button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar">
            <div className="flex flex-col gap-2 min-w-[140px] group cursor-pointer">
              <div className="w-full aspect-[3/4] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FileText className="text-primary" size={48} />
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">PDF</span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate">Resume_Final.pdf</p>
                <p className="text-xs text-slate-500">Add your resume</p>
              </div>
            </div>

            <Link to="/certificate" className="flex flex-col gap-2 min-w-[140px] group cursor-pointer">
              <div className="w-full aspect-[3/4] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Award className="text-primary" size={48} />
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Cert</span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate">Skill Certificate</p>
                <p className="text-xs text-slate-500">{skillRating >= 3 ? 'View certificate' : 'Complete assessment'}</p>
              </div>
            </Link>

            <div className="flex flex-col gap-2 min-w-[140px] group cursor-pointer">
              <div className="w-full aspect-[3/4] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ShieldCheck className={skillRating >= 3 ? 'text-green-600' : 'text-slate-300'} size={48} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${skillRating >= 3 ? 'text-green-600 bg-green-100' : 'text-slate-400 bg-slate-100'}`}>
                  {skillRating >= 3 ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold truncate">ID Proof / KYC</p>
                <p className="text-xs text-slate-500">Aadhaar / PAN</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="mt-8 px-4 flex flex-col gap-2">
          <h3 className="text-lg font-bold mb-2">Account Settings</h3>
          <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm text-left w-full">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Star size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Skill & Assessment</p>
              <p className="text-xs text-slate-500">{skillLabel} · Level {skillRating}</p>
            </div>
            <ChevronRight className="text-slate-400 shrink-0" size={20} />
          </button>

          <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm text-left w-full">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Notification Settings</p>
              <p className="text-xs text-slate-500">App alerts and emails</p>
            </div>
            <ChevronRight className="text-slate-400 shrink-0" size={20} />
          </button>

          <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm text-left w-full">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Help & Support</p>
              <p className="text-xs text-slate-500">FAQ and Contact center</p>
            </div>
            <ChevronRight className="text-slate-400 shrink-0" size={20} />
          </button>

          <button
            onClick={handleLogout}
            type="button"
            style={{ cursor: 'pointer' }}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:bg-red-50 active:bg-red-100 transition-colors shadow-sm w-full mt-2 relative z-10"
          >
            <div className="size-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0" style={{ pointerEvents: 'none' }}>
              <LogOut size={20} />
            </div>
            <p className="font-semibold text-sm text-red-600 flex-1 text-left" style={{ pointerEvents: 'none' }}>Logout</p>
          </button>
        </section>
      </main>

      {/* Reassessment Warning Modal */}
      {showReassessmentWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
              Retake Assessment?
            </h3>
            
            <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
              Taking a new assessment will reset your current profile. All verification done for <span className="font-semibold text-primary">{skill || 'your profession'}</span> will be deleted and a fresh profile will be created.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-amber-800 font-medium">
                ⚠️ This action will:
              </p>
              <ul className="text-xs text-amber-700 mt-2 space-y-1 ml-4">
                <li>• Reset your skill level to 0</li>
                <li>• Clear your assessment history</li>
                <li>• Remove your current profession verification</li>
                <li>• Start a completely new assessment</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowReassessmentWarning(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowReassessmentWarning(false);
                  handleReassessment();
                }}
                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingAssistant />
      <BottomNav />
    </div>
  );
}
