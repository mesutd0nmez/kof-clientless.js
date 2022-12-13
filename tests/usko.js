import { Client, Platform, PacketHeader } from '../src/client.js'
import PasswordHash from '../src/core/utils/passwordHash.js'
import inquirer from 'inquirer'

const client = new Client({
  platform: Platform.USKO,
  loginHost: '185.81.239.174',
  loginPort: 15100,
  gamePort: 15001,
  socket32: true,
  aes: true,
  reconnect: true,
})

client.start(process.env.TEST_USERNAME, PasswordHash(process.env.TEST_PASSWORD))

client.on('serverList', (servers) => {
  inquirer
    .prompt({
      type: 'list',
      name: 'value',
      message: `Please select a server for ${client.account.username}:`,
      choices: Array.from(servers.values()).map((c) => c.name),
    })
    .then((answer) => {
      const server = Array.from(servers).find((e) => e.name === answer.value)
      client.createGameSocket(server.ip)
    })
    .catch((error) => {
      console.error(error)
    })
})

client.on('selectNation', () => {
  inquirer
    .prompt({
      type: 'list',
      name: 'value',
      message: `Please select nation for ${client.account.username}:`,
      choices: ['Karus', 'El Morad'],
    })
    .then((answer) => {
      switch (answer.value) {
        case 'Karus':
          {
            client.selectNation(1)
          }
          break
        case 'El Morad':
          {
            client.selectNation(2)
          }
          break
      }
    })
    .catch((error) => {
      console.error(error)
    })
})

client.on('characterList', (characters) => {
  inquirer
    .prompt({
      type: 'list',
      name: 'value',
      message: `Please select a character for ${client.account.username}:`,
      choices: Array.from(characters.values()).map((c) => c.name),
    })
    .then((answer) => {
      const characterIndex = characters.findIndex(
        (e) => e.name === answer.value
      )

      client.selectCharacter(characterIndex)
    })
})

client.on('captchaReady', () => {
  inquirer
    .prompt({
      type: 'input',
      name: 'value',
      message: `Enter captcha for ${client.account.username}:`,
    })
    .then((answer) => {
      client.send.emit(PacketHeader.WIZ_CAPTCHA, 2, answer.value)
    })
    .catch((error) => {
      console.error(error)
    })
})

client.on('captchaFailed', (attempStatus) => {
  switch (attempStatus) {
    case 2: // 5 Failed attempts
      {
        console.log(`5 Failed attempts, please wait 10 seconds`)
        setTimeout(() => {
          inquirer
            .prompt({
              type: 'input',
              name: 'value',
              message: `Enter captcha for ${client.account.username}:`,
            })
            .then((answer) => {
              client.send.emit(PacketHeader.WIZ_CAPTCHA, 2, answer.value)
            })
            .catch((error) => {
              console.error(error)
            })
        }, 10000)
      }
      break
    case 3: // Invalid characters length must be 4
    case 4: // Doesn't match
      {
        inquirer
          .prompt({
            type: 'input',
            name: 'value',
            message:
              `Enter the characters doesn't match.\n` +
              `Enter captcha for ${client.account.username}:`,
          })
          .then((answer) => {
            client.send.emit(PacketHeader.WIZ_CAPTCHA, 2, answer.value)
          })
          .catch((error) => {
            console.error(error)
          })
      }
      break
  }
})

client.on('captchaSuccess', () => {
  console.info('Captcha Success')
})
