import {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";

import type { TApiError, TApiSuccess } from "./api.ts";

export type TQueryOpts<
  TResponse = undefined,
  TSelect = TApiSuccess<TResponse>,
> = Omit<
  UseQueryOptions<TApiSuccess<TResponse>, TApiError, TSelect>,
  "queryKey" | "queryFn"
>;

export type TInfiniteQueryOpts<TResponse = undefined> = Omit<
  UseInfiniteQueryOptions<
    TApiSuccess<TResponse>,
    TApiError,
    InfiniteData<TApiSuccess<TResponse>>,
    QueryKey,
    number
  >,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

export type TMutationOpts<TVariables = void, TResponse = undefined> = Omit<
  UseMutationOptions<TApiSuccess<TResponse>, TApiError, TVariables>,
  "mutationKey" | "mutationFn"
>;
