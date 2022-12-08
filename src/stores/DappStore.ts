import { base58Decode, base64Encode } from '@waves/ts-lib-crypto'

import { ELoginType, ICallableArgumentType } from '@src/interface'

import { SubStore } from './SubStore'
import { action, computed, observable } from 'mobx'
import { RootStore } from '@stores/RootStore'
import { checkSlash } from '@utils'
import { STK_WAVES_ASSET_ID, STK_WAVES_CONTRACT, SWOPFI_WAVES_USDN_CONTRACT } from '@src/constants'

interface IKeeperTransactionDataCallArg {
  type: string,
  value: string | number | boolean | { type: string, value: string | number | boolean }[]
}

interface IKeeperTransactionDataCall {
  function: string,
  args: IKeeperTransactionDataCallArg[]
}

interface IKeeperTransactionDataFee {
  tokens: string,
  assetId: string
}

interface IKeeperTransactionPayment {
  assetId: string,
  tokens: number
}

interface IKeeperTransactionData {
  dApp: string,
  call: IKeeperTransactionDataCall,
  payment: IKeeperTransactionPayment[]
  fee: IKeeperTransactionDataFee,
}

export interface IKeeperTransaction {
  type: number,
  data: IKeeperTransactionData
}

export interface IArgument {
  type: ICallableArgumentType,
  value: string | undefined | IArgumentInput[]
  byteVectorType?: 'base58' | 'base64'
}

export interface IArgumentInput {
  type: ICallableArgumentType,
  value: string | undefined
  byteVectorType?: 'base58' | 'base64'
}

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
    // @todo rate updater
    try {
      if (!this.rootStore.accountStore.network) return
      this.rate = await this.getRate() as any // +((Math.random() / 1000).toFixed(8))
      this.stakers = await this.getStakersNum() as any
      this.totalStaked = await this.getTotalStaked() as any
      this.apr = await this.getApr() as any
    } catch (e) {
      console.log(e)
    }
  }

  @computed get stkWavesRate() {
    return this.wavesRate * this.rate
  }

  @action
  async getStakersNum() {
    if (!this.rootStore.accountStore.network) return
    try {
      const server = this.rootStore.accountStore.network.server
      const { height } = await fetch(`${checkSlash(server)}blocks/height`).then(r => r.json())
      const path = `${checkSlash(server)}assets/${STK_WAVES_ASSET_ID}/distribution/${height - 5}/limit/1000`
      const { items } = await fetch(path).then(r => r.json())
      return +Object.entries(items).length
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async getTotalStaked() {
    if (!this.rootStore.accountStore.network) return
    try {
      const server = this.rootStore.accountStore.network.server
      const { value } = await fetch(`${checkSlash(server)}addresses/data/${STK_WAVES_CONTRACT}/k_balance`).then(r => r.json())
      return +value
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async getApr() {
    if (!this.rootStore.accountStore.network) return
    try {
      const server = this.rootStore.accountStore.network.server
      const { value } = await fetch(`${checkSlash(server)}addresses/data/${STK_WAVES_CONTRACT}/k_growthRate`).then(r => r.json())
      return +(+value * 86400 / 1e8)
    } catch (e) {
      console.log(e)
    }
  }  @action
  async getRate() {
    if (!this.rootStore.accountStore.network) return
    try {
      const server = this.rootStore.accountStore.network.server
      const { value } = await fetch(`${checkSlash(server)}addresses/data/${STK_WAVES_CONTRACT}/k_lastRate`).then(r => r.json())
      return +(+value / 1e18)
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async updateWavesRate() {
    // @todo here only prod
    try {
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
    } catch (e) {
      console.log(e)
    }
  }

  private convertArgValue = (arg: IArgumentInput): (string | number | boolean) => {
    const { value, type, byteVectorType } = arg
    if (value === undefined) {
      this.rootStore.notificationStore.notify('value is undefined', { type: 'error' })
      return ''
    }
    if (type === 'Boolean' && ['true', 'false'].includes(value)) return value === 'true'
    if (type === 'Int' && !isNaN(+value)) return +value
    if (byteVectorType === 'base58') return `base64:${b58strTob64Str(value as string)}`
    if (byteVectorType === 'base64') return `base64:${value}`
    else return value
  }

  private convertArgValueList = (value: IArgumentInput[]): IArgumentInput[] => value.map(item => {
    return { ...item, type: convertArgType(item.type), value: this.convertArgValue(item) } as IArgumentInput
  })

  private convertArgs = (args: IArgument[]): IKeeperTransactionDataCallArg[] =>
    args.filter(({ value }) => value !== undefined || !(value as unknown as IArgumentInput[]).some(item => item.value === undefined))
      .map(arg => {
        const convertedValue = arg.type.startsWith('List')
          ? this.convertArgValueList(arg.value as IArgumentInput[])
          : this.convertArgValue(arg as IArgumentInput)
        return ({ type: convertArgType(arg.type), value: convertedValue } as IKeeperTransactionDataCallArg)
      })

  callCallableFunction = (address: string, func: string, inArgs: IArgument[], payment: IKeeperTransactionPayment[]) => {
    const { accountStore } = this.rootStore
    let args: IKeeperTransactionDataCallArg[] = []
    try {
      args = this.convertArgs(inArgs)
    } catch (e) {
      console.error(e)
      this.rootStore.notificationStore.notify(e, { type: 'error' })
    }

    const transactionData: IKeeperTransactionData = {
      dApp: address,
      call: {
        function: func,
        args,
      },
      fee: { tokens: this.rootStore.accountStore.fee, assetId: 'WAVES' },
      payment,
    }

    const tx: IKeeperTransaction = {
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

  getTransactionJson = (address: string, func: string, inArgs: IArgument[], payment: IKeeperTransactionPayment[]) => {
    const { accountStore } = this.rootStore
    let args: IKeeperTransactionDataCallArg[] = []
    try {
      args = this.convertArgs(inArgs)
    } catch (e) {
      console.error(e)
      this.rootStore.notificationStore.notify(e, { type: 'error' })
    }

    const transactionData: IKeeperTransactionData = {
      dApp: address,
      call: {
        function: func,
        args,
      },
      fee: { tokens: this.rootStore.accountStore.fee, assetId: 'WAVES' },
      payment,
    }

    const tx: IKeeperTransaction = {
      type: 16,
      data: transactionData,
    }

    if (!accountStore.isAuthorized || !accountStore.loginType) {
      this.rootStore.notificationStore.notify('Application is not authorized', { type: 'warning' })
      return
    }

    if (accountStore.loginType === 'keeper') {
      return this.rootStore.keeperStore.buildTx(tx)
    }

    if (accountStore.loginType === 'exchange') this.rootStore.signerStore.buildTx(tx)

  }
}

export function b58strTob64Str(str = ''): string {
  const error = 'incorrect base58'
  try {
    return base64Encode(base58Decode(str))
  } catch (e) {
    throw error
  }
}

function convertArgType(type: ICallableArgumentType | string): string {
  if (type.startsWith('List')) return 'list'
  switch (type) {
    case 'Boolean':
      return 'boolean'
    case 'ByteVector':
      return 'binary'
    case 'Int':
      return 'integer'
    case 'String':
      return 'string'
  }
  return type
}

export default DappStore
