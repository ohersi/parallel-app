export enum TYPES_ENUM {
  // Connections
  DATABASE_CONNECTION = 'DatabaseConnection',

  // User Roles
  ADMIN = 'admin',
  USER = 'user',

  // Repositories
  USER_REPOSITORY = 'UserRepository',
  CHANNEL_REPOSITORY = 'ChannelRepository',
  BLOCK_REPOSITORY = 'BlockRepository',
  CONNECTION_REPOSITORY = 'ConnectionRepository',
  FRIEND_REPOSITORY = 'FriendRepository',
  FOLLOW_REPOSITORY = 'FollowRepository',

  // Services
  USER_SERVICE = 'UserService',
  CHANNEL_SERVICE = 'Channel_Service',

  // Use Cases
  //**----- USER -----**//
  CREATE_USER_USECASE = 'CreateUserUsecase',
  UPDATE_USER_USECASE = 'UpdateUserUsecase',
  DELETE_USER_USECASE = 'DeleteUserUsecase',
  GET_USER_BY_ID_USECASE = 'GetUserByIdUsecase',
  GET_ALL_USERS_USECASE = 'GetAllUsersUsecase',
  GET_USER_FRIENDS_USECASE = 'GetUserFriendsUsecase',
  GET_USER_FOLLOWERS_USECASE = 'GetUserFollowersUsecase',
  LOGIN_USER_USECASE = 'LoginUser',
  CONFIRM_USER_TOKEN_USECASE = 'ConfirmUserTokenUseCase',
  //**----- CHANNEL -----**//
  CREATE_CHANNEL_USECASE = 'CreateChannelUsecase',
  UPDATE_CHANNEL_USECASE = 'UpdateChannelUsecase',
  DELETE_CHANNEL_USECASE = 'DeleteChannelUsecase',
  GET_ALL_CHANNELS_USECASE = 'GetAllChannelsUsecase',
  GET_CHANNEL_BY_ID_USECASE = 'GetChannelByIdUsecase',
  GET_CHANNEL_BY_SLUG_USECASE = 'GetChannelBySlugUsecase',
  GET_ALL_CHANNELS_BY_USER_ID_USECASE = 'GetAllChannelsByUserIdUsecase',
  GET_CHANNEL_FOLLOWERS_USECASE = 'GetChannelFollowersUsecase',
  //**----- BLOCK -----**//
  CREATE_BLOCK_USECASE = 'CreateBlockUsecase',
  UPDATE_BLOCK_USECASE = 'UpdateBlockUsecase',
  DELETE_BLOCK_USECASE = 'DeleteBlockUsecase',
  GET_BLOCK_BY_ID_USECASE = 'GetBlockByIdUsecase',
  GET_ALL_BLOCKS_USECASE = 'GetAllBlocksUsecase',
  //**----- CONNECTION -----**//
  ADD_CONNECTION_USECASE = 'AddConnectionUsecase',
  REMOVE_CONNECTION_USECASE = 'RemoveConnectionUsecase',
  //**----- FRIEND -----**//
  ADD_FRIEND_USECASE = 'AddFriendUsecase',
  REMOVE_FRIEND_USECASE = 'RemoveFriendUsecase',
  //**----- FOLLOW -----**//
  FOLLOW_CHANNEL_USECASE = 'FollowChannelUsecase',
  REMOVE_CHANNEL_USECASE = 'RemoveChannelUsecase',

}