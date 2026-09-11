import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/services/api";

interface Options<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query key prefixes to refetch once the mutation succeeds. */
  invalidates?: QueryKey[];
  successMessage?: string | ((data: TData) => string);
  onSuccess?: (data: TData) => void;
}

/**
 * Every write in the portal reports the same way: toast on success, DRF error
 * translated to a sentence on failure, affected queries invalidated. Wrapping it
 * once keeps that consistent instead of repeating it in each page.
 */
export function useMutationWithToast<TVariables, TData>({
  mutationFn,
  invalidates = [],
  successMessage,
  onSuccess,
}: Options<TVariables, TData>) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      for (const key of invalidates) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      if (successMessage) {
        toast.success(
          typeof successMessage === "function" ? successMessage(data) : successMessage,
        );
      }
      onSuccess?.(data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
