import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/services/api";

interface Options<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidates?: QueryKey[]; // key prefixes to refetch on success
  successMessage?: string | ((data: TData) => string);
  onSuccess?: (data: TData) => void;
}

// Every write in the portal behaves the same: toast on success, DRF error
// turned into a readable sentence on failure, affected queries invalidated.
// Wrapping it once beats repeating all that on every page.
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
