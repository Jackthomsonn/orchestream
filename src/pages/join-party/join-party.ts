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

@IonicPage()
@Component({
  selector: 'page-join-party',
  templateUrl: 'join-party.html',
})

export class JoinPartyPage {
  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private musicServiceProvider: MusicServiceProvider,
    private alertCtrl: AlertController,
    private socketServiceProvider: SocketServiceProvider,
    private nativeStorage: NativeStorage,
    private plt: Platform,
    private qrScanner: QRScanner) {
  }

  public getStarted() {
    const ionApp: any = document.getElementsByTagName('ion-app')[0]
    const loader = this.loadingCtrl.create({
      content: 'Joining Orchestream'
    })

    this.qrScanner.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {
        ionApp.style.display = 'none'
        this.qrScanner.show()

        let scanSub = this.qrScanner.scan().subscribe((orchestreamId: string) => {
          loader.present()
          ionApp.style.display = 'flex'

          this.doesPartyExist(orchestreamId).then((data) => {
            if (!data) {
              const alert = this.alertCtrl.create({
                title: 'Not a valid Orchestream badge',
                subTitle: 'Please provide a valid orchestream qr',
                buttons: ['Dismiss']
              })

              alert.present()
              loader.dismiss()

              return false;
            }

            this.musicServiceProvider.getSongs().subscribe(songs => {
              this.socketServiceProvider.partyId = orchestreamId
              this.socketServiceProvider.emit('joinRoom', this.socketServiceProvider.partyId)
              this.navCtrl.push(SongsListPage, { songs: songs })
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
    }).catch((error: any) => {
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
    })
  }

  public clearMemory() {
    this.nativeStorage.clear()
  }

  public closeCamera() {
    this.qrScanner.hide()
  }

  private doesPartyExist(orchestreamId: string) {
    return new Promise((resolve) => {
      this.musicServiceProvider.getHouseParties().subscribe((parties: Array<IParty>) => {
        for (let index = 0; index < parties.length; index++) {
          if (parties[index].partyId === orchestreamId) {
            resolve(true)
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
