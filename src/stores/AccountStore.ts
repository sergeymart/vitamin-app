import { action, autorun, computed, observable } from 'mobx'
import axios from 'axios'

import { base58Decode } from '@waves/ts-lib-crypto'
import { IAsset } from '@stores/KeeperStore'
import { checkSlash, INetwork, Network } from '@utils'
import { RootStore } from '@stores/RootStore'
import { ELoginType } from '@src/interface'

import { SubStore } from './SubStore'

class AccountStore extends SubStore {
  @observable assets: { [name: string]: IAsset } = { 'WAVES': { name: 'WAVES', assetId: 'WAVES', decimals: 8, balance: 0, quantity: 0 } }
  @observable scripted = false
  @observable network: INetwork | null = null
  @observable address: string | null = null
  @observable loginType: ELoginType | null = null

  constructor(rootStore: RootStore) {
    super(rootStore)
    setInterval(this.updateAssets, 10000)
    autorun(this.updateAssets)
  }

  updateAssets = async () => {
    if (this.address) {
      await this.updateAccountAssets(this.address)
      await this.rootStore.dappStore.update.call(this.rootStore.dappStore)
    }
  }

  @computed get isAuthorized() {
    return this.rootStore.keeperStore.isApplicationAuthorizedInWavesKeeper ||
      this.rootStore.signerStore.isApplicationAuthorizedInWavesExchange
  }

  @computed get fee() {
    return this.scripted ? '0.009' : '0.005'
  }

  @action
  async getWavesBalance(address: string) {
    if (!this.network) return
    const server = this.network.server
    const path = `${checkSlash(server)}addresses/balance/${address}`
    const resp = await fetch(path)
    const { balance } = (await (resp).json())
    return balance
  }

  @action
  async updateAccountAssets(address: string) {
    if (!this.network) return
    const server = this.network.server

    const wavesBalance = await this.getWavesBalance(address)
    const path = `${checkSlash(server)}assets/balance/${address}`
    const resp = await fetch(path)
    const assets: { balances: { assetId: string, balance: number, issueTransaction: { name: string, decimals: number, quantity: number } }[] } = (await (resp).json())

    const ids = assets.balances.filter((asset) => asset.issueTransaction === null).map((asset) => asset.assetId)
    if (ids.length !== 0) {
      const assetDetails = await axios.post('/assets/details', { ids }, { baseURL: `${checkSlash(server)}` })

      assetDetails.data.forEach((assetDetails: any) => {
        assets.balances
          .filter(x => x.assetId === assetDetails.assetId)
          .forEach(x => {
            x.issueTransaction = {
              name: assetDetails.name,
              decimals: assetDetails.decimals,
              quantity: assetDetails.quantity,
            }
          })
      })
    }

    this.assets = {
      'WAVES': { name: 'WAVES', assetId: 'WAVES', decimals: 8, balance: wavesBalance, quantity: 0 },
      ...assets.balances.reduce((acc, { assetId, balance, issueTransaction: { quantity, name, decimals } }) =>
        ({ ...acc, [assetId]: { assetId, decimals, balance, quantity, name } }), {}),
    }
  }

  getNetworkByAddress = (address: string): INetwork | null => {
    const byte = base58Decode(address)[1]

    try {
      const network = Network.getNetworkByByte(byte)

      return network ? network : null
    } catch (e) {
      this.rootStore.notificationStore.notify(e.message, { type: 'error' })
    }
    return null
  }

}

export default AccountStore
