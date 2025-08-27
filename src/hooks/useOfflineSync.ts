import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load pending actions from localStorage
    const saved = localStorage.getItem('kerigma-offline-actions');
    if (saved) {
      try {
        setPendingActions(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading offline actions:', error);
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão restaurada",
        description: "Sincronizando dados...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Sem conexão",
        description: "Dados serão salvos para sincronização posterior.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  useEffect(() => {
    // Auto-sync when online and have pending actions
    if (isOnline && pendingActions.length > 0 && !isSyncing) {
      syncPendingActions();
    }
  }, [isOnline, pendingActions.length, isSyncing]);

  const addOfflineAction = (type: string, data: any) => {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now()
    };

    const updated = [...pendingActions, action];
    setPendingActions(updated);
    localStorage.setItem('kerigma-offline-actions', JSON.stringify(updated));

    if (!isOnline) {
      toast({
        title: "Ação salva offline",
        description: "Será sincronizada quando a conexão for restaurada.",
      });
    }
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    setIsSyncing(true);
    
    try {
      // Process each pending action
      const processedActions: string[] = [];
      
      for (const action of pendingActions) {
        try {
          // Here you would implement the actual sync logic
          // For now, we'll just simulate a successful sync
          await new Promise(resolve => setTimeout(resolve, 500));
          processedActions.push(action.id);
        } catch (error) {
          console.error(`Error syncing action ${action.id}:`, error);
          // Keep failed actions for retry
        }
      }

      // Remove successfully processed actions
      const remaining = pendingActions.filter(
        action => !processedActions.includes(action.id)
      );
      
      setPendingActions(remaining);
      localStorage.setItem('kerigma-offline-actions', JSON.stringify(remaining));

      if (processedActions.length > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${processedActions.length} ações sincronizadas com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Erro na sincronização",
        description: "Tentaremos novamente em breve.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    localStorage.removeItem('kerigma-offline-actions');
  };

  return {
    isOnline,
    pendingActions,
    isSyncing,
    addOfflineAction,
    syncPendingActions,
    clearPendingActions,
    hasPendingActions: pendingActions.length > 0
  };
};
