---
icon: pen-to-square
date: 2024-01-18
category:
  - 网络
tag:
  - Zerotier
  - 虚拟局域网
star:
  - 3
---



<!-- more -->使用公网IP服务器快速搭建Planet服务器并实现低延迟的局域网。这个项目的目的是配置Zerotier虚拟局域网，以配合Parsec实现低延迟的远程桌面。组成虚拟局域网后，玩法多样，也不仅限于远程桌面。实现方法是，使用一个带有公网IP的服务器，将其建成Planet服务器，以在国内提供Zerotier官方服务器无法提供的更流畅的服务。



# Zerotier配置过程



## 1. 使用原因

使用Zerotier官方服务器时，加入局域网并获得授权的两个设备需要首先获取对方在网络上的具体位置，然后尝试打洞，以实现直连。但鉴于国内网络环境特殊，打洞失败的概率相当高。打洞失败后，所有流量会Zerotier官网提供的服务器中转，以实现两台机器之间的通信。但这个服务器在国外，速度会慢不少，实测是在400ms以上，部分地区可能低一些。因此，对于有远程局域网需求的场景，建立自己的Planet服务器就非常重要了。

使用docker搭建Planet服务器相当方便，而且也不需要考虑太多配置环境的问题，本文就用这种方法。

这里不介绍Moon服务器和Planet服务器的区别，只是介绍如何搭建Planet服务器。



## 2. 搭建过程

1. 环境说明

   这里只列出来我使用的环境，并不说明一定要用这个环境：

   Ubuntu 20.04.1 LTS

   docker-compose

   我使用的是阿里云的云服务器。Planet服务器本身对云服务器的要求不高，因为它只需要提供加入网络的设备的网络信息即可，所以2C1G3M这样最基础的服务器已经够用了。

2. 更新apt

   ```bash
   sudo apt-get update
   ```

3. 新建文件夹并修改docker源

   ```bash
   cd
   
   mkdir planet
   
   cd planet/
   
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```

4. 安装docker-compose

   ```bash
   sudo apt install docker-compose
   ```

5. 获取zerotier-planet代码

   ```bash
   git clone https://github.com/Jonnyan404/zerotier-planet
   ```

   如果下载不下来，可以选择现在自己的电脑上下载，然后再上传服务器。

6. 进入文件夹并修改默认配置

   ```bash
   cd zerotier-planet
   
   # 可以先拉起一次服务，也可以先不拉，改完下面那条yml再拉
   sudo docker-compose up -d
   
   vim docker-compose.yml
   ```

   在docker-compose.yml文件中，将服务器的公网IP填入对应位置。

   另外可以修改登录密码，或者用默认密码也可以，到时候登录进服务器的时候也是需要修改的。

7. 拉起服务并做一些配置，按步骤来就好

   ```bash
   sudo docker-compose up -d
   
   sudo docker cp mkmoonworld-x86_64 ztncui:/tmp
   
   sudo docker cp patch.sh ztncui:/tmp
   
   docker exec -it ztncui bash /tmp/patch.sh
   
   sudo docker restart ztncui
   ```

   这样就拉起服务了。提示中可能会出现一些红色字体标出的内容，不用在意，并不是错误。

8. 在安全组中打开服务器端口

   打开阿里云服务器的后台，在安全组中添加3180、4000端口为TCP，9993端口为TCP和UDP。9993端口可以分两次添加，以便分别打开TCP和UDP。

9. 进入Planet服务器

   ![打开网页管理页面1](/zerotier/zerotier_login1.png)

   ![打开网页管理页面2](/zerotier/zerotier_login2.png)

   浏览器打开公网IP:4000，点击右上角的Log in，用户名是admin，密码就是刚才在docker-compose.yml里设置的密码。登录进去后，需要先改一次密码。

10. 添加新网络并给新网络分配IP

    ![创建网络1](/zerotier/zerotier_create_network1.png)

    ![创建网络2](/zerotier/zerotier_create_network2.png)

    ![创建网络3](/zerotier/zerotier_create_network3.png)

    改完密码后，可以在顶栏找到Add network选项卡，点进去，给网络起一个名字，然后点击创建，这样就创建了一个局域网。这个局域网需要一个路由。Networks，点击网络的名称，可以进入网络的详细内容。点击网络名下面的Routes，在Add new route中输入一个IP，比如我的是：192.168.10.0/24

    千万不要忘记这个/24，它是必须的。

    然后点击submit就可以了。

## 3. 客户端设置

我这里只介绍Windows客户端的安装，网上应该有Linux版本的安装，我就不记录了，因为我是在Windows上装的。

首先到Zerotier官网下载一个Zerotier客户端：

[Zerotier官方下载](https://www.zerotier.com/download/)

![下载planet文件](/zerotier/zerotier_planet_download.png)

在下载期间，需要下载Planet服务器提供的planet文件。浏览器打开：公网IP:3180就可以打开，里面提供一个.moon文件和一个planet文件的下载，只需要下载planet文件即可。

![开启服务1](/zerotier/zerotier_service1.png)

![开启服务2](/zerotier/zerotier_service2.png)

![开启服务3](/zerotier/zerotier_service3.png)

![开启服务4](/zerotier/zerotier_service4.png)

![开启服务5](/zerotier/zerotier_service5.png)

在电脑上安装刚下好的Zerotier后，打开Windows的服务界面，Windows 11可以底栏搜索“服务”，打开后找到Zerotier One这个服务，右键选项，找到它的具体文件夹并打开这个文件夹。删除里面自带的planet文件，并把刚刚下载的planet文件放进去。注意，有可能下下来是一个叫planet.planet的文件。如果出现这种情况，把它重命名成planet就可以。

放进去后，在“服务”界面，点击Zerotier One，然后在左上角把这个服务重启一下。如果提示无法重启，它应该会直接跳到可以启动的状态，那么直接启动它吧。

![加入网络](/zerotier/zerotier_join_network.png)

在Planet服务器上，有一个唯一指定的标识符，它是用来加入这个局域网的。在浏览器打开公网IP:4000界面，登陆后，点进网络的具体信息。在网络名称后面就有一个非常长的一段数字和字母的组合，它就是这个网络的标识符，把它复制下来。

Windows右下角找到Zerotier One，点击它，然后点一下join network，将复制到的标识符输入进去，点击join就可以加入这个网络了。

加入网络后，还要再回到Planet服务器上，点击进入网络的具体信息，这时候可以看见已经有个设备请求加入了，将允许访问的两个方框点上，可以打上勾。可以给设备起个名字。



接着要分配一下它的IP。点击这个设备对应的IP Assignment，给它分配一个IP，比如说192.168.10.100，总之前三段一定要和刚才设置的路由一致。这样就设置好了。如果设备已经被分配了IP，就会在原来IP Assignment的位置变成它被分配的IP。



多设置几台电脑，可以相互ping通，延迟大概在20-40ms这样，比起Zerotier官方服务器没有打洞成功的情况低了很多。

