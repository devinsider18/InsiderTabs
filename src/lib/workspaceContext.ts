import { createContext, useContext } from "react";
import type { WorkspaceContextValue } from "./workspaceTypes";

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error("useWorkspace must be used within WorkspaceProvider.");
  return workspace;
}
