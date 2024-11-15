FROM node:18-bullseye-slim

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制其他项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]
