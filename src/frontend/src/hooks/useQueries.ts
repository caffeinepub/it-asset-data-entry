import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Assets ───────────────────────────────────────────────────────────────────

export function useGetAllAssets() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      macId: string;
      serviceTag: string;
      assetName: string;
      category: string;
      department: string;
      vendor: string;
      status: string;
      purchaseDate: string;
      lastServiceDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addAsset(
        data.macId,
        data.serviceTag,
        data.assetName,
        data.category,
        data.department,
        data.vendor,
        data.status,
        data.purchaseDate,
        data.lastServiceDate,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useUpdateAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      macId: string;
      serviceTag: string;
      assetName: string;
      category: string;
      department: string;
      vendor: string;
      status: string;
      purchaseDate: string;
      lastServiceDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.updateAsset(
        data.id,
        data.macId,
        data.serviceTag,
        data.assetName,
        data.category,
        data.department,
        data.vendor,
        data.status,
        data.purchaseDate,
        data.lastServiceDate,
        data.notes,
      );
      if ("err" in result) throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useDeleteAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.deleteAsset(id);
      if ("err" in result) throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

// ─── Options ──────────────────────────────────────────────────────────────────

export function useGetOptions(fieldType: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["options", fieldType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOptions(fieldType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fieldType,
      value,
    }: { fieldType: string; value: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.addOption(fieldType, value);
      if ("err" in result) throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["options", variables.fieldType],
      });
    },
  });
}

export function useRemoveOption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fieldType,
      value,
    }: { fieldType: string; value: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.removeOption(fieldType, value);
      if ("err" in result) throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["options", variables.fieldType],
      });
    },
  });
}

export function useUpdateOption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fieldType,
      oldValue,
      newValue,
    }: {
      fieldType: string;
      oldValue: string;
      newValue: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.updateOption(fieldType, oldValue, newValue);
      if ("err" in result) throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["options", variables.fieldType],
      });
    },
  });
}
