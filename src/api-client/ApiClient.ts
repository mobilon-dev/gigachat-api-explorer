import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';
export class ApiClient{
  axios: any;
  token: any;
  url: any;
  logUrl: any;
  logStore: any;
  
  constructor(logUrl: string, url: string, token: string, logStore: any){
    this.logUrl = logUrl
    this.token = token
    this.url = url
    this.logStore = logStore
    this.axios = axios.create({
      baseURL: url,
      headers: {
        'Accept': 'application/json', 
        Authorization: `Bearer ${token}`,
      },
    });

    this.axios.interceptors.request.use((config) => {
      const pre = '**[ApiClient][Request]** '
      const url = ' ' + logUrl + config.url + ' '
      const data = config.data ? '{' + config.data + '}' : ""
      logStore.appendLog(pre + config.method + url + data)
      return config
    })

    this.axios.interceptors.response.use(function (response: any) {
      const pre = '**[ApiClient][Response]** '
      const url = ' ' + logUrl + response.config.url + ' '
      const data = response.config.data ? '\n' + response.config.data : ""
      const resp = JSON.stringify(response.data,null,' ')
      
      logStore.appendLog(pre + response.config.method + url + data + ' ' + response.status + ': ' + response.statusText + '\n' + resp)
      return response.data;
      }, function (error: any) {
        const pre = '**[ApiClient][Error]** '
        const url = ' ' + logUrl + error.config.url + ' '
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

  async downloadFile(fileId: string, filename: string, created_at: number){
    await this.axios
      .get(`/files/${fileId}/content`, {responseType: 'blob',})
      .then(response => {
        const file = new File([response], filename, {lastModified: created_at})
        const a = document.createElement('a')
        const url = URL.createObjectURL(file)
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
        }, 10)
      })
  }

  async deleteFile(fileId: string){
    const response = await this.axios.post(`/files/${fileId}/delete`);
    return response
  }

  /* Tokens */

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

  async sendRequest(model: string, messages: object[]){
    
    const data = JSON.stringify({
      'model' : model,
      'messages' : messages,
    }, null,' ')

    const response = await this.axios.post(`/chat/completions`,data)
    return response
  }

  async sendStreamRequest(model: string, messages: object[], stream: boolean, update_interval: number|null = null){
    
    const data = JSON.stringify({
      'model' : model,
      'messages' : messages,
      'stream' : stream,
      'update_interval': update_interval,
    }, null,' ')

    const pre = '**[ApiClient][Request]** '
    const url = ' ' + `${import.meta.env.VITE_LOG_API_URL}` + '/chat/completions' + ' '
    this.logStore.appendLog(pre + 'post' + url + data)

    const logStore = this.logStore
    const logUrl = this.logUrl
    const response = <string[]>[]

    await fetchEventSource(this.url + '/chat/completions',{
      method: "POST",
      headers: {
        'Accept': 'text/event-stream', 
        Authorization: `Bearer ${this.token}`,
      },
      body: data,
      //@ts-ignore
      onopen(response) {
        const pre = '**[ApiClient][Response]** '
        const url = ' ' + logUrl + '/chat/completions' + ' '
        logStore.appendLog(pre + 'post' + url + ' ' + response.status + ': ' + response.statusText)
      },
      async onmessage(ev) {
        const pre = '**[ApiClient][SSE]** '
        if (ev.data != '[DONE]'){
          const data = JSON.parse(ev.data)
          const m = data.choices[0].delta.content as string
          logStore.appendLog(pre + ' ' + ev.data)
          response.push(m)
        }
        else if (ev.data == '[DONE]'){
          logStore.appendLog(pre + ' ' + ev.data)
        }
      },
      onerror(err) {
        console.log("There was an error from server", err);
        return 
      },
    })
    return response
  }

}