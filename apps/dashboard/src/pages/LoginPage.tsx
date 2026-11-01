import { Link } from "react-router";
import { LoginForm } from "../features/account/components/login-form";
import { AuthLayout, authLinkClassName } from "../layouts/AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in"
      description="See your calls and change what your receptionist says."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className={authLinkClassName}>
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
