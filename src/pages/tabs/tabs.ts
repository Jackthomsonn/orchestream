import { Component } from '@angular/core'

import { JoinPartyPage } from '../join-party/join-party'
import { SettingsPage } from '../settings/settings'

@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  public joinPartyRoot = JoinPartyPage
  public settingsRoot = SettingsPage
}