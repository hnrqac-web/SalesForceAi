/**
 * Service para integração com Evolution API v2 via Proxy Interno
 * Isso protege a API_KEY de ser exposta no navegador.
 */

export const evolutionService = {
  /**
   * Lista todas as instâncias
   */
  async getInstances() {
    try {
      const response = await fetch('/api/evolution?endpoint=/instance/fetchInstances', {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data;
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
      const response = await fetch('/api/evolution', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: `/webhook/set/${instanceName}`,
          method: 'POST',
          body: {
            url: url,
            enabled: true,
            events: [
              'MESSAGES_UPSERT',
              'MESSAGES_UPDATE',
              'SEND_MESSAGE'
            ]
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      throw error;
    }
  }
};
