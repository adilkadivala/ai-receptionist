import { Link } from "react-router";
import { SignupForm } from "../features/account/components/signup-form";
import { AuthLayout, authLinkClassName } from "../layouts/AuthLayout";

export function SignupPage() {
  return (
    <AuthLayout
      eyebrow="New account"
      title="Create your account"
      description="Pick a plan and tell us about your business. You'll set up your receptionist next."
      className="max-w-lg"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className={authLinkClassName}>
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
