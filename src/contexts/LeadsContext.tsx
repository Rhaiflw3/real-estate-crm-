import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient as createBrowserSupabase } from "@/lib/supabase/browser";
import type { Lead } from "@/lib/types/lead";

interface LeadsContextProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const LeadsContext = createContext<LeadsContextProps | undefined>(undefined);

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial fetch (fallback to mock if needed)
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          setLeads(data);
        } else {
          // fallback to mock data (import if needed)
          const { mockLeads } = await import("@/hooks/use-lead-analytics");
          // @ts-ignore – mockLeads exported for fallback only
          setLeads((mockLeads as Lead[]) ?? []);
        }
      } catch {
        const { mockLeads } = await import("@/hooks/use-lead-analytics");
        // @ts-ignore
        setLeads((mockLeads as Lead[]) ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // Realtime subscription scoped to current user (browser client only)
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const initRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return; // not authenticated, skip subscription

      const channel = supabase.channel(`public:leads:user_${user.id}`);

      channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "leads", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newLead = payload.new as Lead;
            setLeads((prev) => [newLead, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "leads", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const updated = payload.new as Lead;
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "leads", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const old = payload.old as Lead;
            setLeads((prev) => prev.filter((l) => l.id !== old.id));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };
    const cleanupPromise = initRealtime();
    return () => {
      cleanupPromise?.then((cleanup) => cleanup?.());
    };
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, setLeads }}>
      {isLoading ? null : children}
    </LeadsContext.Provider>
  );
};

export const useLeads = (): LeadsContextProps => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within a LeadsProvider");
  return ctx;
};
