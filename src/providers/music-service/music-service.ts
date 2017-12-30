import { ISong } from './../../interfaces/ISong'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

import * as shortId from 'shortid'

@Injectable()
export class MusicServiceProvider {
  private orchestreamApiUri: string
  private orchestreamSettingsUri: string
  private orchestreamMusicRequestApi: string
  private housePartiesUri: string

  constructor(private http: HttpClient) {
    this.orchestreamApiUri = 'https://house-party.herokuapp.com/api/music'
    this.orchestreamSettingsUri = 'https://house-party.herokuapp.com/api/settings'
    this.orchestreamMusicRequestApi = 'https://house-party.herokuapp.com/api/music/requests'
    this.housePartiesUri = 'https://house-party.herokuapp.com/api/house-parties'
  }

  public getMusicRequests() {
    let url = this.orchestreamMusicRequestApi

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

  public createParty(partyName: string) {
    return this.http.post(this.housePartiesUri, {
      name: partyName,
      partyId: shortId.generate()
    })
  }

  public getHouseParties() {
    return this.http.get(this.housePartiesUri)
  }
}
