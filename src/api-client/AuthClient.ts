import axios from 'axios';
import {v4} from 'uuid'
import { useLogStore } from '../store/logStore';


export class AuthClient{
  axios: any;
  constructor(url: string){
    this.axios = axios.create({
      baseURL: url,
    })
    this.axios.interceptors.request.use((config) => {
      const pre = '**[AuthClient][Request]** '
      const url = ' ' + `${import.meta.env.VITE_LOG_AUTH_URL}` + config.url + ' '
      const data = config.data ? '\n' + JSON.stringify(config.data, null, ' ') : ""
      const logStore = useLogStore()
      logStore.appendLog(pre + config.method + url + data)
      return config
    })
  }

  async getToken(client_id: string, client_secret: string, scope: string){
    const authorization = 'Basic ' + btoa(client_id + ':' + client_secret)
    const rquid = v4()

    const response = await this.axios
      .post('',{scope: scope}, {headers: {
        authorization: authorization,
        rquid: rquid, 
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }})
      .then(response => {
        const pre = '**[AuthClient][Response]** '
        const logStore = useLogStore()
        logStore.appendLog(pre + response.config.method + ' ' + `${import.meta.env.VITE_LOG_AUTH_URL}` + ' ' + response.status + ': ' + response.statusText)
        return response.data
      })
      .catch(function (error) {
        const pre = '**[AuthClient][Error]** '
        const logStore = useLogStore()
        logStore.appendLog(pre + error.config.method + ' ' + `${import.meta.env.VITE_LOG_AUTH_URL}` + error.config.data + ' ' + error.code + ':' + error.response.data.message)
        return false
      });
    return response
  }
}