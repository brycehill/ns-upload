#!/usr/bin/env node

var fs = require('fs')
var util = require('util')
var gaze = require('gaze')
var request = require('request')
var mime = require('mime')
var m2NS = require('./lib/mimeToNSType')
var config = require('./config')
var chalk = require('chalk')
var error = chalk.bold.red


gaze(config.watched, function(err, watcher) {
    this.on('changed', function(fsPath) {
        util.log('%s was changed', fsPath)
        var re = /(.[^\/]*)\//g,
            fileCabinetPath = fsPath.replace(__dirname + '/', ''),
            folders = fileCabinetPath.match(re),
            slash = fsPath.lastIndexOf('/'),
            fileName = (!folders) ? fileCabinetPath : fsPath.substr(slash + 1),
            type = mime.lookup(fileName)

        fs.readFile(fsPath, 'utf8', function(err, content) {
            if (err) util.error(error('ERROR: ', err))

            var auth = config.auth,
                options = {
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
                        path: config.rootPath + (folders ? folders.join('') : '') + fileName,
                        fileType: m2NS(type)
                    })
                }


            util.log('Uploading %s', fileName)
            request(options, function(err, res, body) {
                body = JSON.parse(body)
                if (body.error) {
                    util.log('options', options)
                    // error.code = SSS_MISSING_REQD_ARGUMENT - Missing a body value
                    //              RCRD_DSNT_EXIST - missing record in netsuite
                    util.error('Error Code:', body.error.code, 'Message:', body.error.message)
                }

                util.log('File Uploaded Successfully')
            })
        })
    })
})
