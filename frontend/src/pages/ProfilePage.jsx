import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, GraduationCap, Calendar, UserCheck, UserPlus, MessageSquare, Settings2 } from 'lucide-react';
import api from '../api/axiosInstance';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/posts/PostCard';
import { ProfileSkeleton, PostSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import { formatFullDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [tab, setTab] = useState('posts');
  const [showConnections, setShowConnections] = useState(false);
  const [connectionType, setConnectionType] = useState("followers");
  const [connections, setConnections] = useState([]);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setPostsLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/posts`),
        ]);
        const p = profileRes.data.user;
        setProfile(p);
        setStats(profileRes.data.stats || {});
        setFollowerCount(p.followers?.length || 0);
        setFollowing(p.followers?.some((f) => (f._id || f) === currentUser?._id));
        setPosts(postsRes.data.data || []);
      } catch {
        toast.error('User not found');
        navigate(-1);
      }
      setLoading(false);
      setPostsLoading(false);
    };
    fetch();
  }, [username]);

  const handleFollow = async () => {
    try {
      const res = await api.put(`/users/${profile._id}/follow`);
      setFollowing(res.data.following);
      setFollowerCount((c) => (res.data.following ? c + 1 : c - 1));
    } catch {
      toast.error('Action failed');
    }
  };

  const handleMessage = async () => {
    try {
      const res = await api.post('/chat/conversations', { userId: profile._id });
      navigate(`/chat/${res.data.conversation._id}`);
    } catch {
      toast.error('Could not start chat');
    }
  };
const openConnections = (type) => {
  setConnectionType(type);

  const list = type === "followers" ? profile.followers : profile.following;

  setConnections(list || []);
  setShowConnections(true);
};

  if (loading) return <div className="space-y-4 max-w-2xl"><ProfileSkeleton /></div>;
  if (!profile) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-br from-primary-400 via-primary-500 to-violet-600" />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <Avatar
              user={profile}
              size="xl"
              className="ring-4 ring-white dark:ring-slate-800"
            />
            <div className="flex gap-2 mt-2">
              {isOwnProfile ? (
                <Link to="/settings" className="btn-secondary gap-2">
                  <Settings2 className="w-4 h-4" /> Edit Profile
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleMessage}
                    className="btn-secondary gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button
                    onClick={handleFollow}
                    className={`gap-2 ${following ? "btn-secondary" : "btn-primary"}`}
                  >
                    {following ? (
                      <>
                        <UserCheck className="w-4 h-4" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Follow
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {profile.name}
          </h1>
          <p className="text-slate-500 text-sm">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
            {profile.college && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-primary-500" />
                {profile.college}
              </span>
            )}
            {profile.department && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                {profile.department}
              </span>
            )}
            {profile.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {profile.year}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Joined {formatFullDate(profile.createdAt)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
            {[
              { label: "Posts", value: stats.postsCount ?? posts.length },
              { label: "Notes", value: stats.notesCount ?? 0 },
              { label: "Followers", value: followerCount },
              { label: "Following", value: profile.following?.length ?? 0 },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === "Followers") openConnections("followers");
                  if (label === "Following") openConnections("following");
                }}
                className="text-center"
              >
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-slate-500">{label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content tabs */}
      <div className="flex gap-1 card p-1.5">
        {["posts", "about"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === "posts" && (
        <div className="space-y-4">
          {postsLoading && [1, 2].map((i) => <PostSkeleton key={i} />)}
          {!postsLoading && posts.map((p) => <PostCard key={p._id} post={p} />)}
          {!postsLoading && posts.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title="No posts yet"
              description={
                isOwnProfile
                  ? "You haven't posted anything yet."
                  : `${profile.name} hasn't posted yet.`
              }
            />
          )}
        </div>
      )}

      {/* About tab */}
      {tab === "about" && (
        <div className="card p-6 space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-white">About</h3>
          {[
            { label: "Full Name", value: profile.name },
            { label: "Username", value: `@${profile.username}` },
            { label: "Email", value: isOwnProfile ? profile.email : undefined },
            { label: "College", value: profile.college },
            { label: "Department", value: profile.department },
            { label: "Year", value: profile.year },
            { label: "Bio", value: profile.bio },
            { label: "Role", value: profile.role },
            { label: "Member since", value: formatFullDate(profile.createdAt) },
          ]
            .filter((i) => i.value)
            .map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <span className="text-sm text-slate-500 w-32 shrink-0">
                  {label}
                </span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">
                  {value}
                </span>
              </div>
            ))}
        </div>
      )}

      {showConnections && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold capitalize text-slate-900 dark:text-white">
                {connectionType}
              </h2>

              <button
                type="button"
                onClick={() => setShowConnections(false)}
                className="text-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto">
              {connections.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No {connectionType} yet.
                </p>
              ) : (
                connections.map((person) => (
                  <div
                    key={person._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      to={`/profile/${person.username}`}
                      onClick={() => setShowConnections(false)}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <Avatar user={person} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {person.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          @{person.username}
                        </p>
                      </div>
                    </Link>

                    {isOwnProfile && connectionType === "following" && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await api.put(
                              `/users/${person._id}/follow`,
                            );

                            if (res.data.following === false) {
                              setConnections((prev) =>
                                prev.filter((p) => p._id !== person._id),
                              );

                              setProfile((prev) => ({
                                ...prev,
                                following: prev.following.filter(
                                  (p) => p._id !== person._id,
                                ),
                              }));

                              toast.success("Unfollowed successfully");
                            }
                          } catch {
                            toast.error("Could not unfollow user");
                          }
                        }}
                        className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Unfollow
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
