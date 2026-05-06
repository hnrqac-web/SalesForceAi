/**
 * Service para integração com Evolution API v2 via Proxy Interno
 * Isso protege a API_KEY de ser exposta no navegador.
 */

function normalizeInstance(rawInstance: any) {
  const nested = rawInstance?.instance || {}

  return {
    ...rawInstance,
    ...nested,
    id: rawInstance?.id || nested?.id || nested?.instanceId,
    instanceId: rawInstance?.instanceId || nested?.instanceId,
    name: rawInstance?.name || rawInstance?.instanceName || nested?.name || nested?.instanceName,
    instanceName: rawInstance?.instanceName || nested?.instanceName,
    profileName: rawInstance?.profileName || nested?.profileName || rawInstance?.pushName || nested?.pushName,
    profilePicUrl: rawInstance?.profilePicUrl || rawInstance?.profilePictureUrl || nested?.profilePicUrl || nested?.profilePictureUrl,
    owner: rawInstance?.owner || nested?.owner,
    ownerJid: rawInstance?.ownerJid || nested?.ownerJid || rawInstance?.owner || nested?.owner,
    number: rawInstance?.number || nested?.number,
    status: rawInstance?.status || nested?.status,
    connectionStatus: rawInstance?.connectionStatus || nested?.connectionStatus || rawInstance?.status || nested?.status,
  }
}

function normalizeInstancesResponse(data: any) {
  const list = Array.isArray(data)
    ? data
    : data?.instances || data?.response?.message || []

  return Array.isArray(list) ? list.map(normalizeInstance) : []
}

export const evolutionService = {
  /**
   * Lista todas as instâncias
   */
  async getInstances(): Promise<any[]> {
    try {
      const response = await fetch('/api/evolution?endpoint=/instance/fetchInstances', {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return normalizeInstancesResponse(data);
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      return [];
    }
  },

  /**
   * Cria uma nova instância
   */
  async createInstance(instanceName: string) {
    try {
      const response = await fetch('/api/evolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '/instance/create',
          method: 'POST',
          body: {
            instanceName,
            token: '',
            integration: 'WHATSAPP-BAILEYS',
            qrcode: true,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  },

  /**
   * Pega o QR Code de uma instância
   */
  async getQrCode(instanceName: string) {
    try {
      const response = await fetch(`/api/evolution?endpoint=/instance/connect/${instanceName}`, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      throw error;
    }
  },

  /**
   * Deleta uma instância
   */
  async deleteInstance(instanceName: string) {
    try {
      await fetch(`/api/evolution?endpoint=/instance/delete/${instanceName}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
    }
  },

  /**
   * Configura o Webhook para uma instância
   */
  async setWebhook(instanceName: string, url: string) {
    try {
      console.log(`[FRONTEND] Configurando Webhook para ${instanceName}`);
      const response = await fetch('/api/evolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/webhook/set/${instanceName}`,
          method: 'POST',
          body: {
            webhook: {
              enabled: true,
              url: url,
              webhook_by_events: false,
              events: [
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE',
                'SEND_MESSAGE',
                'CONNECTION_UPDATE'
              ]
            }
          },
        }),
      });
      
      const data = await response.json();
      console.log('[FRONTEND] Resposta da API:', data);
      
      if (!response.ok) {
        throw data;
      }
      return data;
    } catch (error: any) {
      console.error('[FRONTEND] Erro Fatal:', error);
      throw error;
    }
  }
};
