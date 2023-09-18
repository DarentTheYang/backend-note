---
icon: pen-to-square
date: 2023-07-12
category:
  - 杂项
tag:
  - 操作系统

---







<!-- more -->之前因为需要，用了一段时间的openSuSE，感觉这是个非常不错的Linux操作系统，兼容性特别强，界面做得也很好看。在使用过程中解决过一些问题，所以趁着写博客就一起放出来。





# openSuSE的一些使用心得



## 调整openSuSE屏幕亮度

找了很多教程，参考后自己摸索出来了，记录一下。

系统版本：openSuSE Leap 15.4

桌面环境：KDE

---
### 一、找到本机专属的brightness文件手动修改亮度

首先确定自己系统用的驱动，这会决定亮度文件的位置

```shell
cd /sys/class/backlight/

ls
```

我是手动重装过NVIDIA驱动的，并不是openSuSE自带的开源驱动nouveau，所以这里的文件夹是nvidia_0，其他驱动需要仔细看好。

**注意，不要盲目使用网上的路径，因为本机使用的驱动不一定和他们一样！**

接着进入文件夹
```shell
cd nvidia_0

sudo vi brightness
```

在vi窗口里更改数字调整亮度（我一般调整为5,黑暗环境调整为2，默认是10）。数字越大，亮度越高。保存后，亮度会立即改变。




---
### 二、使用shell脚本修改亮度

每次调亮度都要去里面改，不免有些麻烦，可以写一个shell脚本帮助调整。

在家目录下新建文件，文件名随意，好记就行，例如：
```shell
touch bright.sh
```

在文件里写入

```shell
#!/bin/sh

# 这个nvidia_0要改成本机brightness的目录，不一定是nvidia_0

cd /sys/class/backlight/nvidia_0

sudo echo $1 > brightness

echo "更改当前亮度为$1"
```

保存。需要调整亮度时，直接在家目录下输入命令

```shell
sudo sh bright.sh 亮度值
```

回车，就可以调整亮度了。例如我要调整亮度为2，就在终端中输入

```shell
sudo sh bright.sh 2
```
回车即可修改。

---
### 三、开机自动调整亮度


openSuSE开机会自动把屏幕调到最亮，所以用crontab -e做个开机自动调整屏幕亮度到一个合适大小，防止闪瞎。我这里选的亮度是5。

在终端中输入

```shell
sudo crontab -e
```

在弹出来的窗口输入
```
@reboot sleep 5; nohup sh /home/yang/bright.sh 5
```

其中yang是我的用户名，需要把用户名改成自己的，或者什么别的路径。
为了捕获可能的错误，还需要写一个log文件，把crontab -e中的内容修改一下

```
@reboot sleep 5; nohup sh /home/yang/bright.sh 5 > /home/yang/log/bright.log 2>&1
```
sleep 5指的是，启动后先休眠5秒再执行，以防止因为其他项目还没加载好就执行，导致找不到文件的错误。

这个/home/yang/log文件夹是我自己在家目录创建的，原本并没有这个目录。我创建这个log文件夹是为了保存各种log，方便找。

保存，重启尝试。我的电脑上没问题，成功了。


## libreoffice套件文件处理

libreoffice是OpenSUSE自带的开源的文档处理工具，它提供了一些方便的命令，比如这里介绍的把doc或其他一些格式转换成pdf的工具。另外，还可以方便地把多个pdf文件合成一个。

批处理doc、docx和ppt、pptx，将其转换为pdf

1. 进入文件所在目录

2. 输入如下命令

```bash
libreoffice --invisible --convert-to pdf xxx.doc
```

这句话是把xxx.doc转化为pdf文件，改成其他三个也可以转换成pdf。

3. 如果需要批处理，可以输入下面的命令

```bash
libreoffice --invisible --convert-to pdf *.doc
```

就能把当前目录的所有doc后缀文件都转换成pdf文件，接着打包就行。

4. 合并PDF

pdfunite *.pdf xxx.pdf

把当前目录下的所有pdf合并成xxx.pdf


## 各种源的添加方法（来源网络，侵删）

### 一、zypper源

#### USTC

http://mirrors.ustc.edu.cn/help/opensuse.html


#### 清华

https://mirrors.tuna.tsinghua.edu.cn/help/opensuse/

#### openSUSE Leap 15.2 或更新版本使用方法

禁用官方软件源

sudo zypper mr -da

添加 TUNA 镜像源

sudo zypper ar -cfg 'https://mirrors.tuna.tsinghua.edu.cn/opensuse/distribution/leap/$releasever/repo/oss/' tuna-oss

sudo zypper ar -cfg 'https://mirrors.tuna.tsinghua.edu.cn/opensuse/distribution/leap/$releasever/repo/non-oss/' tuna-non-oss

sudo zypper ar -cfg 'https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/oss/' tuna-update

sudo zypper ar -cfg 'https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/non-oss/' tuna-update-non-oss


