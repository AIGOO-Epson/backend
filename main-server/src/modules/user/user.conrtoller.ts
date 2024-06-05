import { Body, Controller, Post } from '@nestjs/common';
import { Crud, CrudController } from '@nestjs-library/crud';
import { UserService } from './user.service';
import { User } from './repository/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Crud({
  entity: User,
  // routes: {
  // readMany: {
  // numberOfTake: 20,
  // },
  // },
})
@Controller('users')
export class UserController implements CrudController<User> {
  constructor(public readonly crudService: UserService) {}

  //원한다면 이렇게 직접구현도 가능.
  // @Post() //이거 왜 dto property가 스웨거로 안넘어가는거지?
  //해결, @CRUD에 라우트에 명시해야함.
  //   createUser(@Body() body: CreateUserDto) {
  //     return this.crudService.reservedCreate({ body, exclude: new Set() });
  //   }
}

//POST PUT PATCH 에 대해서만 직접 구현하면 되는듯?
// -> 이것도 아님, 엔티티에 그냥 바로 API property를 작성하면
//기본 메서드를 만들 필요 없음.
//근데 POST로 CREATE ONE 메서드에, exclude는 어떻게 지정하는지 모르겠음
//exclude사용하기 위해선 위 처럼 직접 구현해야하는건듯?
//exclude 인자를 엔티티에서 DTO 프로퍼티로 지정할 수는 없으니까?
//엔티티에서 바로 API property를 작성하는것은 편하긴 한데,
//뭐 추가로 엔티티에 없는 인자를 받고싶으면? 은 하지못함.

//일단 GET 메서드는 따로 구현안해도 됨. 원하면 해도되지만,
//DTO만들어서 BODY에 validate, crudService 메서드로 넘기면 됨.
//근데? 왜 스웨거에서 DTO 프로퍼티가 명시안되는지?
//해결, @Crud 어노테이션에 라우트 스웨거 명시해줘야 잘뜸.

//GET /users  Fetch multiple entities in 'User' Table
// localhost:4000/users
//localhost:4000/users?nextCursor=~~~~

//GET /users/{id}  Read one from 'User' Table
// localhost:4000/users/4
// localhost:4000/users/4?fields=username,email
