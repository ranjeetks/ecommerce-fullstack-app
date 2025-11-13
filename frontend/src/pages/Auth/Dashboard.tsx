// ✅ Dashboard.tsx - Bootstrap 5 polish
import UserInfo from "@components/UserInfo";
import LogoutButton from "@components/auth/LogoutButton";

const Dashboard = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="p-4 shadow rounded text-center"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <h2 className="mb-4">Welcome to Dashboard</h2>
        <UserInfo />
        <LogoutButton />
      </div>
    </div>
  );
};

export default Dashboard;
