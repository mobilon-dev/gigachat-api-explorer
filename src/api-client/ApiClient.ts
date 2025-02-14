import axios from 'axios';
import { useLogStore } from '../store/logStore';

export class ApiClient{
  axios: any;

  constructor(url: string, token: string){
    this.axios = axios.create({
      baseURL: url,
      headers: {
        'Accept': 'application/json', 
        Authorization: `Bearer ${token}`,
      },
    });

    this.axios.interceptors.response.use(function (response: any) {
      return response;
      }, function (error: any) {
        console.log(error)
        const logStore = useLogStore()
        logStore.appendLog(error.config.method + ' ' + error.config.baseURL + error.config.url + ' ' + error.code + ':' + error.message)
        return false
       }
    ); 
  }

  /* Files */

  async getFileList(){
    const response = await this.axios.get(`/files`);

  }

  async getFileInfo(fileId: string){
    const response = await this.axios.get(`/files/${fileId}`);
  }

  async uploadFile(){
    const response = await this.axios.post(`/files`);
  }

  async downloadFile(fileId: string){
    const response = await this.axios.get(`/files/${fileId}/content`);
  }

  async deleteFile(fileId: string){
    const response = await this.axios.post(`/files/${fileId}/delete`);
  }

  /* Tokens */

  async getAvailableTokens(){
    const response = await this.axios.post(`/tokens/count`);
  }

  async getTokenCount(){
    const response = await this.axios.get(`/balance`);
  }

  /* Models */

  async getModels(){
    const response = await this.axios.get(`/models`)
    console.log(response)
  }

  /* Requests */

  async sendRequest(model: string, messages: object[], function_call: object|null = null){}

  async createEmbedding(model: string, input: string){}
}