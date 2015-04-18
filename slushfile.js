/*
 * slush-node
 * https://github.com/chrisenytc/slush-node
 *
 * Copyright (c) 2015, Christopher EnyTC
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}


var defaults = (function() {
    var workingDirName = path.basename(process.cwd()),
        homeDir, includeSed, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
    } else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    return {
        appName: workingDirName,
        userName: 'ng-harmony',
        authorName: user.name || '',
        authorEmail: user.email || ''
    };
})();

gulp.task('default', function(done) {
    var prompts = [{
        name: 'appName',
        message: 'What\'s the module name?',
        default: defaults.appName
    }, {
        name: 'appDescription',
        message: 'Please enter a short description?'
    }, {
        name: 'appVersion',
        message: 'What\'s the module version?',
        default: '0.1.0'
    }, {
        name: 'authorName',
        message: 'What\'s the author name?',
        default: defaults.authorName
    }, {
        name: 'authorEmail',
        message: 'And the author\'s email?',
        default: defaults.authorEmail
    }, {
        name: 'userName',
        message: 'What\'s the github username?',
        default: defaults.userName
    }];
    //Ask
    inquirer.prompt(prompts,
        function(answers) {
            if (!answers.appName) {
                return done();
            }
            answers.appNameSlug = _.slugify(answers.appName);
            answers.appNameOnly = _.capitalize(answers.appNameSlug);
            var d = new Date();
            answers.year = d.getFullYear();
            answers.date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            var files = [__dirname + '/templates/**'];
            files.push('!' + __dirname + '/templates/LICENSE');
            files.push('!' + __dirname + '/templates/dist/**');
            files.push('!' + __dirname + '/templates/dist');
            gulp.src(files)
                .pipe(template(answers))
                .pipe(rename(function(file) {
                    var appReplace = file.basename.replace(new RegExp('appName', 'g'), answers.appNameSlug);
                    file.basename = appReplace;
                    if (file.basename[0] === '_') {
                        file.basename = '.' + file.basename.slice(1);
                    }
                }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(install())
                .on('end', function() {
                    done();
                });
        });
});
