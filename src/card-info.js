;(function () {
  function CardInfo (numberSource, options) {
    CardInfo._assign(this, CardInfo._defaultProps)

    this.options = CardInfo._assign({}, CardInfo.defaultOptions, options || {})
    this.numberSource = arguments.length ? numberSource : ''
    this.number = CardInfo._getNumber(this.numberSource)

    var bankData = CardInfo._getBank(this.number)
    if (bankData) {
      this.bankAlias = bankData.alias
      this.bankName = bankData.name
      this.bankNameEn = bankData.nameEn
      this.bankCountry = bankData.country
      this.bankUrl = bankData.url
      this.bankLogoPng = CardInfo._getLogo(this.options.banksLogosPath, bankData.logoPng)
      this.bankLogoSvg = CardInfo._getLogo(this.options.banksLogosPath, bankData.logoSvg)
      this.bankLogo = CardInfo._getLogoByPreferredExt(this.bankLogoPng, this.bankLogoSvg, this.options.preferredExt)
      this.bankLogoStyle = bankData.logoStyle
      this.backgroundColor = bankData.backgroundColor
      this.backgroundColors = bankData.backgroundColors
      this.backgroundLightness = bankData.backgroundLightness
      this.textColor = bankData.text
    }

    this.backgroundGradient = CardInfo._getGradient(this.backgroundColors, this.options.gradientDegrees)

    var brandData = CardInfo._getBrand(this.number)
    if (brandData) {
      this.brandAlias = brandData.alias
      this.brandName = brandData.name
      var brandLogoBasename = CardInfo._getBrandLogoBasename(this.brandAlias, this.options.brandLogoPolicy, this.backgroundLightness, this.bankLogoStyle)
      this.brandLogoPng = CardInfo._getLogo(this.options.brandsLogosPath, brandLogoBasename, 'png')
      this.brandLogoSvg = CardInfo._getLogo(this.options.brandsLogosPath, brandLogoBasename, 'svg')
      this.brandLogo = CardInfo._getLogoByPreferredExt(this.brandLogoPng, this.brandLogoSvg, this.options.preferredExt)
      this.codeName = brandData.codeName
      this.codeLength = brandData.codeLength
      this.numberLengths = brandData.lengths
      this.numberGaps = brandData.gaps
    }

    this.numberMask = CardInfo._getMask(this.options.maskDigitSymbol, this.options.maskDelimiterSymbol, this.numberLengths, this.numberGaps)
    this.numberNice = CardInfo._getNumberNice(this.number, this.numberGaps)
  }

  CardInfo._defaultProps = {
    bankAlias: null,
    bankName: null,
    bankNameEn: null,
    bankCountry: null,
    bankUrl: null,
    bankLogo: null,
    bankLogoPng: null,
    bankLogoSvg: null,
    bankLogoStyle: null,
    backgroundColor: '#eeeeee',
    backgroundColors: ['#eeeeee', '#dddddd'],
    backgroundLightness: 'light',
    backgroundGradient: null,
    textColor: '#000',
    brandAlias: null,
    brandName: null,
    brandLogo: null,
    brandLogoPng: null,
    brandLogoSvg: null,
    codeName: null,
    codeLength: null,
    numberMask: null,
    numberGaps: [4, 8, 12],
    numberLengths: [12, 13, 14, 15, 16, 17, 18, 19],
    numberNice: null,
    number: null,
    numberSource: null,
    options: {}
  }

  CardInfo.defaultOptions = {
    banksLogosPath: '/bower_components/card-info/dist/banks-logos/',
    brandsLogosPath: '/bower_components/card-info/dist/brands-logos/',
    brandLogoPolicy: 'auto',
    preferredExt: 'svg',
    maskDigitSymbol: '0',
    maskDelimiterSymbol: ' ',
    gradientDegrees: 135
  }

  CardInfo.banks = {}

  CardInfo._prefixes = {}

  CardInfo.brands = [
    {
      alias: 'visa',
      name: 'Visa',
      codeName: 'CVV',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^4\d*$/
    },
    {
      alias: 'master-card',
      name: 'MasterCard',
      codeName: 'CVC',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^(5[1-5]|222[1-9]|2[3-6]|27[0-1]|2720)\d*$/
    },
    {
      alias: 'american-express',
      name: 'American Express',
      codeName: 'CID',
      codeLength: 4,
      gaps: [4, 10],
      lengths: [15],
      pattern: /^3[47]\d*$/
    },
    {
      alias: 'diners-club',
      name: 'Diners Club',
      codeName: 'CVV',
      codeLength: 3,
      gaps: [4, 10],
      lengths: [14],
      pattern: /^3(0[0-5]|[689])\d*$/
    },
    {
      alias: 'discover',
      name: 'Discover',
      codeName: 'CID',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16, 19],
      pattern: /^(6011|65|64[4-9])\d*$/
    },
    {
      alias: 'jcb',
      name: 'JCB',
      codeName: 'CVV',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^(2131|1800|35)\d*$/
    },
    {
      alias: 'unionpay',
      name: 'UnionPay',
      codeName: 'CVN',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16, 17, 18, 19],
      pattern: /^62[0-5]\d*$/
    },
    {
      alias: 'maestro',
      name: 'Maestro',
      codeName: 'CVC',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [12, 13, 14, 15, 16, 17, 18, 19],
      pattern: /^(5[0678]|6304|6390|6054|6271|67)\d*$/
    },
    {
      alias: 'mir',
      name: 'MIR',
      codeName: 'CVC',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^22\d*$/
    }
  ]

  CardInfo._assign = function () {
    var objTarget = arguments[0]
    for (var i = 1; i < arguments.length; i++) {
      var objSource = arguments[i]
      for (var key in objSource) {
        objTarget[key] = objSource[key]
      }
    }
    return objTarget
  }

  CardInfo._getNumber = function (numberSource) {
    var numberSourceString = numberSource + ''
    return /^[\d ]*$/.test(numberSourceString) ? numberSourceString.replace(/\D/g, '') : ''
  }

  CardInfo._getBank = function (number) {
    if (number.length < 6) return undefined
    var prefix = number.substr(0, 6)
    return this._prefixes[prefix]
      ? this.banks[this._prefixes[prefix]]
      : undefined
  }

  CardInfo._getBrand = function (number) {
    var brands = []
    for (var i = 0; i < this.brands.length; i++) {
      if (this.brands[i].pattern.test(number)) brands.push(this.brands[i])
    }
    if (brands.length === 1) return brands[0]
  }

  CardInfo._getLogo = function (dirname, basename, extname) {
    return basename ? dirname + (extname ? basename + '.' + extname : basename) : null
  }

  CardInfo._getBrandLogoBasename = function (brandAlias, brandLogoPolicy, backgroundLightness, bankLogoStyle) {
    switch (brandLogoPolicy) {
      case 'auto': return brandAlias + '-' + (bankLogoStyle || 'colored')
      case 'colored': return brandAlias + '-colored'
      case 'mono': return brandAlias + (backgroundLightness === 'light' ? '-black' : '-white')
      case 'black': return brandAlias + '-black'
      case 'white': return brandAlias + '-white'
    }
  }

  CardInfo._getLogoByPreferredExt = function (logoPng, logoSvg, preferredExt) {
    if (!logoPng && !logoSvg) return null
    if (!logoPng) return logoSvg
    if (!logoSvg) return logoPng
    return (logoPng.substr(logoPng.length - 3) === preferredExt)
      ? logoPng
      : logoSvg
  }

  CardInfo._getGradient = function (backgroundColors, gradientDegrees) {
    return 'linear-gradient(' + gradientDegrees + 'deg, ' + backgroundColors.join(', ') + ')'
  }

  CardInfo._getMask = function (maskDigitSymbol, maskDelimiterSymbol, numberLengths, numberGaps) {
    var length = numberLengths[numberLengths.length - 1]
    var mask = Array(length + 1).join(maskDigitSymbol)
    for (var i = 0; i < numberGaps.length; i++) {
      var gapPos = numberGaps[i] + maskDelimiterSymbol.length * i
      mask = [mask.slice(0, gapPos), maskDelimiterSymbol, mask.slice(gapPos)].join('')
    }
    return mask
  }

  CardInfo._getNumberNice = function (number, numberGaps) {
    var offsets = [0].concat(numberGaps).concat([number.length])
    var components = []
    for (var i = 0; offsets[i] < number.length; i++) {
      var start = offsets[i]
      var end = Math.min(offsets[i + 1], number.length)
      components.push(number.substring(start, end))
    }
    return components.join(' ')
  }

  CardInfo._addBanks = function (banks) {
    this._assign(this.banks, banks)
  }

  CardInfo._addPrefixes = function (prefixes) {
    this._assign(this._prefixes, prefixes)
  }

  CardInfo.addBanksAndPrefixes = function (banksAndPrefixes) {
    this._addBanks(banksAndPrefixes.banks)
    this._addPrefixes(banksAndPrefixes.prefixes)
  }

  CardInfo.setDefaultOptions = function (options) {
    this._assign(CardInfo.defaultOptions, options)
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = CardInfo
    }
    exports.CardInfo = CardInfo
  } else if (typeof window !== 'undefined') {
    window.CardInfo = CardInfo
  }
})()
