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
  UPDATE_USER_USECASE = 'UpdateUserUsecase',
  GET_USER_BY_ID_USECASE = 'GetUserByIdUsecase',
  GET_ALL_USERS_USECASE = 'GetAllUsersUsecase',
  LOGIN_USER_USECASE = 'LoginUser',
  CONFIRM_USER_TOKEN_USECASE = 'ConfirmUserTokenUseCase',
  //**----- CHANNEL -----**//
  CREATE_CHANNEL_USECASE = 'CreateChannelUsecase',
  UPDATE_CHANNEL_USECASE = 'UpdateChannelUsecase',
  GET_CHANNEL_BY_ID_USECASE = 'GetChannelByIdUsecase',
  GET_ALL_CHANNELS_BY_USER_ID_USECASE = 'GetAllChannelsByUserIdUsecase',
}