import axios from 'axios';

export class ApiClient{
  axios: any;

  constructor(){
    
  }

  /* Files */

  async getFileList(){}

  async getFileInfo(){}

  async uploadFile(){}

  async downloadFile(){}

  async deleteFile(){}

  /* Tokens */

  async getAvailableTokens(){}

  async getTokenCount(){}

  /* Models */

  async getModels(){}

  /* Requests */

  async sendRequest(){}

  async createEmbedding(){}
}