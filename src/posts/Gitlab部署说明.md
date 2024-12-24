---
icon: pen-to-square
date: 2023-12-20
category:
  - 网络
tag:
  - 操作系统
  - Gitlab
star:
  - 3
---


<!-- more -->项目使用的服务器需要一个Gitlab来保存电路图和它的说明文档，所以部署了一个Gitlab来保存，使用Docker快速部署。文档已经隐藏了部分敏感信息。有不少命令需要sudo权限，所以这次安装是在有权限的账号里安装的，只需要确保保存数据的路径有其他项目相关用户的权限就行。



# Gitlab部署说明

## 环境

Centos 7

docker 24.0.7

Gitlab中文社区版 docker镜像

## 部署

1. 安装docker

查看系统版本是否支持安装docker：

```bash

    uname -r

```

输出为：

3.10.0-1160.el7.x86_64

满足3.10.0及以上的要求，可以安装。

服务器上之前没有安装过docker，所以不需要卸载旧版本，直接开始安装：

```bash

curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

```

这是一键安装命令，官方推荐。

安装完成后，启动docker服务：

```bash

sudo systemctl start docker

sudo systemctl enable docker

```

2. 拉取gitlab中文社区版docker镜像

```bash

docker pull beginor/gitlab-ce

```

3. 建立文件夹

gitlab需要三个工作文件夹，分别命名为etc、logs和data，在这台服务器的位置是：

/backup/gitlab

4. 用镜像生成容器

首先需要加入Gitlab的home目录，也就是：

```bash

export GITLAB_HOME = /backup/gitlab

```

然后用下面这条命令生成容器：

```bash

docker run \
--detach \
--publish 8443:443 \
--publish 8090:80 \
--publish 8022:22 \
--name gitlab \
--restart always \
--hostname 192.168.0.10 \
-v $GITLAB_HOME/etc:/etc/gitlab \
-v $GITLAB_HOME/logs:/var/log/gitlab \
-v $GITLAB_HOME/data:/var/opt/gitlab \
-v /etc/localtime:/etc/localtime:ro \
--privileged=true beginor/gitlab-ce

```

容器命名：gitlab，需要删除或者重启容器可以直接用这个名字。

服务器地址：192.168.0.10，这个是服务器的内网IP，如果需要向公网开放，需要填上公网IP，并确保路由器里的相关端口开放。

工作路径：配置到一块机械硬盘上，这里映射到刚才提到的/backup/gitlab上。

**这里把容器内Gitlab默认的22端口映射到宿主机的8022端口了，等一下需要clone或者做其他有关git项目操作的时候需要注意。**

## 创建新账号和免密登录配置

1. 在Gitlab上创建账户

在局域网内任一台电脑的浏览器地址栏输入Gitlab地址：

192.168.0.10:8090

注意要输入端口号。

也可以在服务器本地访问Gitlab，输入的IP改为127.0.0.1，后来因为网络更改原因，现在已经统一改成本地访问，不再使用192.168.0.10这个内网IP，后面的IP也要统一改成本地IP，这里不再标注。

网页打开Gitlab，输入账号、密码、邮箱就可以创建账户，这个账户是本地账户。

2. 在git中配置git账户信息

   ```bash
   
   git config --global user.name "user.name"
   
   git config --global user.email  "yourmail@youremail.com.cn"
   
   ```
3. 设置免密登录

   首先到家目录的.ssh文件夹里生成公钥私钥：

   ```bash
   
   cd ~/.ssh
   
   ssh-keygen -t rsa -C "youremail@youremail.com"
   
   ```

   网页登录Gitlab，在账户设置界面点左侧的SSH登录，把id_rsa.pub里的内容复制到框里，起个名字就行，然后点添加

   在terminal里输入：

   ```bash
   
   ssh -p 8022 -T git@192.168.0.10
   
   ```

   回车验证是否添加成功，添加成功会收到一条欢迎信息。
4. 加入小组

   联系管理员加入就行。
5. clone说明

   以低压部分为例，需要这样：

   ```bash
   
   git clone ssh://git@192.168.0.10:8022/moyu/PSS50S71F6_LowSide.git
   
   ```

   这样才可以，也就是要加上ssh://这样的前缀和:8022这样的端口。只用Gitlab提供的那个ssh地址是不行的，它会去访问默认的22端口。
6. 加入.gitignore文件

   为了防止在上传电路图的时候把电路图的锁和一些本地的配置文件一起上传，需要在带有.git的同级位置加上一个.gitignore文件，主要内容有：

   ```bash
   
   .gitignore
   
   *cdslck*
   
   ```

   保存即可。

## 修改本地仓库与Gitlab的关联

如果网络环境变化了需要修改本地仓库与远程仓库的连接，可以先用下面命令查看连接关系：

```bash

    git remote -vv

```

确认需要修改后，使用命令

```bash

    git remote set-url origin https://gitee.com/xx/xx.git (新地址)

```

即可修改。

## 重启容器和删除容器

有时候需要重启容器，只需要输入：

```bash

    sudo docker restart gitlab

```

如果要重新部署容器，需要先停止、删除容器：

```bash

sudo docker stop gitlab

sudo docker rm gitlab

```

然后再根据前面生成容器的方法来就可以。

**注意：删除容器并不会删除掉已经上传的内容，只会让容器不再存在。Gitlab中的内容和配置文件仍然保存在之前创建的三个文件夹里。尽管如此，除非Gitlab遭遇了不可逆转的错误，否则不建议删除容器。**

## 参考文献

1. [安装docker](https://www.cnblogs.com/Liyuting/p/17022739.html)
2. [部署Gitlab参考1（主要参考）](https://www.cnblogs.com/shuhe-nd/p/13033085.html)
3. [部署Gitlab参考2（次要参考）](https://zhuanlan.zhihu.com/p/636983434)
4. [免密登录](https://blog.csdn.net/zhanshixiang/article/details/104286992)



<Comment></Comment>

