/**
 * Service para integração com Evolution API v2
 * Documentação: https://doc.evolution-api.com/
 */

const EVOLUTION_URL = process.env.NEXT_PUBLIC_EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': API_KEY || '',
};

export const evolutionService = {
  /**
   * Lista todas as instâncias
   */
  async getInstances() {
    try {
      const response = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers,
      });
      return await response.json();
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
      const response = await fetch(`${EVOLUTION_URL}/instance/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          instanceName,
          token: '', // Opcional, a API gera um se vazio
          qrcode: true,
        }),
      });
      return await response.json();
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
      const response = await fetch(`${EVOLUTION_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers,
      });
      return await response.json();
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
      await fetch(`${EVOLUTION_URL}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers,
      });
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
    }
  }
};
