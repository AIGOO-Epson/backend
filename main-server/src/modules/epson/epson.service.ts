import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { ExReq } from '../../common/middleware/auth.middleware';
import { extname } from 'path';

@Injectable()
export class EpsonService {
  private readonly host = Environment.get('EPSON_HOST');
  private readonly clientId = Environment.get('EPSON_CLIENT_ID');
  private readonly secret = Environment.get('EPSON_SECRET');
  private readonly aliasName = 'aigoo';
  private readonly destinationUrlPrifix = `http://${Environment.get('DESTINATION_HOST')}:4000/api/letter/scan`;
  constructor() {}

  async printRequest(req: ExReq, location_url: string) {
    if (req.user.epsonDevice === null) {
      throw new BadRequestException('epson device is null');
    }

    const { subjectId, accessToken } = await this.authenticate(
      req.user.epsonDevice
    );

    // 파일 확장자보고 print_mode 설정
    //TODO 어? 근데 이거 의미가있나? 그냥 확장자 관계없이 photo로 뽑아도 되는거아닌가?
    //TODO 사진으로 뽑으면 더 쨍하게 나오거나 화질이 높은건가?
    const fileExtension = extname(location_url).toLowerCase();
    const isValidExtension = /\.(jpg|jpeg|png|pdf)$/.test(fileExtension);

    if (!isValidExtension) {
      throw new BadRequestException('Unsupported file extension');
    }

    const printMode = fileExtension === '.pdf' ? 'document' : 'photo';

    // 2. Create print job
    const jobUri = `https://${this.host}/api/1/printing/printers/${subjectId}/jobs`;

    const jobData = {
      job_name: 'SampleJob1',
      print_mode: printMode,
    };

    const jobResponse = await axios
      .post(jobUri, jobData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json;charset=utf-8',
        },
      })
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to create print job: ${error.response.status} - ${error.response.statusText}`
        );
      });

    const jobId = jobResponse.data.id;
    const baseUri = jobResponse.data.upload_uri;

    // 3. Upload print file
    const imageUrl = location_url;
    const imageResponse = await axios
      .get(imageUrl, {
        responseType: 'arraybuffer',
      })
      .catch((error) => {
        throw new BadRequestException(
          `Failed to download image: ${error.response.status} - ${error.response.statusText}`
        );
      });

    const imageData = imageResponse.data;
    const fileName = `1${fileExtension}`;
    const uploadUri = `${baseUri}&File=${fileName}`;

    await axios
      .post(uploadUri, imageData, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Length': imageData.byteLength.toString(),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/octet-stream',
        },
      })
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to upload print file: ${error.response.status} - ${error.response.statusText}`
        );
      });

    // 4. Execute print
    const printUri = `https://${this.host}/api/1/printing/printers/${subjectId}/jobs/${jobId}/print`;

    await axios
      .post(
        printUri,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json;charset=utf-8',
          },
        }
      )
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to execute print: ${error.response.status} - ${error.response.statusText}`
        );
      });

    return { success: true };
  }
  async setScanDestination(
    deviceEmail: string,
    uuid: string,
    letterDocumentId: Types.ObjectId
  ) {
    const tmpDestinationUrl =
      this.destinationUrlPrifix + `/${uuid}/${letterDocumentId.toString()}`;

    const { subjectId, accessToken } = await this.authenticate(deviceEmail);

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

  async authenticate(device: string): Promise<CamelCaseAuthResponseData> {
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
      return this.parseAuthResToCamelCase(response.data);
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
