#!/usr/bin/env node

var P = require("bluebird")
var fs = P.promisifyAll(require('fs'))
var request = P.promisifyAll(require('request'))
var util = require('util')
var chokidar = require('chokidar')
var compose = require('ramda').compose
var mime = require('mime')
var m2NS = require('./lib/mimeToNSType')
var Liftoff = require('liftoff')
var argv = require('minimist')(process.argv.slice(2))
var chalk = require('chalk')
var error = chalk.bold.red
var success = chalk.green
var message = chalk.cyan
var config = {}

var app = new Liftoff({
  name: 'ns-upload',
  configName: 'ns-upload'
})

app.launch({ cwd: argv.cwd }, run)

function run(env) {
  if (!env.configPath) {
    console.error(error('No configuration file found'))
    process.exit(1)
  }
  config = require(env.configPath)
  var watcher = chokidar.watch(config.watched)
  watcher.on('change', compose(checkFile, parsePath))
}

// String -> File Descriptor {}
function parsePath(path) {
  var re = /(.[^\/]*)\//g
  var fileCabinetPath = path.replace(process.cwd() + '/', '')
  var folders = fileCabinetPath.match(re)
  var slash = path.lastIndexOf('/')
  return {
    path,
    folders,
    fileName: !folders ? fileCabinetPath : path.substr(slash + 1)
  }
}

// File Descriptor {} -> Promise
function checkFile(fd) {
  console.log(message(`${fd.fileName} was changed`))
  return fs.readFileAsync(fd.path, 'utf8')
    .then(uploadFile(fd))
    .then(parseNSResponse)
    .catch(compose(console.error, error))
}

// File Descripitor {} -> String -> Promise
function uploadFile(fd) {
  var mimeType = mime.lookup(fd.fileName)
  return function(content) {
    // Someday...
    // var { account, email, pass, role } = config.auth
    var auth = config.auth
    console.log(message(`Uploading ${fd.fileName}`))
    return request.putAsync({
      url: config.url,
      headers: {
        'User-Agent-x': 'SuiteScript-Call',
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Authorization': `NLAuth nlauth_account=${auth.account}, nlauth_email=${auth.email}, nlauth_signature=${auth.pass}, nlauth_role=${auth.role}`
      },
      body: JSON.stringify({
        content,
        fileName: fd.fileName,
        path: config.nsRootPath + (fd.folders ? fd.folders.join('') : '') + fd.fileName,
        fileType: m2NS(mimeType)
      })
    })
  }
}

function parseNSResponse(res) {
  var body = JSON.parse(res.body)
  var reqBody = JSON.parse(res.request.body)
  if (body.error) {
    if (body.error.code === 'RCRD_DSNT_EXIST') {
        // Try to upload clean file?
    }
    /* Potential error codes:
    SSS_MISSING_REQD_ARGUMENT - Missing a body value
    RCRD_DSNT_EXIST - missing record in netsuite */
    console.error(error(`Error Code: ${body.error.code}, Message: ${body.error.message}`))
  } else {
    console.log(success(`${reqBody.fileName} Uploaded Successfully`))
  }
}

module.exports = {
  run,
  parseNSResponse,
  uploadFile
}
