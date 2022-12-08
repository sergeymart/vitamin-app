import { AccountStore, HistoryStore, NotificationStore } from './index'
import KeeperStore from '@stores/KeeperStore'
import SignerStore from '@stores/SignerStore'
import DappStore from '@stores/DappStore'

class RootStore {
  public accountStore: AccountStore
  public notificationStore: NotificationStore
  public dappStore: DappStore
  public historyStore: HistoryStore
  public keeperStore: KeeperStore
  public signerStore: SignerStore

  constructor() {
    this.accountStore = new AccountStore(this)
    this.notificationStore = new NotificationStore(this)
    this.dappStore = new DappStore(this)
    this.historyStore = new HistoryStore(this)
    this.keeperStore = new KeeperStore(this)
    this.signerStore = new SignerStore(this)
  }
}

export { RootStore }
