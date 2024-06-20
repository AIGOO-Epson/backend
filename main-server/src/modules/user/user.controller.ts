import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './repository/entity/user.entity';
import { ExReq } from '../../common/middleware/auth.middleware';
import {
  GetMyResDto,
  UpdateUserImgResDto,
  UpsertEpsonDeviceParams,
  UserIdParam,
} from './dto/user.dto';
import { SimpleSuccessDto } from '../../common/common.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: '내정보, 자세한 정보 접근' })
  @ApiResponse({ type: GetMyResDto })
  @Get()
  getMy(@Req() req: ExReq) {
    return this.userService.getMy(req);
  }

  @ApiOperation({ summary: '다른 유저 정보' })
  @ApiResponse({ type: User })
  @Get('/:userId')
  getUser(@Param() params: UserIdParam) {
    return this.userService.getUser(params.userId);
  }

  @ApiOperation({ summary: '앱손 디바이스 등록' })
  @ApiResponse({ type: SimpleSuccessDto })
  @Put('epsondevice')
  upsertEpsonDeviceEmail(
    @Req() req: ExReq,
    @Query() params: UpsertEpsonDeviceParams
  ) {
    return this.userService.upsertEpsonDeviceEmail(req, params);
  }

  @ApiOperation({
    summary: 'profile img update',
    description: 'formData: {file: 사진} 으로 requset',
  })
  @ApiResponse({ type: UpdateUserImgResDto })
  @UseInterceptors(FileInterceptor('file'))
  @Patch('img')
  updateUserImg(
    @Req() req: ExReq,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }), //5mb
          new FileTypeValidator({
            fileType: /(image\/jpg|image\/jpeg|image\/png)/,
          }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.userService.updateUserImg(req, file);
  }

  @ApiOperation({
    summary: '최애 등록',
  })
  @ApiResponse({ type: SimpleSuccessDto })
  @Put('/myfavorite/:userId')
  upsertMyFavorite(@Req() req: ExReq, @Param() params: UserIdParam) {
    return this.userService.upsertMyFavorite(req, params.userId);
  }
}
