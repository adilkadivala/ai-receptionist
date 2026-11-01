import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockId, mockResponse } from "../../lib/mock";
import { mockAgents, mockConfigs, mockVoices } from "./mocks";
import type { AgentConfig, AgentSettings } from "./types";

export const agentKeys = {
  all: ["agents"] as const,
  config: (agentId: string) => [...agentKeys.all, agentId, "config"] as const,
  voices: ["voices"] as const,
};

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.all,
    // MOCK: becomes api.GET("/api/agents").
    queryFn: () => mockResponse(mockAgents),
  });
}

/** The agent's current settings: the newest version in agent_configs. */
export function useAgentConfig(agentId: string | undefined) {
  return useQuery({
    queryKey: agentKeys.config(agentId ?? ""),
    // MOCK: becomes api.GET("/api/agents/{agent_id}/config", { params: { path: { agent_id: agentId } } }).
    queryFn: async () => {
      const config = mockConfigs[agentId ?? ""];
      if (!config) throw new Error("Receptionist not found");
      return mockResponse(config);
    },
    enabled: Boolean(agentId),
  });
}

/** Saves the settings as a new version. */
export function useSaveAgentConfig(agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // MOCK: becomes api.PUT("/api/agents/{agent_id}/config", { params: { path: { agent_id: agentId } }, body: settings }).
    mutationFn: async (settings: AgentSettings): Promise<AgentConfig> => {
      const previous = mockConfigs[agentId];
      const saved: AgentConfig = {
        ...settings,
        id: mockId("cfg"),
        agent_id: agentId,
        version: (previous?.version ?? 0) + 1,
        created_at: new Date().toISOString(),
      };
      mockConfigs[agentId] = saved;
      return mockResponse(saved);
    },
    onSuccess: (saved) => queryClient.setQueryData(agentKeys.config(agentId), saved),
  });
}

export function useVoices() {
  return useQuery({
    queryKey: agentKeys.voices,
    // MOCK: becomes api.GET("/api/voices").
    queryFn: () => mockResponse(mockVoices),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
