// ✅ AuthPage.tsx — unified login/signup page
import { useState } from "react";
import LoginForm from "@components/auth/LoginForm";
import SignupForm from "@components/auth/SignupForm";

const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {showLogin ? "Welcome Back 👋" : "Create Your Account ✨"}
        </h2>

        {showLogin ? <LoginForm /> : <SignupForm />}

        <div className="text-center mt-6 text-sm text-gray-600">
          {showLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setShowLogin(false)}
                className="text-blue-600 hover:underline font-medium focus:outline-none"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-600 hover:underline font-medium focus:outline-none"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;