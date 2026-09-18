import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
import banner from 'vite-plugin-banner'
import cssnano from 'cssnano'
import visualizer from 'rollup-plugin-visualizer';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import {author, license, name, version} from './package.json'
import {readdirSync, readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const extnedsPlugins = [];

function getBanner(banner, pkg) {
    if (!banner || typeof banner === 'string') {
        return banner || '';
    }

    banner = {...pkg, ...(banner === true ? {} : banner)};

    const author =banner.author

    const license = banner.license || '';
    return (
        '/*!\n' +
        ' * FormCreate 可视化表单设计器\n' +
        ` * ${banner.name} v${banner.version}\n` +
        ` * (c) ${author || ''}\n` +
        (license && ` * Released under the ${license} License.\n`) +
        ' */'
    );
}

const __banner__ = {
    author: `2021-${new Date().getFullYear()} ${author}\n * Github https://github.com/xaboy/form-create-designer\n * Site https://form-create.com/`,
    license,
    name,
    version
}

// 打包生产环境才引入的插件
// if (process.env.NODE_ENV === 'production') {
//     // 打包依赖展示
//     extnedsPlugins.push(
//         visualizer({
//             open: true,
//             gzipSize: true,
//             brotliSize: true,
//         })
//     );
// }

// 第三方产物（wangeditor 内嵌的 style-loader 运行时）里有一行以行首开始的
// sourceMappingURL=data: 模板字面量，会被 Vite 的 convert-source-map 行首正则
// 误判为真实内联映射，dev 下报 "Failed to load source map"。
// 这里拆成运行期等价表达式：产物字符串不变，但不再命中该正则。
function fixLineStartSourcemapComment() {
    const FROM = '\n/*# sourceMappingURL=data:application/json;base64,'
    const TO = '\n/*# sourceMapping${"URL"}=data:application/json;base64,'
    const outDir = fileURLToPath(new URL('./dist/', import.meta.url))
    return {
        name: 'fix-line-start-sourcemap-comment',
        closeBundle() {
            for (const file of readdirSync(outDir)) {
                if (!file.endsWith('.js')) continue
                const path = `${outDir}${file}`
                const code = readFileSync(path, 'utf8')
                if (code.includes(FROM)) writeFileSync(path, code.split(FROM).join(TO))
            }
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'FcDesigner',
            fileName: format => `index.${format}.js`,
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                exports: 'named',
                globals: {
                    vue: 'Vue',
                    '@form-create/antdv-next': 'formCreate',
                    'antdv-next': 'antd',
                }
            },
            external: [
                'vue',
                'antdv-next',
                '@form-create/antdv-next'
            ],

        },
        brotliSize: true
    },
    css: {
        postcss: {
            plugins: [
                cssnano({
                    preset: 'default'
                })
            ]
        }
    },
    plugins: [vue(),  vueJSX(), banner(getBanner(__banner__)),cssInjectedByJsPlugin(), fixLineStartSourcemapComment(), ...extnedsPlugins]
})
