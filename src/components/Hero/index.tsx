import React from 'react'
import './index.scss'

class Hero extends React.Component {
  render() {
    return <div className={"hero"}>
      {this.props.children}
    </div>

  }
}

export default Hero
