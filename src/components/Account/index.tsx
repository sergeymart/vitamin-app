import { inject, observer } from 'mobx-react'
import React from 'react'
import copyToClipboard from 'copy-to-clipboard'
import { AccountStore } from '@stores'
import HistoryStore from '@stores/HistoryStore'
import NotificationStore from '@stores/NotificationStore'
import SignerStore from '@stores/SignerStore'
import { Address } from '@components'
import './index.scss'

interface IProps {
  accountStore?: AccountStore;
  historyStore?: HistoryStore;
  signerStore?: SignerStore;
  notificationStore?: NotificationStore;
}

interface IState {
  isModalOpen: boolean
}

export const getNetwork = (url: string) => {
  switch (url) {
    case 'T':
      return 'TestNet'
    case 'W':
      return 'MainNet'
    case 'S':
      return 'StageNet'
    default:
      return 'Custom'
  }
}

@inject('accountStore', 'historyStore', 'notificationStore', 'signerStore')
@observer
export default class Account extends React.Component<IProps, IState> {
  // handleExit = () => window.location.reload();
  constructor(props: IProps) {
    super(props)

    this.state = {
      isModalOpen: false,
    }
  }

  handleCopy = () => {
    if (!this.props.accountStore!.address) {
      return
    }

    if (copyToClipboard(this.props.accountStore!.address)) {
      this.props.notificationStore!.notify('Copied!', { type: 'success' })
    }
  }

  handleOpenLoginDialog = () => this.props.notificationStore!.isOpenLoginDialog = true

  render() {
    const props = this.props

    const { address, network } = props.accountStore!

    let isInvalidServer
    if (address && network) {
      const networkByAddress = props.accountStore!.getNetworkByAddress(address)
      isInvalidServer = networkByAddress && network && networkByAddress.code !== network.code
    }

    return <div className={'account-wrapper'}>{
      address && network
        ? <div>
          <div className={'description'}>
            <div>
              <Address address={address}/>
              {/*<Copy onClick={this.handleCopy}/>*/}
            </div>
            <div>
              {getNetwork(network.code)}
              {isInvalidServer && <div>&nbsp;invalid network</div>}
            </div>
          </div>
          {/*<Avatar address={address}/>*/}
        </div>
        : <button className={'nes-btn is-primary'} onClick={this.handleOpenLoginDialog}>
          Connect wallet
        </button>
    }</div>
  }

}
