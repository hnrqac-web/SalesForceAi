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
      const list = Array.isArray(data) ? data : (data?.data || data?.response || []);
      
      console.log('[Evolution] Instâncias recebidas:', list);

      return list.map((inst: any) => {
        // Tenta encontrar o nome da instância em vários caminhos
        const name = inst.instanceName || inst.name || inst.instance?.instanceName || inst.instance?.name;
        
        // Tenta encontrar o status de conexão
        const connectionStatus = inst.status || inst.connectionStatus || inst.instance?.status || inst.instance?.connectionStatus;

        // Tenta encontrar o owner (número do WhatsApp) em vários caminhos da v2
        const owner = inst.owner || 
                      inst.instance?.owner || 
                      inst.data?.owner || 
                      inst.connection?.owner || 
                      inst.instance?.data?.owner ||
                      null;

        // Tenta encontrar o nome do perfil
        const profileName = inst.profileName || 
                            inst.instance?.profileName || 
                            inst.data?.profileName || 
                            inst.instance?.data?.profileName ||
                            null;

        return {
          name,
          connectionStatus,
          owner,
          profileName
        };
      });
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
  async fetchMessages(instanceName: string, remoteJid: string, count: number = 20): Promise<any> {
    try {
      // Tenta o formato padrão da documentação (v2)
      const fetchAttempt = async (jid: string, nested: boolean) => {
        const bodyFormat = nested 
          ? { where: { key: { remoteJid: jid } } }
          : { where: { remoteJid: jid } };

        const response = await fetch('/api/evolution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: `/chat/findMessages/${instanceName}`,
            method: 'POST',
            body: bodyFormat
          }),
        });
        const data = await response.json();
        if (!response.ok) return [];
        
        const list = Array.isArray(data) ? data : (data?.messages || data?.data || data?.response || []);
        return Array.isArray(list) ? list : [];
      };

      // Tenta combinações: (Oficial, Aninhado), (Oficial, Plano), (Sem Suffix, Aninhado), (Sem Suffix, Plano)
      let messages = await fetchAttempt(remoteJid, true);
      if (messages.length === 0) messages = await fetchAttempt(remoteJid, false);
      
      if (messages.length === 0) {
        const rawNumber = remoteJid.split('@')[0];
        messages = await fetchAttempt(rawNumber, true);
        if (messages.length === 0) messages = await fetchAttempt(rawNumber, false);
      }

      return messages || [];
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
          body: {}
        }),
      });

      const data = await response.json();
      if (!response.ok) throw data;
      return Array.isArray(data) ? data : (data?.data || data?.response || []);
    } catch (error) {
      console.error('Erro ao buscar contatos (v2):', error);
      return [];
    }
  },

  /**
   * Busca a lista de chats ativos na instância
   */
  async findChats(instanceName: string, where: any = {}): Promise<any[]> {
    try {
      const response = await fetch('/api/evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: `/chat/findChats/${instanceName}`,
          method: 'POST',
          body: Object.keys(where).length > 0 ? { where } : {}
        }),
      });

      const data = await response.json();
      if (!response.ok) return [];
      
      const list = Array.isArray(data) ? data : (data?.data || data?.response || []);
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error('Erro ao buscar chats (v2):', error);
      return [];
    }
  },

  /**
   * Tenta encontrar o JID de um contato pelo nome usando a lista de contatos
   */
  async findJidByName(instanceName: string, name: string): Promise<string | null> {
    try {
      const list = await this.fetchContacts(instanceName);
      if (!Array.isArray(list)) return null;

      // Procura por um contato que tenha o nome parecido
      const target = list.find((c: any) => 
        (c.name || '').toLowerCase().includes(name.toLowerCase()) ||
        (c.pushName || '').toLowerCase().includes(name.toLowerCase())
      );

      return target?.id || target?.remoteJid || target?.jid || null;
    } catch (error) {
      console.error('Erro ao encontrar JID por nome:', error);
      return null;
    }
  }
};
