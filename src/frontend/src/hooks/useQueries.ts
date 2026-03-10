import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Department, Status } from "../backend";
import { useActor } from "./useActor";

export function useGetAllAssets() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: Category;
      serialNumber: string;
      macId: string;
      serviceTag: string;
      status: Status;
      assignedDepartment: Department;
      location: string;
      lastServiceDate: string;
      purchaseDate: string;
      purchaseVendor: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addAsset(
        data.name,
        data.category,
        data.serialNumber,
        data.macId,
        data.serviceTag,
        data.status,
        data.assignedDepartment,
        data.location,
        data.lastServiceDate,
        data.purchaseDate,
        data.purchaseVendor,
        data.notes,
      );
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
      return actor.deleteAsset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
