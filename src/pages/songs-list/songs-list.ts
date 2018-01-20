import { Haptic } from 'ionic-angular/tap-click/haptic';
import { ISongRequest } from './../../interfaces/ISongRequest'
import { ISong } from '../../interfaces/ISong'

import { LoadingController } from 'ionic-angular/components/loading/loading-controller'
import { ToastController } from 'ionic-angular/components/toast/toast-controller'
import { NativeStorage } from '@ionic-native/native-storage'

import { MusicServiceProvider } from './../../providers/music-service/music-service'
import { SocketServiceProvider } from './../../providers/socket-service/socket-service'

import { Component } from '@angular/core'
import { IonicPage, NavParams } from 'ionic-angular'
import { Toast } from 'ionic-angular/components/toast/toast';

@IonicPage()
@Component({
  selector: 'page-songs-list',
  templateUrl: 'songs-list.html',
})

export class SongsListPage {
  public songs: Array<ISong>
  public songsInQueue: Array<ISong>
  public currentlyPlaying: string
  public orchestreamName: string
  public searchValue: string

  private toastInstance: Toast
  private reconnectionToastInstance: Toast
  private nickname: string

  constructor(
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private socketServiceProvider: SocketServiceProvider,
    private musicServiceProvider: MusicServiceProvider,
    private nativeStorage: NativeStorage,
    private loadingCtrl: LoadingController,
    private haptic: Haptic) {
  }

  public search(event) {
    this.searchValue = event.target.value

    const loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Searching'
    })

    loading.present()

    this.musicServiceProvider.getSongs(this.searchValue).subscribe((songs: Array<ISong>) => {
      this.songs = songs
      this.checkIfSongIsInQueue().then(() => {
        loading.dismiss()
      })
    })
  }

  public requestSong(song: ISong) {
    if (this.haptic.available()) {
      this.haptic.impact({ style: 'heavy' })
    }

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
    return new Promise((resolve) => {
      this.musicServiceProvider.getMusicRequests().subscribe((requestedSongs: Array<ISong>) => {
        this.songs.forEach((song) => {
          song.isInQueue = false
          requestedSongs.forEach((requestedSong, index) => {
            if (song.link === requestedSong.link) {
              song.isInQueue = true
            }
            if (index === requestedSongs.length - 1) {
              resolve()
            }
          })
        })
      })
    })
  }

  private populateSongsList() {
    this.orchestreamName = this.navParams.data.partyName
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
      this.currentlyPlaying = `Currently Playing: ${requestedSongs[0].artist} - ${requestedSongs[0].songName}`
    })
    this.checkIfSongIsInQueue()
  }

  private presentToast(data) {
    if (this.toastInstance) {
      return
    }

    this.toastInstance = this.toastCtrl.create({
      message: `${this.whoRequested(data)} requested ${data.artist} - ${data.songName}`,
      duration: 1000,
      position: 'top'
    })

    this.toastInstance.onDidDismiss(() => {
      this.toastInstance = null
    })

    this.toastInstance.present()
  }

  private handleDisconnection() {
    this.reconnectionToastInstance = this.toastCtrl.create({
      message: `Connection has been lost, reconnecting..`,
      position: 'top'
    })

    this.reconnectionToastInstance.present()
  }

  private handleReconnection() {
    this.reconnectionToastInstance.dismiss()

    this.toastCtrl.create({
      message: `Connection has been re-established`,
      duration: 1000,
      position: 'top'
    }).present()
  }

  ionViewDidLoad() {
    this.getUser()
    this.populateSongsList()
    this.getCurrentSong()

    this.socketServiceProvider.on('songRequested', (data: ISongRequest) => {
      this.checkIfSongIsInQueue()

      this.presentToast(data)
    })

    this.socketServiceProvider.on('songChanged', this.getCurrentSong.bind(this))

    this.socketServiceProvider.on('disconnect', this.handleDisconnection.bind(this))

    this.socketServiceProvider.on('reconnect', this.handleReconnection.bind(this))
  }
}
