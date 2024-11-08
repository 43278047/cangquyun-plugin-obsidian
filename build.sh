#!/bin/bash

# 执行 npm build
npm run build

# 等待1秒钟
sleep 1

# 移动并覆盖 ./dist 目录下的所有文件到目标目录
cp -R ./dist/* /Users/wanghao/Desktop/obsidian-test/.obsidian/plugins/test/

# 输出完成信息
echo "文件已成功移动并覆盖到目标目录。"