// ✅ LoginPage.tsx - Clean Bootstrap 5 version
import LoginForm from "@components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="p-3 w-100" style={{ maxWidth: "400px" }}>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
