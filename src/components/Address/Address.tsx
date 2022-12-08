import React from 'react'

interface IProps {
  address: string;
}

export class Address extends React.Component<IProps> {

  render() {
    const address = this.props.address

    // 6...4
    const formatted = `${address.slice(0, 12)}...${address.slice(-4)}`

    return (<div>{formatted} </div>)
  }
}
