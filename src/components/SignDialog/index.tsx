import React from 'react'
import { inject, observer } from 'mobx-react'
import AccountStore from '@stores/AccountStore'
import KeeperStore from '@stores/KeeperStore'
import NotificationStore from '@stores/NotificationStore'
import { SignerStore } from '@stores/index'
import { LoginType } from '@src/interface'
import './index.scss'

interface IProps {
  accountStore?: AccountStore
  signerStore?: SignerStore
  keeperStore?: KeeperStore
  notificationStore?: NotificationStore
}

@inject('accountStore', 'notificationStore', 'signerStore', 'keeperStore')
@observer
export default class SignDialog extends React.Component <IProps> {

  handleCloseDialog = () => this.props.notificationStore!.isOpenLoginDialog = false

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleSignWithKeeper = () => {
    this.handleCloseDialog()
    const keeperStore = this.props.keeperStore!
    if (keeperStore!.isWavesKeeperInstalled && !keeperStore!.isWavesKeeperInitialized) {
      keeperStore!.setupSynchronizationWithWavesKeeper()
    }
    keeperStore.login()
      .catch(e => this.props.notificationStore!.notify(
        <a href="https://docs.waves.tech/en/ecosystem/waves-keeper" target="_blank" rel="noopener noreferrer">
          install WavesKeeper</a>,
        { type: 'error', title: 'keeper is not installed' }),
      )
  }

  handleSignWithExchangeSeed = () => {
    this.handleCloseDialog()
    this.props.signerStore!.login(LoginType.SEED)
  }

  handleSignWithExchangeMail = () => {
    this.handleCloseDialog()
    this.props.signerStore!.login(LoginType.EMAIL)
  }

  handleClickOutside = (event: any) => {
    const path = event.path || event.composedPath()
    if (!(path.some((element: any) => element.dataset && element.dataset.owner === 'sign'))) {
      this.handleCloseDialog()
    }
  }

  render(): React.ReactNode {
    const open = this.props.notificationStore!.isOpenLoginDialog
    const isKeeper = this.props.keeperStore!.isBrowserSupportsWavesKeeper
    if (!open) return null
    return <div className={'overlay'}>
      <div className={'nes-dialog is-rounded'} data-owner={'sign'}>
        {/*<i className="nes-icon close is-large" onClick={this.handleCloseDialog}></i>*/}
        <h2 className={'title'}>Connect a wallet to get started</h2>
        <div>
          <div className={'login-method'}>
            <button className={'nes-btn is-primary wide-btn'} onClick={this.handleSignWithKeeper} disabled={!isKeeper}>
              Sign in with Keeper
            </button>
            <div className={!isKeeper ? 'disabled' : ''}>
              {isKeeper
                ? 'The network will be chosen in WavesKeeper by user'
                : 'Waves Keeper doesn’t support this browser'}
            </div>
          </div>
          <div className={'login-method'}>
            <button className={'nes-btn is-primary wide-btn'} onClick={this.handleSignWithExchangeSeed}>Sign in with Exchange(Seed)</button>
            <div>The network will be TestNet by default<br/></div>
          </div>
          <div className={'login-method'}>
            <button className={'nes-btn is-primary wide-btn'} onClick={this.handleSignWithExchangeMail}>Sign in with Exchange(Email)</button>
            <div>The network will be TestNet by default<br/></div>
          </div>
        </div>
      </div>
    </div>
  }
}
