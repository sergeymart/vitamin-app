import { action, observable } from 'mobx'
import { RootStore } from '@stores'
import { SubStore } from './SubStore'
import { Signer } from '@waves/signer'
import { ProviderWeb } from '@waves.exchange/provider-web'
import { ProviderCloud } from '@waves.exchange/provider-cloud'
import { getExplorerLink, INetwork, Network, networks } from '@utils'
import { ELoginType, LoginType } from '@src/interface'
import { waitForTx } from '@waves/waves-transactions'
import Decimal from 'decimal.js'

class SignerStore extends SubStore {

  loginType: LoginType | null
  signer?: any

  @observable isApplicationAuthorizedInWavesExchange = false

  constructor(rootStore: RootStore) {
    super(rootStore)

    this.loginType = null
  }

  initSignerWeb = async () => {
    const network = this.getNetworkByDapp()

    if (network.clientOrigin) {
      this.signer = new Signer({ NODE_URL: network.server })
      await this.signer.setProvider(new ProviderWeb(network.clientOrigin))
    } else {
      this.signer = undefined
      this.rootStore.notificationStore.notify(
        `Unfortunately, Exchange does not support a ${network.server} network at this time. Sign in with Keeper.`,
        { type: 'error' },
      )
    }
  }

  initSignerCloud = async () => {
    const network = this.getNetworkByDapp()

    if (network.clientOrigin) {
      this.signer = new Signer({ NODE_URL: network.server })
      await this.signer.setProvider(new ProviderCloud())
    } else {
      this.signer = undefined
      this.rootStore.notificationStore.notify(
        `Unfortunately, Exchange does not support a ${network.server} network at this time. Sign in with Keeper.`,
        { type: 'error' },
      )
    }
  }

  login = async (type: LoginType) => {
    this.loginType = type

    if (type === LoginType.SEED) await this.initSignerWeb()
    if (type === LoginType.EMAIL) await this.initSignerCloud()

    if (!this.signer) {
      return
    }

    const account = await this.signer.login()

    if ('address' in account) {
      const byte = await this.signer!.getNetworkByte()
      this.rootStore.accountStore.network = this.getNetworkByCharCode(byte)
      this.isApplicationAuthorizedInWavesExchange = true
      this.rootStore.accountStore.loginType = ELoginType.EXCHANGE
      this.rootStore.accountStore.address = account.address
      await this.rootStore.accountStore.checkScripted()
    }
  }

  getNetworkByDapp = () => {
    // @todo
    // const pathname = this.rootStore.historyStore!.currentPath
    // const networkByAddress = this.rootStore.accountStore!.getNetworkByAddress(pathname)
    // const network = (networkByAddress != null) ? networkByAddress : networks.mainnet

    const network = networks.testnet

    return network
  }

  @action
  async buildTx({ data: tx }: any, opts: { notStopWait?: boolean } = {}) {
    if ('payment' in tx) {
      tx.payment = tx.payment.map(({ tokens: amount, assetId }: any) => {
        const decimals = this.rootStore.accountStore.assets[assetId].decimals
        return ({ amount: new Decimal(10).pow(decimals).mul(+amount).toNumber(), assetId })
      })
    }

    if ('fee' in tx) {
      delete tx.feeAssetId
      tx.fee = new Decimal(10).pow(8).mul(+this.rootStore.accountStore.fee).toNumber()
    }

    try {
      return this.signer!.invoke(tx).sign()
    } catch (err) {
      console.error(err)
      this.rootStore.notificationStore.notify((typeof err === 'string' ? err : err.message), { type: 'error' })
    }
  }

  @action
  async sendTx({ data: tx }: any, opts: { notStopWait?: boolean } = {}) {
    try {
      if ('fee' in tx) {
        delete tx.feeAssetId
        delete tx.fee
      }
      let txId

      delete tx.fee

      const transaction = await this.signer!.invoke(tx).broadcast() as any
      txId = (transaction as any).id || ''

      const { accountStore: { network }, notificationStore } = this.rootStore
      const link = network ? getExplorerLink(network!.code, txId, 'tx') : undefined
      notificationStore.notify(`Transaction sent: ${txId}\n`, { type: 'info' })

      const res = await waitForTx(txId, { apiBase: network!.server }) as any

      const isFailed = res.applicationStatus && res.applicationStatus === 'script_execution_failed'

      notificationStore.notify(
        isFailed
          ? `Script execution failed`
          : `Success`, { type: isFailed ? 'error' : 'success', link, linkTitle: 'View transaction' },
      )
    } catch (err) {
      console.error(err)
      this.rootStore.notificationStore.notify((typeof err === 'string' ? err : err.message), { type: 'error' })
    }
  }

  getNetworkByCharCode = (byte: number): INetwork | null => {
    try {
      const network = Network.getNetworkByByte(byte)
      return network ? network : null
    } catch (e) {
      this.rootStore.notificationStore.notify(e.message, { type: 'error' })
    }
    return null
  }

}

export default SignerStore
