import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { ApiClient } from './client';
import { AppError } from './errors';
import { z } from 'zod';

export interface PaginatedParams {
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export function usePaginated<TData = unknown>(
  client: ApiClient,
  queryKey: unknown[],
  path: string,
  schema: z.ZodType<TData>,
  params: PaginatedParams = {},
  options?: Omit<UseQueryOptions<TData, AppError>, 'queryKey' | 'queryFn'>
) {
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  const queryString = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ),
    limit: String(limit),
    offset: String(offset),
  }).toString();

  const fullPath = `${path}?${queryString}`;

  return useQuery<TData, AppError>({
    queryKey: [...queryKey, { limit, offset, ...params }],
    queryFn: () => client.get<TData>(fullPath, schema),
    ...options,
  });
}

export function useApiMutation<TData = unknown, TVariables = void>(
  client: ApiClient,
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateQueryKeys?: unknown[][],
  options?: UseMutationOptions<TData, AppError, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, AppError, TVariables>({
    mutationFn,
    onSuccess: (...args) => {
      if (invalidateQueryKeys && invalidateQueryKeys.length > 0) {
        for (const queryKey of invalidateQueryKeys) {
          queryClient.invalidateQueries({ queryKey });
        }
      }
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
