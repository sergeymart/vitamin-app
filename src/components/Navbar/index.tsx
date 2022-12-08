import React from 'react'
import Account from '@components/Account'
import { inject, observer } from 'mobx-react'
import HistoryStore from '@stores/HistoryStore'
import { autorun } from 'mobx'
import { NotificationStore } from '@stores/index'
import { Link } from 'react-router-dom'
import './index.scss'

interface IProps {
  historyStore?: HistoryStore
  notificationStore?: NotificationStore
}

@inject('historyStore', 'notificationStore')
@observer
export default class Navbar extends React.Component<IProps, { value: string }> {

  state = { value: this.props.historyStore!.currentPath }

  componentDidMount() {
    autorun(() => this.setState({ value: this.props.historyStore!.currentPath }))
  }

  handleKeyPress = (e: React.KeyboardEvent) => e.key === 'Enter' && this.props.historyStore!.handleSearch(this.state.value || '')
  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => this.setState({ value })

  render() {
    const { value } = this.state
    return <div className={'navbar'}>
      <Link to={'/'}>Stake</Link>
      <Link to={'/unstake'}>Unstake</Link>
      {/*<Link to={'/defi'}>Defi for stkWaves</Link>*/}
      <Link to={'/account'}>Account</Link>
      <Account/>
    </div>
  }
}


