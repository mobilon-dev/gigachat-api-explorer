import axios from 'axios';
import {v4} from 'uuid'
import { useLogStore } from '../store/logStore';


export class AuthClient{
  axios: any;
  logStore = useLogStore()
  constructor(url: string){
    this.axios = axios.create({
      baseURL: url,
    })
  }

  async getToken(client_id: string, client_secret: string, scope: string){
    const authorization = 'Basic ' + btoa(client_id + ':' + client_secret)
    const rquid = v4()
    console.log(authorization, rquid, scope)
    const config = {
      headers: {
        authorization: authorization,
        rquid: rquid, 
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }

    const response = await this.axios
      .post('',{scope: scope}, {config})
      .catch(function (error) {
        const logStore = useLogStore()
        logStore.appendLog(error.config.method + ' ' + error.config.baseURL + error.config.data + ' ' + error.code + ':' + error.message)
      });
    console.log(response)
    //return response.data
  }
}