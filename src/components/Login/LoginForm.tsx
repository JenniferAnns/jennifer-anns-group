import React, { useState } from "react";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

const EMAIL_FORM_KEY = "email";
const PASSWORD_FORM_KEY = "password";

export const loginSchema = z.object({
  email: z.string().email("Not a valid email."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

function LoginForm() {
  const router = useRouter();

  const [validationErrors, setValidationErrors] = useState<
    Record<keyof z.input<typeof loginSchema>, string | undefined>
  >({
    email: undefined,
    password: undefined,
  });

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input = {
      email: formData.get(EMAIL_FORM_KEY),
      password: formData.get(PASSWORD_FORM_KEY),
    };
    const parse = loginSchema.safeParse(input);
    if (!parse.success) {
      const errors = parse.error.formErrors.fieldErrors;
      setValidationErrors({
        email: errors.email?.at(0),
        password: errors.password?.at(0),
      });
      return;
    }
    const res = await signIn("credentials", {
      ...parse.data,
      redirect: false,
    });

    if (!res?.ok) {
      setValidationErrors({
        email: "Invalid email/password combination",
        password: "Invalid email/password combination",
      });
      return;
    }

    setValidationErrors({
      email: undefined,
      password: undefined,
    });
    router.replace("/");
  }

  return (
    <form className="flex flex-col gap-8 w-[20em]" onSubmit={handleLoginSubmit}>
      <div className="flex flex-col relative">
        <label htmlFor={EMAIL_FORM_KEY} className="text-xl">
          Email*
        </label>
        <Input
          name={EMAIL_FORM_KEY}
          placeholder="Email"
          className={
            validationErrors.email
              ? "border-red-500"
              : "border-input-border focus:border-blue-primary"
          }
        />
        <p className="absolute bottom-[-2em] text-xs text-red-500">
          {validationErrors.email}
        </p>
      </div>
      <div className="flex flex-col relative">
        <label htmlFor={PASSWORD_FORM_KEY} className="text-xl">
          Password*
        </label>
        <Input
          name={PASSWORD_FORM_KEY}
          placeholder="Min. 8 characters"
          type="password"
          className={
            validationErrors.password
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-input-border focus:border-blue-primary"
          }
        />
        <p className="absolute bottom-[-2em] text-xs text-red-500">
          {validationErrors.password}
        </p>
      </div>
      <div className="flex flex-row justify-end">
        <a className="text-blue-primary hover:cursor-pointer text-sm font-light">
          Forgot Password?
        </a>
      </div>
      <div className="flex flex-row justify-center">
        <Button type="submit" variant="outline" size="lg">
          Log In
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
