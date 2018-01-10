import { SettingsPage } from './../settings/settings';
import { Component } from '@angular/core'
import { IonicPage, NavController, AlertController } from 'ionic-angular'
import { LoadingController } from 'ionic-angular/components/loading/loading-controller'
import { Platform } from 'ionic-angular/platform/platform'

import { SocketServiceProvider } from './../../providers/socket-service/socket-service'
import { MusicServiceProvider } from './../../providers/music-service/music-service'
import { NativeStorage } from '@ionic-native/native-storage'

import { SongsListPage } from './../songs-list/songs-list'
import { WelcomePage } from '../welcome/welcome'

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner'
import { IParty } from '../../interfaces/IParty'
import { Haptic } from 'ionic-angular/tap-click/haptic';

@IonicPage()
@Component({
  selector: 'page-join-party',
  templateUrl: 'join-party.html'
})

export class JoinPartyPage {
  private partyName: string

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private musicServiceProvider: MusicServiceProvider,
    private alertCtrl: AlertController,
    private socketServiceProvider: SocketServiceProvider,
    private nativeStorage: NativeStorage,
    private plt: Platform,
    private qrScanner: QRScanner,
    private haptic: Haptic) {
  }

  public getStarted = () => {
    if (this.haptic.available()) {
      this.haptic.impact({ style: 'heavy' })
    }
    this.qrScanner.prepare()
      .then(this.initialiseQrReader.bind(this))
      .catch(this.handleQrReaderException.bind(this))
  }

  public goToSettings = () => {
    this.navCtrl.push(SettingsPage)
  }

  private handleQrReaderException() {
    const alert = this.alertCtrl.create({
      title: 'Camera Access',
      subTitle: 'Orchestream needs access to your camera in order to join',
      buttons: [{
        text: 'Settings',
        role: 'settings',
        handler: () => {
          this.qrScanner.openSettings()
        }
      }, {
        text: 'Cancel'
      }]
    })

    alert.present()
  }

  private initialiseQrReader(status: QRScannerStatus) {
    if (!status.authorized) {
      return
    }

    const ionApp: any = document.getElementsByTagName('ion-app')[0]
    const loader = this.loadingCtrl.create({
      content: 'Joining Orchestream'
    })

    ionApp.style.display = 'none'
    this.qrScanner.show()

    let scanSub = this.qrScanner.scan().subscribe((orchestreamId: string) => {
      loader.present()
      ionApp.style.display = 'flex'

      this.doesPartyExist(orchestreamId).then((data) => {
        if (!data) {
          const alert = this.alertCtrl.create({
            title: 'Not a valid Orchestream badge',
            subTitle: 'Please provide a valid orchestream badge',
            buttons: ['Dismiss']
          })

          alert.present()
          loader.dismiss()

          return false
        }

        this.musicServiceProvider.getSongs().subscribe(songs => {
          this.socketServiceProvider.partyId = orchestreamId
          this.socketServiceProvider.emit('joinRoom', this.socketServiceProvider.partyId)
          this.navCtrl.push(SongsListPage, { songs: songs, partyName: this.getPartyName() })
          loader.dismiss()
        })
      })
    }, error => {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: JSON.stringify(error),
        buttons: ['Dismiss']
      })

      this.qrScanner.hide()

      alert.present()
      scanSub.unsubscribe()
    })
  }

  private setPartyName(partyName) {
    this.partyName = partyName
  }

  private getPartyName() {
    return this.partyName
  }

  private doesPartyExist(orchestreamId: string) {
    return new Promise((resolve) => {
      this.musicServiceProvider.getHouseParties().subscribe((parties: Array<IParty>) => {
        for (let index = 0; index < parties.length; index++) {
          if (parties[index].partyId === orchestreamId) {
            resolve(true)
            this.setPartyName(parties[index].name)
          } else if (parties[index].partyId !== orchestreamId && index === parties.length - 1) {
            resolve(false)
          }
        }
      })
    })
  }

  private isInitialLoad() {
    this.plt.ready().then(() => {
      this.nativeStorage.getItem('username').then(data => {
        return
      }).catch(error => {
        this.navCtrl.push(WelcomePage)
      })
    })
  }

  ionViewDidLoad() {
    this.isInitialLoad()
  }
}
