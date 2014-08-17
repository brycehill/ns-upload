#!/usr/bin/env node

var fs = require('fs')
var util = require('util')
var gaze = require('gaze')
var request = require('request')
var mime = require('mime')
var m2NS = require('./lib/mimeToNSType')
var Liftoff = require('liftoff')
var argv = require('minimist')(process.argv.slice(2))
var chalk = require('chalk')
var error = chalk.bold.red

var app = new Liftoff({
    name: 'ns-upload',
    configName: 'ns-upload'
})

app.launch({ cwd: argv.cwd }, run)

function run(env) {
    if (!env.configPath) {
        util.error(error('No configuration file found'))
        process.exit(1)
    }

    var config = require(env.configPath)

    gaze(config.watched, function(err, watcher) {
        this.on('changed', getContents)

        function getContents(path) {
            var re = /(.[^\/]*)\//g,
                fileCabinetPath = path.replace(process.cwd() + '/', ''),
                folders = fileCabinetPath.match(re),
                slash = path.lastIndexOf('/'),
                fileName = (!folders) ? fileCabinetPath : path.substr(slash + 1),
                type = mime.lookup(fileName),
                auth = config.auth

            util.log(chalk.cyan(util.format('%s was changed', fileName)))
            fs.readFile(path, 'utf8', uploadFile)

            function uploadFile(err, content) {
                if (err) util.error(error('ERROR: ', err))
                util.log(chalk.cyan(util.format('Uploading %s', fileName)))
                request({
                    url: config.url,
                    method: 'put',
                    headers: {
                        'User-Agent-x': 'SuiteScript-Call',
                        'Content-Type': 'application/json',
                        'Content-Language': 'en-US',
                        'Authorization': 'NLAuth nlauth_account='+auth.account+', nlauth_email='+auth.email+', nlauth_signature='+auth.pass+', nlauth_role='+auth.role
                    },
                    body: JSON.stringify({
                        fileName: fileName,
                        content: content,
                        path: config.nsRootPath + (folders ? folders.join('') : '') + fileName,
                        fileType: m2NS(type)
                    })
                }, parseNSResponse)
            }

            function parseNSResponse(err, res, body) {
                body = JSON.parse(body)
                if (body.error) {
                    if (body.error.code === 'RCRD_DSNT_EXIST') {
                        // Try to upload clean file.
                    }
                    // error.code = SSS_MISSING_REQD_ARGUMENT - Missing a body value
                    //              RCRD_DSNT_EXIST - missing record in netsuite
                    util.error('Error Code:', body.error.code, 'Message:', body.error.message)
                } else {
                    util.log(chalk.green('File Uploaded Successfully'))
                }
            }
        }
    })
}

