const PacketHeader = {
  WIZ_LOGIN: 0x01,
  WIZ_SEL_CHAR: 0x04,
  WIZ_SEL_NATION: 0x05,
  WIZ_MOVE: 0x06,
  WIZ_USER_INOUT: 0x07,
  WIZ_NPC_INOUT: 0x0a,
  WIZ_NPC_MOVE: 0x0b,
  WIZ_GAMESTART: 0x0d,
  WIZ_MYINFO: 0x0e,
  WIZ_ALLCHAR_INFO_REQUEST: 0x0c,
  WIZ_REGIONCHANGE: 0x15,
  WIZ_REQ_USERIN: 0x16,
  WIZ_NPC_REGION: 0x1c,
  WIZ_REQ_NPCIN: 0x1d,
  WIZ_VERSION_CHECK: 0x2b,
  WIZ_NOTICE: 0x2e,
  WIZ_SPEEDHACK_CHECK: 0x41,
  WIZ_COMPRESS_PACKET: 0x42,
  WIZ_HOME: 0x48,
  WIZ_KICKOUT: 0x51,
  WIZ_MAP_EVENT: 0x53,
  WIZ_SHOPPING_MALL: 0x6a,
  WIZ_SERVER_INDEX: 0x6b,
  WIZ_HACKTOOL: 0x72,
  WIZ_BUFFER_SIZE: 0x95,
  WIZ_LOADING_LOGIN: 0x9f,
  WIZ_XIGNCODE: 0xa0,
  WIZ_CAPTCHA: 0xc0,
  WIZ_CRYPTION: 0xf2,
  WIZ_LOGIN_REQUEST: 0xf3,
  WIZ_SERVER_LIST: 0xf5,
}

export default PacketHeader
