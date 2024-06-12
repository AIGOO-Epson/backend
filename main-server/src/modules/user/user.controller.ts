import { Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './repository/entity/user.entity';

@ApiTags('user')
@Controller('/user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiResponse({ type: User })
  @Get('/:id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Get('/artist/:id')
  getArtist(@Param('id') id: string) {
    return this.userService.getArtist(id);
  }

  @Patch('/role/artist/:id')
  upgradeToArtist(@Param('id') id: string) {
    return this.userService.upgradeToArtist(id);
  }
}
