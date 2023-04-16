export enum TYPES_ENUM {
  // Connections
  DATABASE_CONNECTION = 'DatabaseConnection',

  // User Roles
  ADMIN = 'admin',
  USER = 'user',

  // Repositories
  USER_REPOSITORY = 'UserRepository',
  CHANNEL_REPOSITORY = 'ChannelRepository',

  // Services
  USER_SERVICE = 'UserService',
  CHANNEL_SERVICE = 'Channel_Service',

  // Use Cases
  //**----- USER -----**//
  CREATE_USER_USECASE = 'CreateUserUsecase',
  GET_USER_BY_ID_USECASE = 'GetUserByIdUsecase',
  GET_ALL_USERS_USECASE = 'GetAllUsersUsecase',
  UPDATE_USER_USECASE = 'UpdateUserUsecase',
  LOGIN_USER_USECASE = 'LoginUser',
  CONFIRM_USER_TOKEN_USECASE = 'ConfirmUserTokenUseCase',
  //**----- CHANNEL -----**//
  GET_ALL_CHANNELS_BY_USER_ID_USECASE = 'GetAllChannelsByUserIdUsecase',
}