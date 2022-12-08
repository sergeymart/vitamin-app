import React from 'react'
import './index.scss'
import { inject, observer } from 'mobx-react'
import { DappStore } from '@stores'

interface IInjectedProps {
  dappStore?: DappStore
}

interface IProps extends IInjectedProps {
}

interface IState {}

@inject('dappStore')
@observer
class StakingStat extends React.Component<IProps, IState> {
  render() {

    const dappStore = this.props.dappStore!

    const stakers = dappStore.stakers || 0
    const staked = dappStore.totalStaked || 0
    const stkWavesRate = dappStore.wavesRate * dappStore.rate
    const apr = dappStore.apr

    return <div className="nes-table stat-wrapper">
      <table className="nes-table is-centered">
        <thead>
        <tr>
          <th>APR</th>
          <th>Staked with Vitamin</th>
          <th>Stakers</th>
          <th>stkWaves Market Cap</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{apr.toFixed(2)}%</td>
          <td>{(staked / 1e8).toFixed(2)} WAVES</td>
          <td>{stakers}</td>
          <td>${(staked / 1e8 * stkWavesRate).toFixed(2)}</td>
        </tr>
        </tbody>
      </table>
    </div>
  }
}

export default StakingStat
