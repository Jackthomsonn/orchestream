import { SocketServiceProvider } from './../socket-service/socket-service';
import { ISong } from './../../interfaces/ISong'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

import * as shortId from 'shortid'

@Injectable()
export class MusicServiceProvider {
  private orchestreamApiUri: string
  private orchestreamMusicRequestApi: string
  private orchestreamPartiesUri: string

  constructor(private http: HttpClient, private socketServiceProvider: SocketServiceProvider) {
    this.orchestreamApiUri = 'https://house-party.herokuapp.com/api/music'
    this.orchestreamMusicRequestApi = 'https://house-party.herokuapp.com/api/music/requests'
    this.orchestreamPartiesUri = 'https://house-party.herokuapp.com/api/house-parties'
  }

  public getMusicRequests() {
    let url = this.orchestreamMusicRequestApi

    if (this.socketServiceProvider.partyId) {
      url += `?partyId=${this.socketServiceProvider.partyId}`
    }

    return this.http.get(url)
  }

  public getSongs(qParam?: string) {
    let url = this.orchestreamApiUri

    if (qParam && qParam !== '') {
      url += `?q=${qParam}`
    }

    return this.http.get(url)
  }

  public requestSong(requestedSong: ISong) {
    return this.http.post(this.orchestreamMusicRequestApi, requestedSong)
  }

  public getHouseParties() {
    return this.http.get(this.orchestreamPartiesUri)
  }
}
