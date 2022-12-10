import React from 'react'
import { inject, observer } from 'mobx-react'
import { RouteComponentProps } from 'react-router'
import Hero from '@components/Hero'
import AmountInput from '@components/AmountInput'
import StakingStat from '@components/StakingStat'
import { STK_WAVES_ASSET_ID } from '@src/constants'
import { AccountStore, DappStore, NotificationStore } from '@stores'

interface IInjectedProps {
  accountStore?: AccountStore
  dappStore?: DappStore
  notificationStore?: NotificationStore
}

interface IProps extends IInjectedProps, RouteComponentProps {
}

interface IState {
  value: number
}

@inject('accountStore', 'dappStore', 'notificationStore')
@observer
class StakeComponent extends React.Component<IProps, IState> {

  state = { value: 0 }

  handleChange = (value: number) => this.setState({ value })

  sendStakeTx = async () => {
    if (!this.props.accountStore!.isAuthorized) {
      this.props.notificationStore!.isOpenLoginDialog = true
      return
    }
    await this.props.dappStore!.callCallableFunction('stake', [], [{
      amount: +(+this.state.value * 1e8).toFixed(0),
      assetId: 'WAVES',
    }])
  }

  render() {
    const rate = this.props.dappStore!.rate

    return <div className={'narrow-page-container'}>
      <Hero><h1>Waves Liquid Staking</h1></Hero>
      <AmountInput label={'Waves amount'} source={'WAVES'} target={STK_WAVES_ASSET_ID} onChange={this.handleChange.bind(this)}/>
      <br/>
      <div className={'small gray'}>
        <p>stkWAVES reward bearing its quantity is stable, but redemption ratio grows daily.</p>
        <p>Current rate is 1 WAVES = {(1 / rate).toFixed(8)} stkWaves</p>
      </div>
      <br/>
      <button type="button" className="nes-btn is-primary wide-btn" onClick={this.sendStakeTx.bind(this)}>Stake and get stkWaves</button>
      <br/><br/>
      <StakingStat/>
    </div>
  }

}

export const Stake = StakeComponent
