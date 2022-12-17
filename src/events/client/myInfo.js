import PacketHeader from '../../core/enums/packetHeader.js'
import Event from '../../core/event.js'

class WizMyInfo extends Event {
  constructor(client) {
    super(client, {
      header: PacketHeader.WIZ_MYINFO,
    })
  }

  async recv() {
    console.info('MyInfo')
  }
}

export default WizMyInfo
