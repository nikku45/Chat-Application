import { useEffect, useState } from "react";

const Profile = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const json = await res.json();
        setData(json);
        console.log(data)
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome, {data.username}</h2>
      <p>Email: {data.email}</p>
    </div>
  );
};

export default Profile;
