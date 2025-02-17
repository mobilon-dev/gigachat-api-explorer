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

    this.axios.interceptors.request.use((config) => {
      console.log(config)
      const pre = '[ApiClient][Request] '
      const url = ' ' + config.baseURL + config.url + ' '
      const data = config.data ? '{' + config.data + '}' : ""
      const logStore = useLogStore()
      logStore.appendLog(pre + config.method + url + data)
      return config
    })

    this.axios.interceptors.response.use(function (response: any) {
      const logStore = useLogStore()
      const pre = '[ApiClient][Response] '
      const url = ' ' + response.config.baseURL + response.config.url + ' '
      const data = response.config.data ? '{' + response.config.data + '}' : ""
      const resp = JSON.stringify(response.data)
      logStore.appendLog(pre + response.config.method + url + data + ' ' + response.status + ': ' + response.statusText + ' ' + resp)
      return response.data;
      }, function (error: any) {
        console.log(error)
        const pre = '[ApiClient][Error] '
        const url = ' ' + error.config.baseURL + error.config.url + ' '
        const logStore = useLogStore()
        logStore.appendLog( pre + error.config.method + url + error.code + ':' + error.message)
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
    formData.append('file', file)
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

  async sendRequest(model: string, messages: object[], stream: boolean, update_interval: number|null = null){
    const data = JSON.stringify({
      'model' : model,
      'messages' : messages,
      'stream' : stream,
      'update_interval': update_interval,
    })
    console.log(data)
    const response = await this.axios.post(`/chat/completions`,data)
    console.log(response)
    return response
  }

  async createEmbedding(model: string, input: string){}
}