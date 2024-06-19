import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as querystring from 'querystring';
import { Environment } from '../../config/env/env.service';
import { Types } from 'mongoose';
import {
  EpsonAuthResponseData,
  EpsonAuthResponse,
  EpsonAuthenticationErr,
  throwEpsonAuthErrDescription,
  ScanDestination,
  CamelCaseAuthResponseData,
} from './epson.interface';

const testDevice = 'mdy4265n8m7195@print.epsonconnect.com';

@Injectable()
export class EpsonService {
  private readonly host = Environment.get('EPSON_HOST');
  private readonly clientId = Environment.get('EPSON_CLIENT_ID');
  private readonly secret = Environment.get('EPSON_SECRET');
  private readonly aliasName = 'aigoo';
  private readonly destinationUrlPrifix =
    'http://3.39.226.109:4000/api/letter/scan';
  constructor() {}

  async setScanDestination(
    deviceEmail: string,
    uuid: string,
    letterDocumentId: Types.ObjectId
  ) {
    const tmpDestinationUrl =
      this.destinationUrlPrifix + `/${uuid}/${letterDocumentId.toString()}`;

    const { subjectId, accessToken } = this.parseAuthResToCamelCase(
      await this.authenticate(deviceEmail)
    );

    const { destinations } = await this.getScanDestinationList(
      subjectId,
      accessToken
    );

    const targetDestinationId = this.getDestinatinIdByAliasName(destinations);

    if (!targetDestinationId) {
      await this.registerScanDestination(
        subjectId,
        accessToken,
        tmpDestinationUrl
      );
      return;
    }
    await this.updateScanDestination(
      subjectId,
      accessToken,
      targetDestinationId,
      tmpDestinationUrl
    );
    return;
  }

  private async authenticate(device: string): Promise<EpsonAuthResponseData> {
    const AUTH_URI = `https://${this.host}/api/1/printing/oauth2/auth/token?subject=printer`;
    const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString(
      'base64'
    );

    const queryParam = {
      grant_type: 'password',
      username: device,
      password: '',
    };

    const headers = {
      Authorization: `Basic ${auth}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    };

    try {
      const response: EpsonAuthResponse = await axios.post(
        AUTH_URI,
        querystring.stringify(queryParam),
        { headers }
      );
      return response.data;
    } catch (error) {
      const authErr = error as EpsonAuthenticationErr;
      return throwEpsonAuthErrDescription(authErr.response.data.error);
    }
  }

  private async getScanDestinationList(subjectId: string, accessToken: string) {
    const ADD_URI = `https://${this.host}/api/1/scanning/scanners/${subjectId}/destinations`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json; charset=UTF-8',
    };

    try {
      const response: {
        data: {
          destinations: ScanDestination[];
        };
      } = await axios.get(ADD_URI, { headers });
      return response.data;
    } catch (error) {
      console.error(error.response.data);
      throw new Error('Get scan destination failed');
    }
  }

  private async registerScanDestination(
    subjectId: string,
    accessToken: string,
    destination: string
  ): Promise<any> {
    const ADD_URI = `https://${this.host}/api/1/scanning/scanners/${subjectId}/destinations`;

    const dataParam = {
      alias_name: this.aliasName,
      type: 'url',
      destination: destination,
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json; charset=UTF-8',
    };

    try {
      await axios.post(ADD_URI, dataParam, { headers });
      return;
    } catch {
      throw new InternalServerErrorException(
        'Register scan destination failed'
      );
    }
  }

  private async updateScanDestination(
    subjectId: string,
    accessToken: string,
    destinationId: string,
    destination: string
  ): Promise<any> {
    const ADD_URI = `https://${this.host}/api/1/scanning/scanners/${subjectId}/destinations`;

    const dataParam = {
      id: destinationId,
      alias_name: this.aliasName,
      type: 'url',
      destination: destination,
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json; charset=UTF-8',
    };

    try {
      await axios.put(ADD_URI, dataParam, { headers });
      return;
    } catch {
      throw new InternalServerErrorException('Update scan destination failed');
    }
  }

  private parseAuthResToCamelCase(
    obj: EpsonAuthResponseData
  ): CamelCaseAuthResponseData {
    return {
      tokenType: obj.token_type,
      accessToken: obj.access_token,
      expiresIn: obj.expires_in,
      refreshToken: obj.refresh_token,
      subjectType: obj.subject_type,
      subjectId: obj.subject_id,
    };
  }

  private getDestinatinIdByAliasName(
    destinations: ScanDestination[]
  ): string | undefined {
    const destination = destinations.find(
      (dest) => dest.alias_name === this.aliasName
    );
    return destination ? destination.id : undefined;
  }
}