Leap 15.3 用户还需添加 sle 和 backports 源

sudo zypper ar -cfg 'https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/sle/' tuna-sle-update

sudo zypper ar -cfg 'https://mirrors.tuna.tsinghua.edu.cn/opensuse/update/leap/$releasever/backports/' tuna-backports-update

Leap 15.3 注：若在安装时没有启用在线软件源， sle 源和 backports 源将在系统首次更新后引入，请确保系统在更新后仅启用了六个所需软件源。可使用 zypper lr 检查软件源状态，并使用 zypper mr -d 禁用多余的软件源。


### 二、Anaconda源

https://mirrors4.tuna.tsinghua.edu.cn/help/anaconda/

1. 打开~/.condarc

2. 按提示操作


### 三、pip源

https://mirrors.tuna.tsinghua.edu.cn/help/pypi/



## 安装Quantum ESPRESSO

### 0. 本机环境

系统： openSuSE 15.4 Leap

CPU： R7 5800H

GPU： RTX 3060 Laptop

### 1. 必要环境(串行计算)

必要的包：

a. liblapack

b. libblas

c. gfortran

d. make

### 2. 环境安装

a. liblapack

因为是openSuSE，可以直接用包管理器YaST解决这个问题。这里推荐是，就算安装过了liblapack，也要删掉后重装一遍。

打开YaST，点击“软件管理”，在左边搜索栏输入liblapack，等搜索出来后，点前面的勾，把它变成红色减号，点右下角接受。

然后再次搜索，重新点回来。

b. libblas

安装同上。

c. gfortran

同样可以使用YaST安装，安装gfortran4就可以。

也可以用命令行安装：

先卸载自带的gcc和gfortran。

```bash
sudo zypper rm gcc

sudo zypper rm gfortran

```

在命令行输入cnf gfortran， 找到包含这条命令的代码。

先安装回gcc，再安装回gfortran。

```bash
sudo zypper in gcc

sudo zypper in libgfortran4

就可以了。两者其实没有差异，用YaST安装更方便。

```

d. make

这个很随意，用YaST安装就可以了。

或者命令行输入

```bash
sudo zypper in make

```

### 3. Quantum ESPRESSO下载

[点击访问Quantum ESPRESSO官网](https://www.quantum-espresso.org/)

点导航栏Download，在页面中选择software，点击名字。

如果没有注册过，需要注册。

然后就自动下载了。

### 4. 软件安装

首先把压缩包qe-7.1-ReleasePack.tar.gz解压到放软件的地方。

cd进入解压出来的文件夹，然后按顺序执行命令

```bash
# 配置默认编译环境
./configure

# 开始编译安装，自行选择需要安装的库，比如这里的pwall、tddfpt、xspectra、cp
make -j 4 pwall

make -j 4 tddfpt

make -j 4 xspectra

make -j 4 cp

```

这里记录一个过往版本不适用于现在版本的问题：

现在版本中，pw.x不再使用pw编译名，而是使用pwall，谨记。

-j 4指的是使用4个核并行编译，能快很多。

这四个模块(主要是pwall)是用来计算能带等数据的，应该符合我需要算的东西的，所以装这个。

编译完成后，进入bin文件夹，如果能看到许多*.x的文件就说明成功。注意看一下有没有核心可执行文件pw.x的存在。

### 5. 并行计算增补说明

刚才是没有并行计算模块mpi的安装方法。如果要加上并行计算，需要在安装多安装一个mpich的软件。

首先进入官网下载：

[点击访问MPICH官网]()

安装MPICH需要补充的库： g++

直接装就行，或者在命令行输入cnf g++ ，然后装它提供的那个。

下载后，解压到存放的位置，然后进入。

然后在命令行里依次输入下面这段代码

```bash
# 等号后面是文件安装路径

./configure --prefix=/usr/local/mpich

make -j 8

make -j 8 install

```

多核并行编译快很多。

然后，在~/.bashrc里添加

```bash
export PATH=/home/yang/software/packages/mpich/bin:$PATH

export MANPATH=/home/tiger/software/packages/mpich/man:$MANPATH

```

就可以了，先在命令行里输入重新载入环境变量

```bash
source ~/.bashrc

```

然后输入

```bash
mpif90 -v

```

只要有内容，就成功了。

接着需要编译一下QE。

如果之前编译过QE了，需要先到QE的文件夹下，输入make clean清除所有编译过的内容，然后输入

```bash
./configure -enable-parallel

```

注意看一下文字最后的附近有没有parallel successfully这样的字样。

之后的操作步骤就和之前串行的一样了。

### 6. 异构计算增补说明

因为我是单机运行，不需要异构计算，所以这个不讲。

### 参考:

[1] https://www.guanjihuan.com/archives/12325

[2] https://www.bilibili.com/read/cv18425985

[3] MPICH安装参考： https://blog.csdn.net/sinat_30967935/article/details/82988659

