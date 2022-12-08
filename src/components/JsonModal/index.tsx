import React from 'react'
import { inject, observer } from 'mobx-react'
import ReactJson from 'react-json-view'
import ScrollBar from 'react-perfect-scrollbar'
import copyToClipboard from 'copy-to-clipboard'
import NotificationStore from '@stores/NotificationStore'
import { InvokeScriptTransaction, SignedTransaction } from '@waves/ts-types'
import { SignerStore } from '@stores'
import { broadcast, waitForTx } from '@waves/waves-transactions'
import { getExplorerLink } from '@utils'
import './index.scss'
import Copy from '@components/Copy'

interface IProps {
  handleClose: () => void,
  data: SignedTransaction<InvokeScriptTransaction>,
  notificationStore?: NotificationStore,
  signerStore?: SignerStore
}

@inject('notificationStore', 'signerStore')
@observer
export default class Index extends React.Component<IProps> {

  state = {}

  handleCopy = () => {
    if (copyToClipboard(JSON.stringify(this.props.data, undefined, ' '))) {
      this.props.notificationStore!.notify('Copied!', { type: 'success' })
    }
  }

  broadcast = async () => {
    this.props.handleClose()
    try {
      const path = await this.props.signerStore?.getNetworkByDapp()
      await broadcast(this.props.data as SignedTransaction<InvokeScriptTransaction>, path!.server)
      const txId = (this.props.data as any).id
      const res = await waitForTx(txId, { apiBase: path!.server }) as any
      const isFailed = res.applicationStatus && res.applicationStatus === 'script_execution_failed'

      const link = path ? getExplorerLink(path!.code, txId, 'tx') : undefined
      this.props.notificationStore!.notify(
        isFailed
          ? `Script execution failed`
          : `Success`, { type: isFailed ? 'error' : 'success', link, linkTitle: 'View transaction' },
      )
    } catch (e) {
      this.props.notificationStore!.notify(
        `Error: ${JSON.stringify(e)}`, { type: 'error' },
      )
    }

  }

  render() {
    return <div className={"wrapper"}>
      <div className={"content"}>
        <div className={"header"}>
          <h3>
            JSON<Copy onClick={this.handleCopy}/>
          </h3>
          <button onClick={this.props.handleClose} style={{ height: '30px', width: '30px' }}/>
        </div>
        <ScrollBar>
          <ReactJson src={this.props.data} displayDataTypes={false}
                     style={{ fontFamily: 'Roboto', fontSize: '12px', padding: '25px 35px' }} name={false}/>
        </ScrollBar>
        <div className={"actions"}>
          <button onClick={this.props.handleClose}>
            Close
          </button>
          <button onClick={this.broadcast}>
            Invoke
          </button>
        </div>
      </div>
    </div>
  }
}
