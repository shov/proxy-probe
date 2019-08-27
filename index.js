"use strict"

const path = require('path')

global.APP_PATH = path.resolve(__dirname)
require('dotenv').config({
  path: path.join(APP_PATH + '/.env'),
})

switch (true) {
  case !process.env.PROXY_HOST:
  case !process.env.PROXY_PORT:
  case !process.env.PROXY_USER:
  case !process.env.PROXY_PASSWORD:
    console.error('Proxy configuration is not set, check it in .env')
    process.exit(2)
    break
}

if (process.argv.length < 3) {
  console.error('No URL, nor method given')
  process.exit(1)
}

let method = 'get'
let url = process.argv[2]

if (process.argv.length > 3) {
  method = url
  url = process.argv[3]
}

console.log(`Method: ${method}, URL: ${url}`)

const axios = require('axios')
const HttpProxyAgent = require('https-proxy-agent')

const p = {
  schema: process.env.PROXY_SCHEMA || 'http',
  host: process.env.PROXY_HOST,
  port: process.env.PROXY_PORT,
  user: process.env.PROXY_USER,
  pass: process.env.PROXY_PASSWORD
}

const agent = new HttpProxyAgent(`${p.schema}://${p.user}:${p.pass}@${p.host}:${p.port}`)

const startTime = new Date().getTime()
const getRuningTime = () => {
  return ((new Date()).getTime() - startTime) / 1000
}

axios({
  method,
  url,
  httpsAgent: agent
})
  .then(res => {
    console.log({
      status: res.status,
      data: res.data
    })
    console.log(`Took ${getRuningTime()} seconds`)
  })
  .catch(err => {
    console.error({
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
    })
    console.log(`Took ${getRuningTime()} seconds`)
  })
