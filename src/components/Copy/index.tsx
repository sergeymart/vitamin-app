import React from 'react'

class CopyIcon extends React.Component {

  render() {
    return (
      <svg width="14"
           height="14" viewBox="0 0 14 14" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0)">
          <path d="M9.8637 0H2.22733C1.52413 0 0.95459 0.569536 0.95459 1.27274V9.18184H2.22733V1.27274H9.8637V0Z"
                fill="#9BA6B1"/>
          <path
            d="M12.773 3.54544H5.77298C5.06981 3.54544 4.50024 4.11498 4.50024 4.81818V12.7273C4.50024 13.4305 5.06978 14 5.77298 14H12.773C13.4762 14 14.0457 13.4305 14.0457 12.7273V4.81818C14.0457 4.11501 13.4762 3.54544 12.773 3.54544ZM12.773 12.7273H5.77298V4.81818H12.773V12.7273Z"
            fill="#9BA6B1"/>
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="14" height="14" fill="white"/>
          </clipPath>
        </defs>
      </svg>

    )
  }
}

export default ({ onClick }: { onClick?: () => void }) => <div onClick={onClick}><CopyIcon/></div>
