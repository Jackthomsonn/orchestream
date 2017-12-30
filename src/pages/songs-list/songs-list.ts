import { ISongRequest } from './../../interfaces/ISongRequest'
import { ISong } from '../../interfaces/ISong'

import { LoadingController } from 'ionic-angular/components/loading/loading-controller'
import { ToastController } from 'ionic-angular/components/toast/toast-controller'
import { NativeStorage } from '@ionic-native/native-storage'

import { MusicServiceProvider } from './../../providers/music-service/music-service'
import { SocketServiceProvider } from './../../providers/socket-service/socket-service'

import { Component } from '@angular/core'
import { IonicPage, NavParams } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'page-songs-list',
  templateUrl: 'songs-list.html',
})
export class SongsListPage {
  public songs: Array<ISong>
  public currentlyPlaying: string

  private nickname: string

  constructor(
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private socketServiceProvider: SocketServiceProvider,
    private musicServiceProvider: MusicServiceProvider,
    private nativeStorage: NativeStorage,
    private loadingCtrl: LoadingController) {
  }

  public search(event) {
    let val = event.target.value
    const loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Searching'
    })

    loading.present()

    this.musicServiceProvider.getSongs(val).subscribe((songs: Array<ISong>) => {
      this.songs = songs
      loading.dismiss()
    })
  }

  public requestSong(song: ISong) {
    const loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Requesting song..'
    })

    loading.present()

    this.socketServiceProvider.emit('songChanged', {
      changed: true,
      partyId: this.socketServiceProvider.partyId
    })

    this.musicServiceProvider.requestSong({
      artist: song.artist,
      image: song.image,
      link: song.link,
      songName: song.songName,
      partyId: this.socketServiceProvider.partyId,
      username: this.nickname
    }).subscribe(done => {
      this.socketServiceProvider.emit('songRequested', {
        artist: song.artist,
        image: song.image,
        link: song.link,
        songName: song.songName,
        partyId: this.socketServiceProvider.partyId,
        username: this.nickname
      })
      loading.dismiss()
    })
  }

  private checkIfSongIsInQueue() {
    this.musicServiceProvider.getMusicRequests().subscribe((requestedSongs: Array<ISong>) => {
      this.songs.forEach((song) => {
        song.isInQueue = false
        requestedSongs.forEach((requestedSong) => {
          if (song.link === requestedSong.link) {
            song.isInQueue = true
          }
        })
      })
    })
  }

  private populateSongsList() {
    this.songs = this.navParams.data.songs

    this.checkIfSongIsInQueue()
  }

  private getUser() {
    this.nativeStorage.getItem('username').then(user => {
      this.nickname = user
    })
  }

  private whoRequested(data: ISongRequest) {
    if (data.username === this.nickname) {
      return 'You'
    }

    return data.username
  }

  private getCurrentSong() {
    this.musicServiceProvider.getMusicRequests().subscribe((requestedSongs: Array<ISong>) => {
      if (requestedSongs.length === 0) {
        this.currentlyPlaying = 'No songs are currently playing'
        return
      }
      this.currentlyPlaying = `${requestedSongs[0].artist} - ${requestedSongs[0].songName}`
    })
    this.checkIfSongIsInQueue()
  }

  ionViewDidLoad() {
    this.getUser()
    this.populateSongsList()
    this.getCurrentSong()

    this.socketServiceProvider.on('songRequested', (data: ISongRequest) => {
      this.checkIfSongIsInQueue()

      const toast = this.toastCtrl.create({
        message: `${this.whoRequested(data)} requested ${data.artist} - ${data.songName}`,
        duration: 3000,
        position: 'top'
      })

      toast.dismissAll()
      toast.present()
    })

    this.socketServiceProvider.on('songChanged', this.getCurrentSong.bind(this))
  }
}
