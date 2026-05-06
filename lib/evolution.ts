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
  },
  /**
   * Tenta encontrar a instância correta pelo nome, número ou status
   */
  async findInstanceByName(nameOrNumber: string) {
    try {
      const instances = await this.getInstances();
      if (!Array.isArray(instances) || instances.length === 0) return null;

      const cleanTarget = nameOrNumber.replace(/\D/g, '');

      // 1. Tenta por número (owner) - MAIS SEGURO
      if (cleanTarget.length > 8) {
        const byOwner = instances.find((inst: any) => {
          const ownerNum = String(inst.owner || inst.ownerJid || inst.number || '').split('@')[0].replace(/\D/g, '');
          return ownerNum === cleanTarget;
        });
        if (byOwner) return byOwner.instanceName || byOwner.name;
      }

      // 2. Tenta por nome exato
      const exactName = instances.find((inst: any) => 
        inst.instanceName === nameOrNumber || inst.name === nameOrNumber
      );
      if (exactName) return exactName.instanceName || exactName.name;

      // 3. Tenta encontrar pelo nome da instância (parcial) como último recurso
      const byName = instances.find((inst: any) => 
        inst.instanceName?.toLowerCase().includes(nameOrNumber.toLowerCase()) || 
        inst.name?.toLowerCase().includes(nameOrNumber.toLowerCase())
      );

      return byName?.instanceName || byName?.name || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Busca mensagens de um chat (histórico)
   */
  async fetchMessages(instanceName: string, remoteJid: string, count: number = 20) {
    try {
      const response = await fetch('/api/evolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/chat/findMessages/${instanceName}`,
          method: 'POST',
          body: {
            where: {
              key: {
                remoteJid: remoteJid
              }
            }
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) throw data;
      
      // A v2 retorna as mensagens dentro de data, pode precisar de ajuste se o formato mudar
      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico (v2):', error);
      throw error;
    }
  },

  /**
   * Busca a lista de contatos da instância (v2)
   */
  async fetchContacts(instanceName: string) {
    try {
      const response = await fetch('/api/evolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/chat/findContacts/${instanceName}`,
          method: 'POST',
          body: {
            // "where": {} vazio para trazer todos
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) throw data;
      return data;
    } catch (error) {
      console.error('Erro ao buscar contatos (v2):', error);
      return [];
    }
  },

  /**
   * Tenta encontrar o JID de um contato pelo nome usando a lista de contatos
   */
  async findJidByName(instanceName: string, name: string): Promise<string | null> {
    try {
      const contacts = await this.fetchContacts(instanceName);
      // Na v2 pode vir dentro de um array direto ou em um campo data
      const list = Array.isArray(contacts) ? contacts : (contacts?.data || contacts?.response || []);
      if (!Array.isArray(list)) return null;

      // Procura por um contato que tenha o nome parecido
      const target = list.find((c: any) => 
        c.name?.toLowerCase().includes(name.toLowerCase()) ||
        c.pushName?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(c.name?.toLowerCase() || '') ||
        name.toLowerCase().includes(c.pushName?.toLowerCase() || '')
      );

      return target?.id || target?.remoteJid || target?.jid || null;
    } catch (error) {
      console.error('Erro ao encontrar JID por nome:', error);
      return null;
    }
  }
};
