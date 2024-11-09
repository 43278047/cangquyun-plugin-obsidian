import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'; // 引入 copy 插件
import ignore from 'rollup-plugin-ignore';
export default {
    input: 'src/index.ts', // 入口文件
    output: {
        file: 'dist/main.js', // 输出文件
        format: 'cjs', // 输出格式（CommonJS）
        name: 'CangquyunObsidian', // 全局变量名称
        exports: 'default', // 显式设置导出模式为 default
    },

    external: ['obsidian', 'fs', 'path', 'events', 'domain', 'os', 'stream'], // 将这些模块标记为外部依赖
    plugins: [
        resolve({
            preferBuiltins: true, // 优先使用内置模块
        }), // 解析第三方模块
        commonjs(), // 支持 CommonJS 模块
        ignore(['fsevents']),
        json(),
        typescript({
            tsconfig: './tsconfig.json', // 指定 tsconfig 文件路径
        }), // 支持 TypeScript
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
