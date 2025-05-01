import { useEffect, useState } from "react";
import { Edit, Camera, X, Check, MessageSquare, Users, Bookmark, Settings } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    profilePicture: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("API has been called");
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch profile data");
        }
        
        const json = await res.json();
        setUser(json);
        setEditForm({
          username: json.username || "",
          bio: json.bio || "",
          profilePicture: null
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditForm({
        username: user.username || "",
        bio: user.bio || "",
        profilePicture: null
      });
      setPreviewUrl(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append("username", editForm.username);
      formData.append("bio", editForm.bio);
      if (editForm.profilePicture) {
        formData.append("profilePicture", editForm.profilePicture);
      }
      
      const res = await fetch(`${REACT_APP_API_URL}/api/profile/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      
      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      
      const updatedUser = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">{error}</p>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-center">No user data found</div>
      </div>
    );
  }

  const coverImage = user.coverPicture || "/api/placeholder/1200/300";
  const profileImage = previewUrl || user.profilePicture || "/api/placeholder/200/200";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="relative bg-white shadow-md rounded-b-lg overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500">
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <div className="absolute bottom-4 right-4">
              <label className="cursor-pointer bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
                <Camera size={20} className="text-gray-700" />
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          )}
        </div>

        {/* Profile Picture */}
        <div className="absolute top-36 left-6">
          <div className="relative">
            <img
              src={profileImage}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 cursor-pointer bg-blue-500 p-1 rounded-full shadow-md hover:bg-blue-600">
                <Camera size={16} className="text-white" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* User Info Section */}
        <div className="pt-16 pb-4 px-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded w-full"
                  placeholder="Username"
                />
              </div>
              <div>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  className="w-full h-20 bg-gray-100 px-2 py-1 rounded text-gray-700 resize-none"
                  placeholder="Write something about yourself..."
                />
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800">{user.username}</h1>
              <p className="text-gray-500">@{user.username}</p>
              <p className="mt-2 text-gray-700">{user.bio || "No bio yet."}</p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-36 right-6 flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white p-2 rounded-full shadow-md hover:bg-green-600 transition"
                title="Save changes"
              >
                <Check size={20} />
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition"
                title="Cancel editing"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditToggle}
                className="bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition"
                title="Edit profile"
              >
                <Edit size={20} />
              </button>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-purple-600 transition">
                Follow
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white shadow-md mt-4 px-6 py-4 flex justify-around rounded-lg">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">{user.stats?.posts || 0}</h2>
          <p className="text-gray-500">Posts</p>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">{user.stats?.followers || 0}</h2>
          <p className="text-gray-500">Followers</p>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">{user.stats?.following || 0}</h2>
          <p className="text-gray-500">Following</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 bg-white shadow-md rounded-lg">
        <div className="flex border-b">
          <button className="px-6 py-3 border-b-2 border-blue-500 text-blue-500 font-medium flex items-center">
            <MessageSquare size={18} className="mr-2" />
            Posts
          </button>
          <button className="px-6 py-3 text-gray-600 hover:text-blue-500 font-medium flex items-center">
            <Users size={18} className="mr-2" />
            Friends
          </button>
          <button className="px-6 py-3 text-gray-600 hover:text-blue-500 font-medium flex items-center">
            <Bookmark size={18} className="mr-2" />
            Saved
          </button>
          <button className="px-6 py-3 text-gray-600 hover:text-blue-500 font-medium flex items-center">
            <Settings size={18} className="mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mt-6 max-w-3xl mx-auto px-4">
        {user.posts && user.posts.length > 0 ? (
          user.posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-4 shadow-md rounded-lg mb-4 hover:shadow-lg transition"
            >
              <p className="text-gray-700">{post.content}</p>
              <span className="text-gray-500 text-sm">{post.timestamp}</span>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 shadow-md rounded-lg text-center">
            <p className="text-gray-600">No posts yet</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Create your first post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;