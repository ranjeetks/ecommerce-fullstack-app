// ✅ UserInfo.tsx (fixed) - Uses AuthContext instead of axios
import { useAuth } from "@context/AuthContext";

const UserInfo = () => {
  const { user } = useAuth();

  console.log("Dashboard user:", user);
  if (!user) {
    return <div className="alert alert-warning">No user info found.</div>;
  }

  return (
    <div className=" bg-white shadow-lg rounded-2xl p-8 border border-gray-100 mt-4">
      <div className=" bg-white shadow rounded p-4">
        <h5>User Info</h5>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Roles:</strong> {user.roles.map((r) => r.name).join(", ")}
        </p>
      </div>
    </div>
  );
};

export default UserInfo;