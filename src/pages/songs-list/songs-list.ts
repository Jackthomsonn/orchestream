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
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

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
  private handleReconnectionToastInstance: Toast
  private nickname: string
  private forcedDisconnection: boolean
  private throttleRequests: boolean

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
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
      loading.dismiss()
      this.checkIfSongIsInQueue()
    })
  }

  public requestSong(song: ISong) {
    if(this.throttleRequests) {
      return
    }

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
      this.throttleRequests = true
      setTimeout(() => {
        this.throttleRequests = false
      }, 2000)
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
      duration: 2000,
      position: 'top'
    })

    this.toastInstance.onDidDismiss(() => {
      this.toastInstance = undefined
    })

    this.toastInstance.present()
  }

  private handleDisconnection() {
    if (this.reconnectionToastInstance) {
      return
    }

    if (this.forcedDisconnection) {
      return
    } else {
      this.reconnectionToastInstance = this.toastCtrl.create({
        message: `Connection has been lost, reconnecting..`,
        position: 'top'
      })

      this.reconnectionToastInstance.onDidDismiss(() => {
        this.reconnectionToastInstance = undefined
      })

      this.reconnectionToastInstance.present()
    }
  }

  private handleReconnection() {
    if(this.reconnectionToastInstance) {
      this.reconnectionToastInstance.dismiss()
    }

    if(this.handleReconnectionToastInstance) {
      return
    }

    this.socketServiceProvider.emit('joinRoom', this.socketServiceProvider.partyId)

    this.handleReconnectionToastInstance = this.toastCtrl.create({
      message: `Connection has been re-established`,
      duration: 2000,
      position: 'top'
    })

    this.handleReconnectionToastInstance.onDidDismiss(() => {
      this.handleReconnectionToastInstance = undefined
    })

    this.handleReconnectionToastInstance.present()
  }

  ionViewDidLoad() {
    this.getUser()
    this.populateSongsList()
    this.getCurrentSong()

    this.forcedDisconnection = false

    this.socketServiceProvider.on('songRequested', (data: ISongRequest) => {
      this.checkIfSongIsInQueue()

      this.presentToast(data)
    })

    this.socketServiceProvider.on('songChanged', this.getCurrentSong.bind(this))

    this.socketServiceProvider.on('disconnect', this.handleDisconnection.bind(this))

    this.socketServiceProvider.on('reconnect', this.handleReconnection.bind(this))

    this.socketServiceProvider.socket.connect()
  }

  ionViewWillUnload() {
    this.forcedDisconnection = true
    this.socketServiceProvider.socket.close()
  }
}
