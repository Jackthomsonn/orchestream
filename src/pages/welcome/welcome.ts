import { JoinPartyPage } from './../join-party/join-party'
import { NativeStorage } from '@ionic-native/native-storage'
import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { AlertController } from 'ionic-angular/components/alert/alert-controller'

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})

export class WelcomePage {
  public nickname: string

  constructor(
    private navCtrl: NavController,
    private nativeStorage: NativeStorage,
    private alertCtrl: AlertController) {
  }

  public setUserPreferences() {
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
