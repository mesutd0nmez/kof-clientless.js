import glob from 'glob'
import path from 'path'
import EventEmitter from 'events'
import Socket from './core/socket.js'
import PacketHeader from './core/enums/packetHeader.js'

const Platform = {
  TEST: 0,
  CNKO: 1,
  JPKO: 2,
  USKO: 3,
}

class Client extends EventEmitter {
  constructor(options) {
    super()
    this.options = options
    this.account = { username: '', password: '' }
    this.serverList = new Set()
    this.characterList = []
    this.selectedCharacterIndex = 0
    this.socket = null
    this.myself = null
    this.npcMap = new Map()
    this.playerMap = new Map()
    this.startTime = 0
    this.speedHackCheckInterval = null
    this.gameState = 0
    this.nation = 0

    this.recv = new EventEmitter()
    this.send = new EventEmitter()
  }

  async buildEvents() {
    const promises = []

    glob
      .sync(path.join('./src/events', '*.js').replace(/\\/g, '/'))
      .forEach(async (file) => {
        promises.push(
          new Promise(function (resolve) {
            resolve(import(`../${file}`))
          })
        )
      })

    return Promise.all(promises).then((moduleList) => {
      moduleList.forEach((module) => {
        const event = new module.default(this)

        this.recv.on(event.options.header, async (data) => {
          await event.handleRecv(data)
        })

        this.send.on(event.options.header, async (...args) => {
          await event.handleSend(...args)
        })
      })
    })
  }

  async createLoginSocket() {
    if (this.socket) {
      this.destroySocket()
    }

    this.socket = new Socket()
    this.socket.setKeepAlive(true)
    this.socket.connect(this.options.loginPort, this.options.loginHost)
    this.socket.recvEvent = this.recv

    const client = this

    this.socket.on('error', function (err) {
      console.info(err.message)

      if (client.options.reconnect) {
        console.info('Reconnecting in 3 seconds')
      }

      setTimeout(() => {
        if (client.options.reconnect) {
          client.createLoginSocket()
        }
      }, 3000)
    })

    this.send.emit(PacketHeader.WIZ_CRYPTION)
  }

  async createGameSocket(host, port = 15001) {
    if (this.socket) {
      this.destroySocket()
    }

    this.options.gameHost = host

    if (port != 15001) {
      this.options.gamePort = port
    }

    this.socket = new Socket()
    this.socket.setKeepAlive(true)
    this.socket.connect(this.options.gamePort, this.options.gameHost)
    this.socket.recvEvent = this.recv

    const client = this

    this.socket.on('error', function (err) {
      console.info(err.message)

      if (client.options.reconnect) {
        this.createLoginSocket()
      }
    })

    this.send.emit(PacketHeader.WIZ_VERSION_CHECK)
  }

  async clear() {
    this.gameState = 0
    clearInterval(this.speedHackCheckInterval)
  }

  async destroySocket() {
    this.clear()
    this.socket.destroy()
  }

  async start(username, password) {
    this.startTime = Date.now()

    this.account = {
      username: username,
      password: password,
    }

    await this.buildEvents()
    await this.createLoginSocket()
  }

  async selectCharacter(characterIndex) {
    this.selectedCharacterIndex = characterIndex
    const selectedCharacter = this.characterList[characterIndex]

    if (selectedCharacter.name.length == 0) {
      console.info('!!! Create character not implemented yet !!!')
    } else {
      this.send.emit(PacketHeader.WIZ_SEL_CHAR, this.selectedCharacterIndex)
    }
  }

  async selectNation(nation) {
    this.nation = nation
    this.send.emit(PacketHeader.WIZ_SEL_NATION, this.nation)
  }

  async sendPacket(packet) {
    this.socket.emit('send', packet)
  }
}

export { Client, Platform, PacketHeader }
