import axios from 'axios';
import {v4} from 'uuid'
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
    console.log(authorization, rquid, scope)
    const config = {
      headers: {
        authorization: authorization,
        rquid: rquid,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded', 
      }
    }
    const response = await this.axios.post('/oauth',{scope: scope}, {config})
    console.log(response)
    return response.data
  }
}