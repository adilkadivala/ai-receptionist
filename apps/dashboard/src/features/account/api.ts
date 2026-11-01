import { useMutation, useQuery } from "@tanstack/react-query";
import { mockResponse } from "../../lib/mock";
import { mockAccount } from "./mocks";
import type { LoginInput, SignupInput } from "./types";

/** Thrown by actions whose api route doesn't exist yet, so the form can say so instead of pretending. */
export class NotLiveYetError extends Error {
  constructor(what: string) {
    super(`${what} isn't live yet. It arrives with login in build step 6, so nothing was sent.`);
    this.name = "NotLiveYetError";
  }
}

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    // MOCK: becomes api.GET("/api/me").
    queryFn: () => mockResponse(mockAccount),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSignup() {
  return useMutation({
    // MOCK: becomes api.POST("/api/auth/signup", { body: input }); the server sets the login cookie.
    mutationFn: async (_input: SignupInput): Promise<void> => {
      await mockResponse(null);
      throw new NotLiveYetError("Sign-up");
    },
  });
}

export function useLogin() {
  return useMutation({
    // MOCK: becomes api.POST("/api/auth/login", { body: input }).
    mutationFn: async (_input: LoginInput): Promise<void> => {
      await mockResponse(null);
      throw new NotLiveYetError("Logging in");
    },
  });
}
