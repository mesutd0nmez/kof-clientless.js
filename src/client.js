import glob from 'glob'
import path from 'path'
import EventEmitter from 'events'
import Socket from './core/socket.js'
import PacketHeader from './core/enums/packetHeader.js'
import Platform from './core/enums/platform.js'

class Client extends EventEmitter {
  constructor(options) {
    super()
    this.options = options
    this.account = { username: '', password: '' }
    this.serverList = new Set()
    this.characterList = []
    this.selectedCharacterIndex = 0
    this.myself = null
    this.npcMap = new Map()
    this.playerMap = new Map()
    this.startTime = 0
    this.speedHackCheckInterval = 0
    this.gameState = 0
    this.nation = 0

    this.recv = new EventEmitter()
    this.send = new EventEmitter()

    this.loginSocket = null
    this.gameSocket = null
  }

  async buildEvents() {
    const promises = []

    glob
      .sync(path.join('./src/events', '*.js').replace(/\\/g, '/'))
      .forEach(async (file) => {
        promises.push(
          new Promise((resolve) => {
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
    this.loginSocket = new Socket()
    this.loginSocket.setKeepAlive(true)
    this.loginSocket.connect(this.options.loginPort, this.options.loginHost)
    this.loginSocket.recvEvent = this.recv

    const client = this

    this.loginSocket.on('error', (err) => {
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

    this.loginSocket.on('end', () => {
      console.info(`${client.account.username} disconnected from login server`)

      if (client.options.reconnect) {
        console.info(`${client.account.username} reconnecting in 3 seconds`)
      }

      client.clear()

      setTimeout(() => {
        if (client.options.reconnect) {
          client.createLoginSocket()
        }
      }, 3000)
    })

    this.loginSocket.on('connect', () => {
      this.send.emit(PacketHeader.WIZ_CRYPTION)
    })
  }

  async destroyLoginSocket() {
    this.loginSocket.destroy()
  }

  async createGameSocket(host, port = 15001, kickOutSession = false) {
    this.options.gameHost = host
    this.options.gamePort = port

    this.gameSocket = new Socket()
    this.gameSocket.setKeepAlive(true)
    this.gameSocket.connect(this.options.gamePort, this.options.gameHost)
    this.gameSocket.recvEvent = this.recv

    const client = this

    this.gameSocket.on('error', (err) => {
      console.info(err.message)

      if (client.options.reconnect) {
        console.info('Reconnecting in 3 seconds')
      }

      setTimeout(() => {
        if (kickOutSession == false && client.options.reconnect) {
          client.createLoginSocket()
        }
      }, 3000)
    })

    this.gameSocket.on('end', () => {
      console.info(`${client.account.username} disconnected from game server`)

      if (client.options.reconnect) {
        console.info(`${client.account.username} reconnecting in 3 seconds`)
      }

      client.clear()

      setTimeout(() => {
        if (kickOutSession == false && client.options.reconnect) {
          client.createLoginSocket()
        }
      }, 3000)
    })

    this.gameSocket.on('connect', () => {
      if (!kickOutSession) {
        this.send.emit(PacketHeader.WIZ_VERSION_CHECK)
      }
    })
  }

  async destroyGameSocket() {
    this.gameSocket.destroy()
  }

  async clear() {
    this.serverList.clear()
    this.characterList = []
    this.selectedCharacterIndex = 0
    this.myself = null
    this.npcMap.clear()
    this.playerMap.clear()
    this.gameState = 0
    this.nation = 0
    clearInterval(this.speedHackCheckInterval)
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
}

export { Client, PacketHeader, Platform }
