import { QRScanner } from '@ionic-native/qr-scanner'
import { NativeStorage } from '@ionic-native/native-storage'
import { WelcomePage } from './../pages/welcome/welcome'
import { NgModule, ErrorHandler } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular'
import { MyApp } from './app.component'

import { HttpClientModule } from '@angular/common/http'

import { JoinPartyPage } from '../pages/join-party/join-party'
import { SongsListPage } from '../pages/songs-list/songs-list'
import { SettingsPage } from '../pages/settings/settings'

import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'

import { MusicServiceProvider } from '../providers/music-service/music-service'
import { SocketServiceProvider } from '../providers/socket-service/socket-service'
import { AppVersion } from '@ionic-native/app-version'

@NgModule({
  declarations: [
    MyApp,
    JoinPartyPage,
    SongsListPage,
    WelcomePage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: true
    }),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    JoinPartyPage,
    SongsListPage,
    WelcomePage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    MusicServiceProvider,
    SocketServiceProvider,
    NativeStorage,
    QRScanner,
    AppVersion
  ]
})
export class AppModule { }
