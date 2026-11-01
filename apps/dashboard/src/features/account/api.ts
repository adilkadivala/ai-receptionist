import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockResponse } from "../../lib/mock";
import { mockAccount } from "./mocks";
import type { Account, LoginInput, ProfileInput, SignupInput } from "./types";

/** Thrown by actions whose api route doesn't exist yet, so the form can say so instead of pretending. */
export class NotLiveYetError extends Error {
  constructor(what: string) {
    super(`${what} isn't live yet. It arrives with login in build step 6, so nothing was sent.`);
    this.name = "NotLiveYetError";
  }
}

const accountKey = ["account"] as const;

export function useAccount() {
  return useQuery({
    queryKey: accountKey,
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

/** Changes the signed-in person's name and email. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    // MOCK: becomes api.PATCH("/api/me", { body: input }).
    mutationFn: async (input: ProfileInput): Promise<Account> => {
      mockAccount.user = { ...mockAccount.user, name: input.name.trim(), email: input.email.trim() };
      return mockResponse(mockAccount);
    },
    onSuccess: (account) => queryClient.setQueryData(accountKey, account),
  });
}
