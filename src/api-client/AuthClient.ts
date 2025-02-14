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
      console.log(config.data)
      const pre = '[AuthClient][Request] '
      const url = ' ' + config.baseURL + config.url + ' '
      const data = config.data ? '{' + JSON.stringify(config.data) + '}' : ""
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
        const pre = '[AuthClient][Response] '
        const logStore = useLogStore()
        logStore.appendLog(pre + response.config.method + ' ' + response.config.baseURL + response.config.data + ' ' + response.status + ': ' + response.statusText)
        return response.data
      })
      .catch(function (error) {
        const pre = '[AuthClient][Error] '
        const logStore = useLogStore()
        logStore.appendLog(pre + error.config.method + ' ' + error.config.baseURL + error.config.data + ' ' + error.code + ':' + error.response.data.message)
        return false
      });
    return response
  }
}