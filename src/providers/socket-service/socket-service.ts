import { Injectable } from '@angular/core'
import * as io from 'socket.io-client'

@Injectable()
export class SocketServiceProvider {
  public partyId: string
  public socketUri: string
  public socket: io

  constructor() {
    this.socketUri = 'https://house-party.herokuapp.com/'
    this.connectClientSocket()
  }

  private connectClientSocket() {
    this.socket = io.connect(this.socketUri, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })
  }

  public emit(event, data) {
    this.socket.emit(event, data)
  }

  public on(event, callback) {
    this.socket.on(event, callback)
  }
}
