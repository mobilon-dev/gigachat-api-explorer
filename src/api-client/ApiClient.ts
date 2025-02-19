import axios from 'axios';
import { useLogStore } from '../store/logStore';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { fetchEventSource } from '@microsoft/fetch-event-source';
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
      const pre = '**[ApiClient][Request]** '
      const url = ' ' + `${import.meta.env.VITE_LOG_API_URL}` + config.url + ' '
      const data = config.data ? '{' + config.data + '}' : ""
      const logStore = useLogStore()
      logStore.appendLog(pre + config.method + url + data)
      return config
    })

    this.axios.interceptors.response.use(function (response: any) {
      const logStore = useLogStore()
      const pre = '**[ApiClient][Response]** '
      const url = ' ' + `${import.meta.env.VITE_LOG_API_URL}` + response.config.url + ' '
      const data = response.config.data ? '\n' + response.config.data : ""
      const resp = JSON.stringify(response.data,null,' ')
      
      logStore.appendLog(pre + response.config.method + url + data + ' ' + response.status + ': ' + response.statusText + '\n' + resp)
      return response.data;
      }, function (error: any) {
        const pre = '**[ApiClient][Error]** '
        const url = ' ' + `${import.meta.env.VITE_LOG_API_URL}` + error.config.url + ' '
        const logStore = useLogStore()
        logStore.appendLog( pre + error.config.method + url + error.code + ':' + error.message)
        return false
       }
    ); 
  }

  /* Files */

  async getFileList(){
    const contentStore = useContentStore()
    contentStore.isLoading = true
    const response = await this.axios.get(`/files`);
    contentStore.isLoading = false
    return response
  }

  async getFileInfo(fileId: string){
    const contentStore = useContentStore()
    contentStore.isLoading = true
    const response = await this.axios.get(`/files/${fileId}`);
    contentStore.isLoading = false
    return response
  }

  async uploadFile(file: File){
    const contentStore = useContentStore()
    contentStore.isLoading = true
    const formData = new FormData();
    formData.append('file', file)
    formData.append('purpose','general')
    console.log(formData)
    const response = await this.axios.post(`/files`,formData);
    contentStore.isLoading = false
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
    const contentStore = useContentStore()
    contentStore.isLoading = true
    const response = await this.axios.get(`/balance`);
    contentStore.isLoading = false
    return response
  }

  /* Models */

  async getModels(){
    const response = await this.axios.get(`/models`)
    return response
  }

  /* Requests */

  async sendRequest(model: string, messages: object[], stream: boolean, update_interval: number|null = null){
    const contentStore = useContentStore()
    const authStore = useAuthStore()
    
    contentStore.modelResponse = ''
    const data = JSON.stringify({
      'model' : model,
      'messages' : messages,
      'stream' : stream,
      'update_interval': update_interval,
    }, null,' ')
    if (!stream){
      contentStore.isLoading = true
      const response = await this.axios.post(`/chat/completions`,data)
      contentStore.isLoading = false
      contentStore.modelResponse = response.choices[0].message.content
    }
    else{
      const pre = '**[ApiClient][Request]** '
      const url = ' ' + `${import.meta.env.VITE_LOG_API_URL}` + '/chat/completions' + ' '
      const logStore = useLogStore()
      logStore.appendLog(pre + 'post' + url + data)
      await fetchEventSource(`${import.meta.env.VITE_API_URL}` + '/chat/completions',{
        method: "POST",
        headers: {
          'Accept': 'application/json', 
          Authorization: `Bearer ${authStore.token}`,
        },
        body: data,
        //@ts-ignore
        onopen(response) {
          console.log(response)
          const pre = '**[ApiClient][Response]** '
          const url = ' ' + `${import.meta.env.VITE_LOG_API_URL}` + '/chat/completions' + ' '
          const logStore = useLogStore()
          logStore.appendLog(pre + 'post' + url + ' ' +response.status + ': ' + response.statusText)
        },
        onmessage(ev) {
          const pre = '**[ApiClient][SSE]** '
          if (ev.data != '[DONE]'){
            const m = JSON.parse(ev.data).choices[0].delta.content
            const data = JSON.parse(ev.data)
            const jsonM = JSON.stringify(data,null,' ')
            const logStore = useLogStore()
            logStore.appendLog(pre + ' ' + jsonM)
            if ((typeof m) == 'string')
              contentStore.streamProcessing(m)
          }
          else if (ev.data == '[DONE]'){
            const logStore = useLogStore()
            logStore.appendLog(pre + ' ' + ev.data)
          }
        },
        onerror(err) {
          console.log("There was an error from server", err);
        },
      })
    }
  }

  async createEmbedding(model: string, input: string){}
}