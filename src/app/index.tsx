import React from 'react'
import { inject, observer } from 'mobx-react'
import { AccountStore } from '@stores'
import { Route, Router } from 'react-router-dom'
import NotificationStore from '@stores/NotificationStore'
import HistoryStore from '@stores/HistoryStore'
import SignDialog from '@components/SignDialog'
import Head from '@components/Navbar'
import { Account } from '@src/pages/Account'
import './index.scss'
import { Stake } from '@src/pages/Stake'
import { Unstake } from '@src/pages/Unstake'

interface IProps {
  accountStore?: AccountStore
  notificationStore?: NotificationStore
  historyStore?: HistoryStore
}

interface IState {
}

@inject('accountStore', 'notificationStore', 'historyStore')
@observer
class App extends React.Component<IProps, IState> {
  render() {
    return (
      <div className={'page-wrapper'}>
        <Router history={this.props.historyStore!.history}>
          <Head/>
          <div className={'container'}>
            <Route exact path="/" component={Stake}/>
            <Route exact path="/stake" component={Stake}/>
            <Route exact path="/unstake" component={Unstake}/>
            {/*<Route exact path="/defi" component={Defi}/>*/}
            <Route exact path="/account" component={Account}/>
          </div>
          <SignDialog/>
        </Router>
      </div>
    )
  }
}

export default App
