import { Link } from "react-router";
import { SignupForm } from "../features/account/components/signup-form";
import { AuthLayout } from "../layouts/AuthLayout";

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
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
