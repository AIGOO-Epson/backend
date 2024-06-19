import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

export interface EpsonAuthenticationErr {
  response: {
    data: {
      error: EpsonAuthenticationErrMsg;
    };
  };
}

export type EpsonAuthenticationErrMsg =
  | 'invalid_request'
  | 'invalid_grant'
  | 'unsupported_grant_type'
  | 'invalid_client'
  | 'server_error';

export const throwEpsonAuthErrDescription = (
  type: EpsonAuthenticationErrMsg
) => {
  const prefix = 'err while epson auth';
  if (type === 'invalid_request') {
    throw new InternalServerErrorException(
      prefix + 'err while epson auth, server side err'
    );
  }
  if (type === 'invalid_grant') {
    throw new BadRequestException(
      prefix +
        `user device email is invalid or
Remote print is not allowed in the Print Settings, client side err`
    );
  }
  if (type === 'unsupported_grant_type') {
    throw new InternalServerErrorException(
      prefix + 'grant type is invalid, server side err'
    );
  }
  if (type === 'invalid_client') {
    throw new InternalServerErrorException(
      prefix + 'Authentication failed by server side'
    );
  }
  throw new InternalServerErrorException(prefix + 'Unexpected error');
};

export interface EpsonAuthResponse {
  data: EpsonAuthResponseData;
  [key: string]: any;
}

export interface EpsonAuthResponseData {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  subject_type: string;
  subject_id: string;
}
export interface CamelCaseAuthResponseData {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  subjectType: string;
  subjectId: string;
}

export interface ScanDestination {
  id: string;
  alias_name: string;
  type: string;
  destination: string;
}
