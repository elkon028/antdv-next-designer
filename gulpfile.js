import gulp from 'gulp';
import {execa} from 'execa';
import fs from 'fs';

gulp.task('default', async function (cb) {
    await execa('node_modules/.bin/rimraf', ['locale']);
    const files = fs.readdirSync('src/locale');
    for (const file of files) {
        const res = /^(.*)\.js$/.exec(file);
        if (res) {
            await execa('./node_modules/.bin/vite', ['build', '--config', './vite.config.locale.js', '-m', res[1]]);
        }
    }
    cb();
});
