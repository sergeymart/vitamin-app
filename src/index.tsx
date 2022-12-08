import * as React from 'react'
import { render } from 'react-dom'
import { Provider as MobxProvider } from 'mobx-react'
import { RootStore } from '@stores'
import 'nes.css/css/nes.min.css'
import 'react-toastify/dist/ReactToastify.css'
import './index.scss'
import App from '@src/app'

const mobXStore = new RootStore()

render(<MobxProvider {...mobXStore}><App/></MobxProvider>, document.getElementById('root'))
