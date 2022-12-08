import React from 'react'
import { inject, observer } from 'mobx-react'
import { RouteComponentProps } from 'react-router'
import Hero from '@components/Hero'
import StakingStat from '@components/StakingStat'
import AmountInput from '@components/AmountInput'
import { STK_WAVES_ASSET_ID } from '@src/constants'
import { AccountStore, DappStore } from '@stores'

interface IInjectedProps {
  accountStore?: AccountStore
  dappStore?: DappStore
}

interface IProps extends IInjectedProps, RouteComponentProps {
}

interface IState {
  value: number
}

@inject('accountStore', 'dappStore')
@observer
class UnstakeComponent extends React.Component<IProps, IState> {

  state = { value: 0 }

  handleChange = (value: number) => this.setState({ value })

  sendUnstakeTx = async () => {
    alert(this.state.value)
  }

  render() {
    const rate = this.props.dappStore!.rate

    return <div className={'narrow-page-container'}>
      <Hero><h1>Unstake Waves</h1></Hero>
      <AmountInput label={'stkWaves amount'} source={STK_WAVES_ASSET_ID} target={'WAVES'} onChange={this.handleChange.bind(this)}/>
      <br/>
      <div className={'small gray'}>
        <p>stkWAVES reward bearing its quantity is stable, but redemption ratio grows daily.</p>
        <p>Current rate is 1 stkWAVES = {(rate).toFixed(8)} WAVES</p>
      </div>
      <br/>
      <button type="button" className="nes-btn is-primary wide-btn" onClick={this.sendUnstakeTx.bind(this)}>Unstake and get WAVES</button>
      <br/><br/>
      <StakingStat/>
    </div>
  }

}

export const Unstake = UnstakeComponent
