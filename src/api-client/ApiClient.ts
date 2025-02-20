import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';
export class ApiClient{
  axios: any;
  token: any;
  url: any;
  logUrl: any;
  contentStore: any;
  logStore: any;
  
  constructor(logUrl: string,url: string, token: string, contentStore: any, logStore: any){
    this.logUrl = logUrl
    this.token = token
    this.url = url
    this.contentStore = contentStore
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
    this.contentStore.isLoading = true
    const response = await this.axios.get(`/files`);
    this.contentStore.isLoading = false
    return response
  }

  async getFileInfo(fileId: string){
    this.contentStore.isLoading = true
    const response = await this.axios.get(`/files/${fileId}`);
    this.contentStore.isLoading = false
    return response
  }

  async uploadFile(file: File){
    this.contentStore.isLoading = true
    const formData = new FormData();
    formData.append('file', file)
    formData.append('purpose','general')
    console.log(formData)
    const response = await this.axios.post(`/files`,formData);
    this.contentStore.isLoading = false
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

  async getTokenCount(model: string, input: string){
    const data = JSON.stringify({
      "model" : model,
      "input" : input,
    })
    const response = await this.axios.post(`/tokens/count`, data);
    return response
  }

  async getAvailableTokens(){
    this.contentStore.isLoading = true
    const response = await this.axios.get(`/balance`);
    this.contentStore.isLoading = false
    return response
  }

  /* Models */

  async getModels(){
    const response = await this.axios.get(`/models`)
    return response
  }

  /* Requests */

  async sendRequest(model: string, messages: object[], stream: boolean, update_interval: number|null = null){
    
    this.contentStore.modelResponse = ''
    const data = JSON.stringify({
      'model' : model,
      'messages' : messages,
      'stream' : stream,
      'update_interval': update_interval,
    }, null,' ')
    if (!stream){
      this.contentStore.isLoading = true
      const response = await this.axios.post(`/chat/completions`,data)
      this.contentStore.isLoading = false
      this.contentStore.setModelResponse(response.choices[0].message.content)
    }
    else{
      const pre = '**[ApiClient][Request]** '
      const url = ' ' + `${import.meta.env.VITE_LOG_API_URL}` + '/chat/completions' + ' '
      this.logStore.appendLog(pre + 'post' + url + data)

      const contentStore = this.contentStore
      const logStore = this.logStore
      const logUrl = this.logUrl

      fetchEventSource(this.url + '/chat/completions',{
        method: "POST",
        headers: {
          'Accept': 'text/event-stream', 
          Authorization: `Bearer ${this.token}`,
        },
        responseType: 'stream',
        adapter: 'fetch',
        body: data,
        //@ts-ignore
        onopen(response) {
          console.log(response)
          const pre = '**[ApiClient][Response]** '
          const url = ' ' + logUrl + '/chat/completions' + ' '
          logStore.appendLog(pre + 'post' + url + ' ' +response.status + ': ' + response.statusText)
        },
        async onmessage(ev) {
          const pre = '**[ApiClient][SSE]** '
          console.log(ev, Date.now())
          if (ev.data != '[DONE]'){
            const m = JSON.parse(ev.data).choices[0].delta.content
            const data = JSON.parse(ev.data)
            const jsonM = JSON.stringify(data,null,' ')
            logStore.appendLog(pre + ' ' + jsonM)
            if ((typeof m) == 'string'){
              setTimeout(() => {
                contentStore.streamProcessing(m)
              }, 100)
            }
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
      /*
      console.log('w')
      axios.create({
        baseURL: this.url,
        headers: {
          'Accept': 'text/event-stream', 
          Authorization: `Bearer ${this.token}`,
        },
        responseType: 'stream',
        adapter:'fetch'
      })
      .post(`/chat/completions`, data)
      .then(async (response) => {
        console.log('axios got a response', response);
        const stream = response.data;
        console.log('stream', stream instanceof ReadableStream);
          
        const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          console.log(value);
        }
      })*/
    }
  }

  async createEmbedding(model: string, input: string){}
}