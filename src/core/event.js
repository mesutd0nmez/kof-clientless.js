class Event {
  constructor(client, options) {
    Object.defineProperty(this, 'client', { value: client })
    this.options = options
  }

  async handleRecv(packet) {
    this.recv(packet)
  }

  async handleSend(...args) {
    this.send(...args)
  }
}

export default Event
