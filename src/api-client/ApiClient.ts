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
      const logStore = useLogStore()
      const data = response.config.data ? ' data: ' + response.config.data : ""
      logStore.appendLog(response.config.method + ' ' + response.config.baseURL + response.config.url + data + ' ' + response.status + ': ' + response.statusText)
      return response.data;
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
    return response
  }

  async getFileInfo(fileId: string){
    const response = await this.axios.get(`/files/${fileId}`);
    return response
  }

  async uploadFile(file: File){
    const formData = new FormData();
    formData.append('files', file)
    formData.append('purpose','general')
    console.log(formData)
    const response = await this.axios.post(`/files`,formData);
    return response
  }

  async downloadFile(fileId: string){
    const response = await this.axios.get(`/files/${fileId}/content`);
    return response
  }

  async deleteFile(fileId: string){
    const response = await this.axios.post(`/files/${fileId}/delete`);
    return response
  }

  /* Tokens */

  async getTokenCount(){
    const response = await this.axios.post(`/tokens/count`);
    return response
  }

  async getAvailableTokens(){
    const response = await this.axios.get(`/balance`);
    return response
  }

  /* Models */

  async getModels(){
    const response = await this.axios.get(`/models`)
    return response
  }

  /* Requests */

  async sendRequest(model: string, messages: object[], function_call: object|null = null){}

  async createEmbedding(model: string, input: string){}
}