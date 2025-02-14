import axios from 'axios';
import {v4} from 'uuid'
import { useLogStore } from '../store/logStore';


export class AuthClient{
  axios: any;
  constructor(url: string){
    this.axios = axios.create({
      baseURL: url,
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
        const logStore = useLogStore()
        logStore.appendLog(response.config.method + ' ' + response.config.baseURL + response.config.data + ' ' + response.status + ': ' + response.statusText)
        return response.data
      })
      .catch(function (error) {
        const logStore = useLogStore()
        logStore.appendLog(error.config.method + ' ' + error.config.baseURL + error.config.data + ' ' + error.code + ':' + error.response.data.message)
        return false
      });
    return response
  }
}