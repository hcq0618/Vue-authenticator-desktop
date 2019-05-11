/* eslint-disable standard/no-callback-literal */
/* eslint-disable handle-callback-err */
/* eslint-disable indent */
/* eslint-disable space-before-function-paren */
import Vue from 'vue'

const SECRET_ENCODING = 'base32'
const DEFAULT_PERIOD = 30
const DEFAULT_DIGITS = 6

export function parseAuthUriFromFile(file, callback) {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        showErrorMessage('Not JPG or PNG file')
        if (callback) {
            callback(false)
        }
        return
    }
    var reader = new FileReader()
    reader.onload = function (e) {
        // 'data:image/jpeg;base64,/9j/4AAQSk...(base64)...'
        var data = e.target.result
        var QrcodeDecoder = require('qrcode-decoder')
        var qr = new QrcodeDecoder()
        qr.decodeFromImage(data).then((res) => {
            if (res && !isEmpty(res.data)) {
                parseAuthUri(res.data, function (success) {
                    if (success && callback) {
                        callback(true, getAccounts())
                    }
                })
            } else {
                showErrorMessage('Invalid QRCode file')
                callback(false, null)
            }
        })
    }
    reader.readAsDataURL(file)
}

function parseAuthUri(data, callback) {
    var head = 'otpauth://totp/'
    if (data.indexOf(head) === 0) {
        var account = data.substring(data.indexOf(head) + head.length, data.indexOf('?'))
        var issuer = ''
        if (account.indexOf(':') >= 0) {
            issuer = account.substring(0, account.indexOf(':'))
            account = account.substring(account.indexOf(':') + 1)
        }
        var params = data.substring(data.indexOf('?') + 1)
        var paramsArray = params.split('&')
        var secret = ''
        var period = ''
        var digits = ''
        paramsArray.forEach(element => {
            if (element.indexOf('=') < 0) {
                return
            }
            var kv = element.split('=')
            if (kv.length < 2) {
                return
            }

            var key = kv[0]
            var value = kv[1]
            switch (key) {
                case 'secret':
                    secret = value
                    break
                case 'issuer':
                    issuer = value
                    break
                case 'period':
                    period = value
                    break
                case 'digits':
                    digits = value
                    break
            }
        })
        // showInfoMessage("account=" + account + " secret=" + secret + " period=" + period + " digits=" + digits + " issuer=" + issuer);
        saveAccount(account, issuer, secret, period, digits, callback)
    } else {
        showErrorMessage('Invalid QRCode file')
        callback(false)
    }
}

function calculateToken(secret, period, digits) {
    if (isEmpty(secret)) {
        return
    }
    var speakeasy = require('speakeasy')
    var token = speakeasy.totp({
        secret: secret,
        encoding: SECRET_ENCODING,
        step: period,
        digits: digits
    })
    // showInfoMessage(token);
    return token
}

function convertValue(value, defaultValue) {
    if (isEmpty(value)) {
        return defaultValue
    }
    return Math.round(parseInt(value))
}

function isEmpty(obj) {
    if (typeof obj === 'undefined' || obj == null || obj === '') {
        return true
    } else {
        return false
    }
}

function showErrorMessage(message) {
    Vue.prototype.$message({
        showClose: true,
        message: message,
        type: 'error'
    })
}

function showWaringMessage(message) {
    Vue.prototype.$message({
        showClose: true,
        message: message,
        type: 'warning'
    })
}

function showSuccessMessage(message) {
    Vue.prototype.$message({
        showClose: true,
        message: message,
        type: 'success'
    })
}

function saveAccount(account, issuer, secret, period, digits, callback) {
    if (localStorage.getItem(secret) == null) {
        var accountItem = {
            'account': account,
            'issuer': issuer,
            'secret': secret,
            'period': convertValue(period, DEFAULT_PERIOD),
            'digits': convertValue(digits, DEFAULT_DIGITS)
        }
        qrCode(accountItem, function (err, dataUrl) {
            accountItem.qrCode = dataUrl
            // to json string
            accountItem = JSON.stringify(accountItem)
            localStorage.setItem(secret, accountItem)
            showSuccessMessage('Successfully added account')
            callback(true)
        })
    } else {
        showWaringMessage('Account already exists')
        callback(false)
    }
}

export function deleteAccount(account) {
    localStorage.removeItem(account.secret)
}

export function getAccounts() {
    var accounts = []
    for (var i = 0; i < localStorage.length; i++) {
        var secret = localStorage.key(i)
        var accountItem = localStorage.getItem(secret)
        var account = JSON.parse(accountItem)
        updateAccount(account)
        accounts.push(account)
    }
    return accounts
}

function calculateCounter(period) {
    var now = new Date().getTime()
    var nowInSeconds = now / 1000
    // TOTP calculates the counter value by finding how many time steps have passed
    // so the counter is equal to the current time divided by the period
    return period - Math.round(nowInSeconds % period)
}

function updateAccount(account) {
    account.token = calculateToken(account.secret, account.period, account.digits)
    account.counter = calculateCounter(account.period)
    account.percentage = Math.round((account.counter / account.period) * 100)
    account.counterColor = account.percentage <= 25 ? '#F56C6C' : '#E6A23C'
}

export function updateAccounts(accounts) {
    accounts.forEach(account => {
        updateAccount(account)
    })
    return accounts
}

export function copy(token) {
    var Clipboard = require('clipboard')
    var clipboard = new Clipboard('.copy', {
        text: function (el) {
            return token
        }
    })
    clipboard.on('success', e => {
        showSuccessMessage('Copy success')
        clipboard.destroy()
    })
    clipboard.on('error', e => {
        showErrorMessage('Copy failure')
        clipboard.destroy()
    })
}

function qrCode(account, callback) {
    var speakeasy = require('speakeasy')
    var url = speakeasy.otpauthURL({
        secret: account.secret,
        encoding: SECRET_ENCODING,
        label: account.account,
        period: account.peroid,
        issuer: account.issuer,
        digits: account.digits
    })

    var QRCode = require('qrcode')
    QRCode.toDataURL(url, callback)
}
