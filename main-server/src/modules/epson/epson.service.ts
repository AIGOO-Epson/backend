import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

import * as querystring from 'querystring';
import { Environment } from '../../config/env/env.service';

@Injectable()
export class EpsonService {
  private readonly HOST = Environment.get('EPSON_HOST');
  private readonly CLIENT_ID = Environment.get('EPSON_CLIENT_ID');
  private readonly SECRET = Environment.get('EPSON_SECRET');
  private accessToken: string;
  private refreshToken: string;
  constructor() {
    this.authenticate();
  }

  async authenticate(device): Promise<any> {
    const AUTH_URI = `https://${this.HOST}/api/1/printing/oauth2/auth/token?subject=printer`;
    const auth = Buffer.from(`${this.CLIENT_ID}:${this.SECRET}`).toString(
      'base64'
    );

    const queryParam = {
      grant_type: 'password',
      username: device,
      password: '',
    };

    const headers = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    };

    try {
      const response = await axios.post(
        AUTH_URI,
        querystring.stringify(queryParam),
        { headers }
      );
      console.log('1. Authentication: ---------------------------------');
      console.log(AUTH_URI);
      console.log(queryParam);
      console.log(`${response.status}: ${response.statusText}`);
      console.log(response.data);

      return response.data;
    } catch (error) {
      if (error.isAxiosError) {
        const axiosError = error as AxiosError;
        console.error(
          `${axiosError.response?.status}: ${axiosError.response?.statusText}: ${axiosError.response?.data}`
        );
      } else {
        console.error(error.message);
      }
      throw new Error('Authentication failed');
    }
  }

  async registerScanDestination(
    subject_id: string,
    access_token: string,
    alias_name: string,
    email: string
  ): Promise<any> {
    const ADD_URI = `https://${this.HOST}/api/1/scanning/scanners/${subject_id}/destinations`;

    const dataParam = {
      alias_name: alias_name,
      type: 'email',
      destination: email,
    };

    const headers = {
      Authorization: `Basic ${access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    };

    try {
      const response = await axios.post(ADD_URI, dataParam, { headers });
      console.log('2. Register scan destination: ----------------------');
      console.log(ADD_URI);
      console.log(dataParam);
      console.log(`${response.status}: ${response.statusText}`);
      console.log(response.data);

      return response.data;
    } catch (error) {
      if (error.isAxiosError) {
        const axiosError = error as AxiosError;
        console.error(
          `${axiosError.response?.status}: ${axiosError.response?.statusText}: ${axiosError.response?.data}`
        );
      } else {
        console.error(error.message);
      }
      throw new Error('Register scan destination failed');
    }
  }
}
