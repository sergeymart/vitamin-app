import React from 'react'
import Account from '@components/Account'
import { inject, observer } from 'mobx-react'
import HistoryStore from '@stores/HistoryStore'
import { autorun } from 'mobx'
import { NotificationStore } from '@stores/index'
import { NavLink } from 'react-router-dom'
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

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => this.setState({ value })

  render() {
    return <div className={'navbar'}>
      <NavLink to={'/stake'} activeClassName={'active'}>Stake</NavLink>
      <NavLink to={'/unstake'} activeClassName={'active'}>Unstake</NavLink>
      {/*<Link to={'/defi'}>Defi for stkWaves</Link>*/}
      <NavLink to={'/account'} activeClassName={'active'}>Account</NavLink>
      <Account/>
    </div>
  }
}


