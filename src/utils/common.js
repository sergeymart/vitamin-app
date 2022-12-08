export const checkSlash = (url) => url[url.length - 1] === '/' ? url : url + '/'

export function getCurrentBrowser () {
  // Opera 8.0+
  const isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
  if (isOpera) {
    return 'opera'
  }

  // Firefox 1.0+
  const isFirefox = typeof window.InstallTrigger !== 'undefined'
  if (isFirefox) {
    return 'firefox'
  }

  // Safari 3.0+ "[object HTMLElementConstructor]"
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
    return p.toString() === '[object SafariRemoteNotification]'
  })(!window['safari'] || (typeof window.safari !== 'undefined' && window.safari.pushNotification))
  if (isSafari) {
    return 'safari'
  }

  // Internet Explorer 6-11
  const isIE = /*@cc_on!@*/false || !!document.documentMode
  if (isIE) {
    return 'ie'
  }

  // Edge 20+
  const isEdge = !isIE && !!window.StyleMedia
  if (isEdge) {
    return 'edge'
  }

  // Chrome 1 - 71
  const isChrome = !!window.chrome
  if (isChrome) {
    return 'chrome'
  }

  return ''
}

export const loadState = () => {
  try {
    const state = JSON.parse(localStorage.getItem('store'))
    return state || undefined

  } catch (error) {
    console.error(error)
    return undefined
  }

}

export const getExplorerLink = (chainId, address, type) => {
  switch (chainId) {
    case 'W':
      return `https://wavesexplorer.com/${type}/${address}`
    case 'T':
      return `https://testnet.wavesexplorer.com/${type}/${address}`
    case 'S':
      return `https://stagenet.wavesexplorer.com/${type}/${address}`
    case 'C':
      return `https://stagenet.wavesexplorer.com/custom/${type}/${address}`
    default:
      return `https://wavesexplorer.com/custom/${type}/${address}`
  }
}

export const saveState = (state) => {
  localStorage.setItem('store', JSON.stringify(state))
}

