import React from 'react'
import { SubStore } from '@stores/SubStore'
import { RootStore } from '@stores/RootStore'
import { observable } from 'mobx'
import { toast } from 'react-toastify'

export type TNotifyOptions = Partial<{
  duration: number,
  closable: boolean,
  key: string

  type: 'error' | 'info' | 'warning' | 'success'
  link?: string
  linkTitle?: string
  title: string
}>

class NotificationStore extends SubStore {
  _instance?: any

  options = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
  }

  @observable isOpenLoginDialog = false
  @observable isOpenMobileExplorer = false
  @observable isOpenMobileAccount = false

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(rootStore: RootStore) {
    super(rootStore)
  }

  notify(content: string | JSX.Element, options: TNotifyOptions) {
    const { type } = options
    const t = type ? toast[type] : toast
    t(content, {
      className: 'nes-balloon from-right',
      icon: false,
      closeButton: () => <i className="nes-icon close is-small"></i>,
      bodyClassName: `nes-text ${type}`,
      transition: undefined,
      ...this.options as any,
    })

  }
}

export default NotificationStore
