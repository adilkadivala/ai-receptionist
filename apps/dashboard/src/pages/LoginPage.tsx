import { Link } from "react-router";
import { LoginForm } from "../features/account/components/login-form";
import { AuthLayout } from "../layouts/AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in"
      description="See your calls and change what your receptionist says."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
