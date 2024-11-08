import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'; // 引入 copy 插件

export default {
    input: 'src/index.ts', // 入口文件
    output: {
        file: 'dist/main.js', // 输出文件
        format: 'cjs', // 输出格式（CommonJS）
        name: 'CangquyunObsidian', // 全局变量名称
    },
    plugins: [
        resolve(), // 解析第三方模块
        commonjs(), // 支持 CommonJS 模块
        typescript(), // 支持 TypeScript
        babel({
            exclude: 'node_modules/**', // 排除 node_modules
        }),
        terser(), // 压缩代码
        copy({
            targets: [
                { src: 'manifest.json', dest: 'dist' },
                { src: 'style.css', dest: 'dist' } // 复制 manifest.json 到 dist 目录
            ]
        })
    ],
};
