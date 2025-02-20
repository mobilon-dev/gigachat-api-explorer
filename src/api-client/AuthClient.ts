import axios from 'axios';
import {v4} from 'uuid'

export class AuthClient{
  axios: any;
  logStore: any

  constructor(logUrl: string, url: string, logStore: any){
    this.logStore = logStore
    this.axios = axios.create({
      baseURL: url,
    })

    this.axios.interceptors.request.use((config) => {
      const pre = '**[AuthClient][Request]** '
      const url = ' ' + `${import.meta.env.VITE_LOG_AUTH_URL}` + config.url + ' '
      const data = config.data ? '\n' + JSON.stringify(config.data, null, ' ') : ""
      logStore.appendLog(pre + config.method + url + data)
      return config
    })

    this.axios.interceptors.response.use(function (response: any) {
      const pre = '**[AuthClient][Response]** '
      const url = ' ' + logUrl + response.config.url + ' '
      const data = response.config.data ? '\n' + response.config.data : ""
      logStore.appendLog(pre + response.config.method + url + data + ' ' + response.status + ': ' + response.statusText)
      return response.data;
      }, function (error: any) {
        const pre = '**[AuthClient][Error]** '
        const url = ' ' + logUrl + error.config.url + ' '
        logStore.appendLog(pre + error.config.method + url + error.config.data + ' ' + error.code + ':' + error.response.data.message)
        return false
       }
    ); 
  }

  async getToken(client_id: string, client_secret: string, scope: string){
    this.logStore.isLoading = true
    const authorization = 'Basic ' + btoa(client_id + ':' + client_secret)
    const rquid = v4()

    const response = await this.axios
      .post('',{scope: scope}, {headers: {
        authorization: authorization,
        rquid: rquid, 
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }})
      this.logStore.isLoading = false
    return response
  }
}