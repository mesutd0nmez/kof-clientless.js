import { Client, Platform } from '../src/client.js'
import PasswordHash from '../src/core/utils/passwordHash.js'
import inquirer from 'inquirer'

const client = new Client({
  platform: Platform.CNKO,
  loginHost: '110.43.217.18',
  loginPort: 15101,
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
      client.createGameSocket(server.ip, server.port)
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
    .catch((error) => {
      console.error(error)
    })
})
