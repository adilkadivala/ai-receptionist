import { buttonVariants } from "@receptionist/ui/components/button";
import { SearchX } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "../components/empty-state";

export function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="There's no page here"
      action={
        <Link to="/" className={buttonVariants()}>
          Go to the overview
        </Link>
      }
    >
      The link may be old, or mistyped.
    </EmptyState>
  );
}
