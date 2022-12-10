import React from 'react'
import { inject, observer } from 'mobx-react'
import AccountStore from '@stores/AccountStore'
import { RouteComponentProps } from 'react-router'
import Hero from '@components/Hero'
import { DappStore } from '@stores'
import { STK_WAVES_ASSET_ID } from '@src/constants'

interface IInjectedProps {
  accountStore?: AccountStore
  dappStore?: DappStore
}

interface IProps extends IInjectedProps, RouteComponentProps {
}

interface IState {
}

@inject('accountStore', 'dappStore')
@observer
class AccountComponent extends React.Component<IProps, IState> {
  countYouGet() {
    const rate = this.props.dappStore!.rate
    return (+this.stkWaveAmount() * rate)
  }

  stkWaveAmount() {
    const tokenInfo = this.props.accountStore!.assets[STK_WAVES_ASSET_ID]
    if (!tokenInfo) return 0
    return (tokenInfo.balance / Math.pow(10, tokenInfo.decimals))
  }

  render() {
    const stkWavesAmount = this.stkWaveAmount()
    const youGet = this.countYouGet()
    // const totalIncome = youGet - stkWavesAmount

    return <div className={'wide-page-container'}>
      <Hero><h1>WAVES Liquid staking analytics</h1></Hero>
      <table className={'nes-table'}>
        <thead>
        <tr>
          <th>Initial Staked Waves</th>
          <th>stkWaves amount</th>
          <th>Current stkWaves Price</th>
          {/*<th>Total income %</th>*/}
          <th>Waves if unstake today</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{this.props.accountStore!.initialStake.toFixed(8)}</td>
          <td>{stkWavesAmount.toFixed(8)}</td>
          <td>{this.props.dappStore!.rate.toFixed(2)} WAVES</td>
          {/*<td>{totalIncome.toFixed(2)}%</td>*/}
          <td>{youGet.toFixed(8)}</td>
        </tr>
        </tbody>
      </table>
    </div>
  }
}

export const Account = AccountComponent
