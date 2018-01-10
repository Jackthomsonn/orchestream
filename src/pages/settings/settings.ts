import { Haptic } from 'ionic-angular/tap-click/haptic';
import { AppVersion } from '@ionic-native/app-version'
import { NativeStorage } from '@ionic-native/native-storage'
import { Component } from '@angular/core'
import { IonicPage } from 'ionic-angular'
import { ToastController } from 'ionic-angular/components/toast/toast-controller'

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})

export class SettingsPage {
  public nickname: string
  public appVersion: string
  public appName: string

  constructor(
    private nativeStorage: NativeStorage,
    private toastCtrl: ToastController,
    private appInfo: AppVersion,
    private haptic: Haptic) {
  }

  public update() {
    if (this.haptic.available()) {
      this.haptic.impact({ style: 'heavy' })
    }
    this.nativeStorage.setItem('username', this.nickname).then(() => {
      const toast = this.toastCtrl.create({
        message: 'Nickname updated successfully',
        duration: 1000,
        position: 'top'
      })

      toast.present()
    })
  }

  ionViewDidLoad() {
    this.nativeStorage.getItem('username').then(nickname => {
      this.nickname = nickname
    })

    this.appInfo.getVersionNumber().then((versionNumber) => this.appVersion = versionNumber)
    this.appInfo.getAppName().then((appName) => this.appName = appName)
  }
}
