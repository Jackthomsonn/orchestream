import { Haptic } from 'ionic-angular/tap-click/haptic';
import { SetupPage } from './../setup/setup';
import { NavController } from 'ionic-angular/navigation/nav-controller'
import { Component } from '@angular/core'
import { IonicPage } from 'ionic-angular'
import { Slides } from 'ionic-angular/components/slides/slides'
import { ViewChild } from '@angular/core'

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})

export class WelcomePage {
  @ViewChild(Slides) slides: Slides;

  constructor(
    private navCtrl: NavController,
    private haptic: Haptic) {
  }

  public goToNextSlide() {
    this.slides.slideNext()

    if (this.haptic.available()) {
      this.haptic.impact({ style: 'heavy' })
    }
  }

  public goToSetup() {
    this.navCtrl.push(SetupPage)

    if (this.haptic.available()) {
      this.haptic.impact({ style: 'heavy' })
    }
  }
}
