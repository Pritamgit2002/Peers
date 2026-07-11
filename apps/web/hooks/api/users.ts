import { TUser } from "@/types/users";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

type TCreateUserBody = {
  name: string;
  email: string;
  clerkUserId: string;
  imageUrl?: string;
  isActive?: boolean;
};

const createUser = async (user: TCreateUserBody) => {
  const response = await fetch("/backend/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  const data = await response.json();
  return data.user as TUser;
};

export const useCreateUser = (
  options?: Omit<
    UseMutationOptions<TUser, Error, TCreateUserBody>,
    "mutationKey" | "mutationFn"
  >,
) => {
  return useMutation({
    mutationKey: ["useCreateUser"],
    mutationFn: createUser,
    ...options,
  });
};

const getUser = async (clerkUserId: string) => {
  const response = await fetch(`/backend/api/users/${clerkUserId}`);
  if (!response.ok) {
    throw new Error("Failed to get user");
  }
  const data = await response.json();
  return data.user as TUser;
};

export const useGetUser = (
  clerkUserId: string,
  options?: Omit<UseQueryOptions<TUser, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["useGetUser", clerkUserId],
    queryFn: () => getUser(clerkUserId),
    ...options,
  });
};

const activeUser = async (clerkUserId: string) => {
  const response = await fetch(`/backend/api/users/${clerkUserId}/active`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to active user");
  }
  return response.json();
};

export const useActiveUser = (
  clerkUserId: string,
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, string>,
    "mutationKey" | "mutationFn"
  >,
) => {
  return useMutation({
    mutationKey: ["useActiveUser", clerkUserId],
    mutationFn: activeUser,
    ...options,
  });
};
