import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { JoinPartyPage } from './../join-party/join-party';
import { Haptic } from 'ionic-angular/tap-click/haptic'
import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { NativeStorage } from '@ionic-native/native-storage'

@IonicPage()
@Component({
  selector: 'page-setup',
  templateUrl: 'setup.html',
})

export class SetupPage {
  public nickname: string

  constructor(
    private haptic: Haptic,
    private nativeStorage: NativeStorage,
    private navCtrl: NavController,
    private alertCtrl: AlertController) {
  }

  public setUserPreferences() {
    if (this.haptic.available()) {
      this.haptic.impact({ style: 'heavy' })
    }

    this.nativeStorage.setItem('username', this.nickname).then(() => {
      this.navCtrl.setRoot(JoinPartyPage)
    }).catch(error => {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: JSON.stringify(error),
        buttons: ['Dismiss']
      })
      alert.present()
    })
  }
}
