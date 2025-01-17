import { Button } from "../ui/button";
import { useRouter } from "next/compat/router";

export default function PasswordResetUpdate() {
  const router = useRouter();

  return (
    <div className="flex w-[40%] min-w-[15em] flex-col gap-12">
      <h2 className="w-[100%] text-3xl font-bold text-blue-primary">
        Password Reset Successful!
      </h2>

      <Button
        className="w-[100%] bg-blue-primary"
        type="submit"
        variant="default"
        size="lg"
        onClick={() => router?.push("/login")}
      >
        Back to Login
      </Button>
    </div>
  );
}
