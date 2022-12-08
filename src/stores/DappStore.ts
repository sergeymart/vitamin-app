import { ELoginType } from '@src/interface'

import { SubStore } from './SubStore'
import { action, computed, observable } from 'mobx'
import { RootStore } from '@stores/RootStore'
import { checkSlash } from '@utils'
import BigNumber from 'bignumber.js'
import { PRECISION, STK_WAVES_ASSET_ID, STK_WAVES_CONTRACT, SWOPFI_WAVES_USDN_CONTRACT } from '@src/constants'

interface IArgument {
  type: string,
  value: string | number | boolean | { type: string, value: string | number | boolean }[]
}

interface IPayment {
  assetId: string,
  amount: number
}

// https://nodes-testnet.wavesnodes.com/transactions/info/6GXYoHHkHzpYq94pXYaQsSgMVkedwgFnp1VJEiqeRqFz
// https://api-testnet.wavesplatform.com/v0/transactions/invoke-script?sender=3N1WbxZTdjLm3L8faJGiCTRk3kfaAofzd16&dapp=3MsN1Q6UqKokdBUxv9Azrh5CGSAQ3UQzTsu&sort=desc&limit=100

class DappStore extends SubStore {

  @observable rate: number = 1
  @observable stakers: number = 0
  @observable wavesRate: number = 0
  @observable totalStaked: number = 0
  @observable apr: number = 0

  constructor(rootStore: RootStore) {
    super(rootStore)
    setInterval(this.update.bind(this), 60000)
    setInterval(this.updateWavesRate.bind(this), 60000)
    this.updateWavesRate()
  }

  async update() {
    try {
      if (!this.rootStore.accountStore.network) return
      this.rate = await this.getRate() as number
      this.stakers = await this.getStakersNum() as number
      this.totalStaked = await this.getTotalStaked() as number
      this.apr = await this.getApr() as number
    } catch (e) {
      this.rootStore.notificationStore.notify(`${e.name} ${e.message}`, { type: 'error' })
    }
  }

  @computed get stkWavesRate() {
    return this.wavesRate * this.rate
  }

  @action
  async getStakersNum() {
    if (!this.rootStore.accountStore.network) return
    const server = this.rootStore.accountStore.network.server
    const { height } = await fetch(`${checkSlash(server)}blocks/height`).then(r => r.json())
    const path = `${checkSlash(server)}assets/${STK_WAVES_ASSET_ID}/distribution/${height - 5}/limit/1000`
    const { items } = await fetch(path).then(r => r.json())
    return +Object.entries(items).length
  }

  @action
  async getTotalStaked() {
    if (!this.rootStore.accountStore.network) return
    const server = this.rootStore.accountStore.network.server
    const { value } = await fetch(`${checkSlash(server)}addresses/data/${STK_WAVES_CONTRACT}/k_balance`).then(r => r.json())
    return +value
  }

  @action
  async getApr() {
    if (!this.rootStore.accountStore.network) return
    const server = this.rootStore.accountStore.network.server
    const { value } = await fetch(`${checkSlash(server)}addresses/data/${STK_WAVES_CONTRACT}/k_growthRate`).then(r => r.json())
    return +(+(value || 0) * 86400 / PRECISION)
  }

  @action
  async getRate() {
    if (!this.rootStore.accountStore.network) return
    const server = this.rootStore.accountStore.network.server
    const path = `${checkSlash(server)}addresses/data/${STK_WAVES_CONTRACT}`
    const [{ value: lastRate }, { value: growthRate }, { value: lastCompoundTime }] = await fetch(path, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keys: [
          'k_lastRate',
          'k_growthRate',
          'k_lastCompoundTime',
        ],
      }),
    }).then(r => r.json())

    const now = Math.floor(Date.now() / 1000)
    const dt = now > lastCompoundTime + 86400 ? 86400 : now - lastCompoundTime
    const rate = new BigNumber(growthRate).times(dt).plus(lastRate).div(PRECISION).toNumber()
    return rate
  }

  @action
  async updateWavesRate() {
    const path = `${checkSlash('https://nodes.swop.fi')}addresses/data/${SWOPFI_WAVES_USDN_CONTRACT}`
    const [{ value: waves }, { value: usdn }] = await fetch(path, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keys: [
          'A_asset_balance',
          'B_asset_balance',
        ],
      }),
    }).then(r => r.json())
    const rate = 1 / (waves / usdn / 100)
    this.wavesRate = rate
  }

  callCallableFunction = (func: 'stake' | 'unstake', args: IArgument[], payment: IPayment[]) => {
    const { accountStore } = this.rootStore

    const transactionData = {
      dApp: STK_WAVES_CONTRACT,
      call: {
        function: func,
        args,
      },
      fee: { tokens: this.rootStore.accountStore.fee, assetId: 'WAVES' },
      payment,
    }

    const tx = {
      type: 16,
      data: transactionData,
    }

    if (!accountStore.isAuthorized || !accountStore.loginType) {
      this.rootStore.notificationStore.notify('Application is not authorized', { type: 'warning' })
      return
    }

    if (accountStore.loginType === ELoginType.KEEPER) {
      return this.rootStore.keeperStore.sendTx(tx)
    }

    if (accountStore.loginType === ELoginType.EXCHANGE) this.rootStore.signerStore.sendTx(tx)

  }
}

export default DappStore
