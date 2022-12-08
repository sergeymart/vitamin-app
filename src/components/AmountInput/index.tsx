import React from 'react'
import { AccountStore, DappStore, HistoryStore, NotificationStore } from '@stores'
import { inject, observer } from 'mobx-react'
import './index.scss'

interface IProps {
  accountStore?: AccountStore
  notificationStore?: NotificationStore
  historyStore?: HistoryStore
  dappStore?: DappStore
  label: string
  source: string
  target: string
  onChange: (value: number) => void
}

interface IState {
  value: number
}

@inject('accountStore', 'notificationStore', 'dappStore')
@observer
class AmountInput extends React.Component<IProps, IState> {

  state = {
    value: 0,
  }

  setMax() {
    const value = this.countAmount(this.props.source)
    this.setState({ ...this.state, value })
    this.props.onChange(value)
  }

  countAmount(token: string) {
    const tokenInfo = this.props.accountStore!.assets[token]
    if (!tokenInfo) return 0

    return (tokenInfo.balance / Math.pow(10, tokenInfo.decimals))
  }

  countYouGet() {
    const rate = this.props.dappStore!.rate
    return (this.state.value * (this.props.target === 'WAVES' ? rate : 1 / rate)).toFixed(8)
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.target.value
    this.props.onChange(value)
    this.setState({ ...this.state, value })
  }

  onFocus(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === '0') {
      e.target.value = ''
    }
  }

  render() {
    const { label, source, accountStore } = this.props

    const tokenInfo = accountStore!.assets[source]
    const fee = accountStore!.fee

    return (<div className="nes-field amount-input">
      <div className={'labels'}>
        <label htmlFor="amount">{label}</label>
        {tokenInfo && (<label className={'small gray'}>Your balance: {this.countAmount(source)} {tokenInfo.name}</label>)}
      </div>
      <div className={'input-wrapper'}>
        <button className="nes-btn is-primary" onClick={this.setMax.bind(this)}>Max</button>
        <input type="text" id="amount" className="nes-input" value={this.state.value} onFocus={this.onFocus.bind(this)} onChange={this.onChange.bind(this)}/>
      </div>
      <div className={'labels'}>
        <label>You will get</label>
        <label>{this.countYouGet()}<br/><span className={'small gray'}>Fee {fee} Waves</span></label>
      </div>
    </div>)
  }
}

export default AmountInput
