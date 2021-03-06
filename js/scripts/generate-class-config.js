'use strict';

const path = require('path');
const Glob = require('glob').Glob;
const fse = require('fs-extra');

Promise.promisifyAll(fse);

const scriptDir = __dirname;
const baseDir = path.resolve(scriptDir, '..');

const threeSrcDir = path.resolve(baseDir, 'node_modules', 'three', 'src');

const outPath = path.resolve(scriptDir, 'three-class-config.js');


function generateClassConfig() {

    return new Promise(function(resolve, reject) {

        let lines = [
            '//',
            '// base version of this file auto-generated by ' + path.basename(__filename),
            '// date: ' + new Date(),
            '//',
            '',
            'module.exports = {',
            '    _defaults: require(\'./three-class-config-defaults\'),',
            '',
        ];

        new Glob('**/*.js', { cwd: threeSrcDir, nodir: true, })
            .on('match', function(match) {

                const classDir = path.dirname(match);
                const className = path.basename(match, '.js');

                lines = lines.concat([
                    '    ' + className.replace(/\./g, '_') + ': {',
                    '        relativePath: \'./' + path.join(classDir, className) + '\',',
                    // "        superClass: 'ThreeModel',",
                    // "        properties: {},",
                    // "        constructorArgs: [],",
                    '    },',
                ]);

            })
            .on('end', function() {

                lines.push('};', '');

                // write result to file
                fse.outputFileAsync(outPath, lines.join('\n')).then(resolve);

            })
            .on('error', function(err) {
                reject(err);
            })
            .on('abort', function() {
                reject(new Error('Aborted'));
            });

    });

}

if (require.main === module) {

    Promise.resolve(true)
        .then(function() {
            return generateClassConfig();
        })
        .then(function() {
            console.log('DONE');
        });

}
