import React from 'react'
import { inject, observer } from 'mobx-react'
import AccountStore from '@stores/AccountStore'
import NotificationStore from '@stores/NotificationStore'
import { RouteComponentProps } from 'react-router'
import { UnregisterCallback } from 'history'
import HistoryStore from '@stores/HistoryStore'
import Hero from '@components/Hero'

interface IInjectedProps {
  accountStore?: AccountStore
  notificationStore?: NotificationStore
  historyStore?: HistoryStore
}

interface IProps extends IInjectedProps, RouteComponentProps {
}

interface IState {
  value: string
}

@inject('accountStore', 'notificationStore', 'historyStore')
@observer
class AccountComponent extends React.Component<IProps, IState> {

  historyUnregisterCallback: null | UnregisterCallback = null

  state = { value: window.location.pathname.replace('/', '') }

  componentWillMount(): void {
    this.historyUnregisterCallback = this.props.history.listen((location, action) => {
      action === 'POP' && this.setState({ value: location.pathname.replace('/', '') })
    })
  }

  componentWillUnmount(): void {
    this.historyUnregisterCallback && this.historyUnregisterCallback()
  }

  handleKeyPress = (e: React.KeyboardEvent) => e.key === 'Enter' && this.props.historyStore!.handleSearch(this.state.value || '')

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => this.setState({ value })

  render() {
    const { value } = this.state

    return <div className={'wide-page-container'}>
      <Hero><h1>WAVES Liquid staking analytics</h1></Hero>
    </div>
  }

}

export const Account = AccountComponent
