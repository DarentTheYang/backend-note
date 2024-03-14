import{_ as r}from"./plugin-vue_export-helper-c27b6911.js";import{r as i,o as t,c as d,d as c,b as n,a,e as s,f as p}from"./app-4864bddc.js";const o={},u=p(`<h1 id="gitlab部署说明" tabindex="-1"><a class="header-anchor" href="#gitlab部署说明" aria-hidden="true">#</a> Gitlab部署说明</h1><h2 id="环境" tabindex="-1"><a class="header-anchor" href="#环境" aria-hidden="true">#</a> 环境</h2><p>Centos 7</p><p>docker 24.0.7</p><p>Gitlab中文社区版 docker镜像</p><h2 id="部署" tabindex="-1"><a class="header-anchor" href="#部署" aria-hidden="true">#</a> 部署</h2><ol><li>安装docker</li></ol><p>查看系统版本是否支持安装docker：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
    <span class="token function">uname</span> <span class="token parameter variable">-r</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出为：</p><p>3.10.0-1160.el7.x86_64</p><p>满足3.10.0及以上的要求，可以安装。</p><p>服务器上之前没有安装过docker，所以不需要卸载旧版本，直接开始安装：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">curl</span> <span class="token parameter variable">-fsSL</span> https://get.docker.com <span class="token operator">|</span> <span class="token function">bash</span> <span class="token parameter variable">-s</span> <span class="token function">docker</span> <span class="token parameter variable">--mirror</span> Aliyun

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这是一键安装命令，官方推荐。</p><p>安装完成后，启动docker服务：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">sudo</span> systemctl start <span class="token function">docker</span>

<span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> <span class="token function">docker</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>拉取gitlab中文社区版docker镜像</li></ol><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">docker</span> pull beginor/gitlab-ce

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3"><li>建立文件夹</li></ol><p>gitlab需要三个工作文件夹，分别命名为etc、logs和data，在这台服务器的位置是：</p><p>/backup/gitlab</p><ol start="4"><li>用镜像生成容器</li></ol><p>首先需要加入Gitlab的home目录，也就是：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token builtin class-name">export</span> GITLAB_HOME <span class="token operator">=</span> /backup/gitlab

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后用下面这条命令生成容器：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">docker</span> run <span class="token punctuation">\\</span>
<span class="token parameter variable">--detach</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">--publish</span> <span class="token number">8443</span>:443 <span class="token punctuation">\\</span>
<span class="token parameter variable">--publish</span> <span class="token number">8090</span>:80 <span class="token punctuation">\\</span>
<span class="token parameter variable">--publish</span> <span class="token number">8022</span>:22 <span class="token punctuation">\\</span>
<span class="token parameter variable">--name</span> gitlab <span class="token punctuation">\\</span>
<span class="token parameter variable">--restart</span> always <span class="token punctuation">\\</span>
<span class="token parameter variable">--hostname</span> <span class="token number">192.168</span>.0.10 <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable">$GITLAB_HOME</span>/etc:/etc/gitlab <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable">$GITLAB_HOME</span>/logs:/var/log/gitlab <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable">$GITLAB_HOME</span>/data:/var/opt/gitlab <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> /etc/localtime:/etc/localtime:ro <span class="token punctuation">\\</span>
<span class="token parameter variable">--privileged</span><span class="token operator">=</span>true beginor/gitlab-ce

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>容器命名：gitlab，需要删除或者重启容器可以直接用这个名字。</p><p>服务器地址：192.168.0.10，这个是服务器的内网IP，如果需要向公网开放，需要填上公网IP，并确保路由器里的相关端口开放。</p><p>工作路径：配置到一块机械硬盘上，这里映射到刚才提到的/backup/gitlab上。</p><p><strong>这里把容器内Gitlab默认的22端口映射到宿主机的8022端口了，等一下需要clone或者做其他有关git项目操作的时候需要注意。</strong></p><h2 id="创建新账号和免密登录配置" tabindex="-1"><a class="header-anchor" href="#创建新账号和免密登录配置" aria-hidden="true">#</a> 创建新账号和免密登录配置</h2><ol><li>在Gitlab上创建账户</li></ol><p>在局域网内任一台电脑的浏览器地址栏输入Gitlab地址：</p><p>192.168.0.10:8090</p><p>注意要输入端口号。</p><p>也可以在服务器本地访问Gitlab，输入的IP改为127.0.0.1，后来因为网络更改原因，现在已经统一改成本地访问，不再使用192.168.0.10这个内网IP，后面的IP也要统一改成本地IP，这里不再标注。</p><p>网页打开Gitlab，输入账号、密码、邮箱就可以创建账户，这个账户是本地账户。</p><ol start="2"><li><p>在git中配置git账户信息</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">git</span> config <span class="token parameter variable">--global</span> user.name <span class="token string">&quot;user.name&quot;</span>

<span class="token function">git</span> config <span class="token parameter variable">--global</span> user.email  <span class="token string">&quot;yourmail@youremail.com.cn&quot;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>设置免密登录</p><p>首先到家目录的.ssh文件夹里生成公钥私钥：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token builtin class-name">cd</span> ~/.ssh

ssh-keygen <span class="token parameter variable">-t</span> rsa <span class="token parameter variable">-C</span> <span class="token string">&quot;youremail@youremail.com&quot;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>网页登录Gitlab，在账户设置界面点左侧的SSH登录，把id_rsa.pub里的内容复制到框里，起个名字就行，然后点添加</p><p>在terminal里输入：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">ssh</span> <span class="token parameter variable">-p</span> <span class="token number">8022</span> <span class="token parameter variable">-T</span> git@192.168.0.10

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>回车验证是否添加成功，添加成功会收到一条欢迎信息。</p></li><li><p>加入小组</p><p>联系管理员加入就行。</p></li><li><p>clone说明</p><p>以低压部分为例，需要这样：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">git</span> clone ssh://git@192.168.0.10:8022/moyu/PSS50S71F6_LowSide.git

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样才可以，也就是要加上ssh://这样的前缀和:8022这样的端口。只用Gitlab提供的那个ssh地址是不行的，它会去访问默认的22端口。</p></li><li><p>加入.gitignore文件</p><p>为了防止在上传电路图的时候把电路图的锁和一些本地的配置文件一起上传，需要在带有.git的同级位置加上一个.gitignore文件，主要内容有：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
.gitignore

*cdslck*

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>保存即可。</p></li></ol><h2 id="修改本地仓库与gitlab的关联" tabindex="-1"><a class="header-anchor" href="#修改本地仓库与gitlab的关联" aria-hidden="true">#</a> 修改本地仓库与Gitlab的关联</h2><p>如果网络环境变化了需要修改本地仓库与远程仓库的连接，可以先用下面命令查看连接关系：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
    <span class="token function">git</span> remote <span class="token parameter variable">-vv</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>确认需要修改后，使用命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
    <span class="token function">git</span> remote set-url origin https://gitee.com/xx/xx.git <span class="token punctuation">(</span>新地址<span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>即可修改。</p><h2 id="重启容器和删除容器" tabindex="-1"><a class="header-anchor" href="#重启容器和删除容器" aria-hidden="true">#</a> 重启容器和删除容器</h2><p>有时候需要重启容器，只需要输入：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
    <span class="token function">sudo</span> <span class="token function">docker</span> restart gitlab

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果要重新部署容器，需要先停止、删除容器：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token function">sudo</span> <span class="token function">docker</span> stop gitlab

<span class="token function">sudo</span> <span class="token function">docker</span> <span class="token function">rm</span> gitlab

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后再根据前面生成容器的方法来就可以。</p><p><strong>注意：删除容器并不会删除掉已经上传的内容，只会让容器不再存在。Gitlab中的内容和配置文件仍然保存在之前创建的三个文件夹里。尽管如此，除非Gitlab遭遇了不可逆转的错误，否则不建议删除容器。</strong></p><h2 id="参考文献" tabindex="-1"><a class="header-anchor" href="#参考文献" aria-hidden="true">#</a> 参考文献</h2>`,53),v={href:"https://www.cnblogs.com/Liyuting/p/17022739.html",target:"_blank",rel:"noopener noreferrer"},b={href:"https://www.cnblogs.com/shuhe-nd/p/13033085.html",target:"_blank",rel:"noopener noreferrer"},m={href:"https://zhuanlan.zhihu.com/p/636983434",target:"_blank",rel:"noopener noreferrer"},h={href:"https://blog.csdn.net/zhanshixiang/article/details/104286992",target:"_blank",rel:"noopener noreferrer"};function g(k,f){const e=i("ExternalLinkIcon"),l=i("Comment");return t(),d("div",null,[c(" more "),n("项目使用的服务器需要一个Gitlab来保存电路图和它的说明文档，所以部署了一个Gitlab来保存，使用Docker快速部署。文档已经隐藏了部分敏感信息。有不少命令需要sudo权限，所以这次安装是在有权限的账号里安装的，只需要确保保存数据的路径有其他项目相关用户的权限就行。 "),u,a("ol",null,[a("li",null,[a("a",v,[n("安装docker"),s(e)])]),a("li",null,[a("a",b,[n("部署Gitlab参考1（主要参考）"),s(e)])]),a("li",null,[a("a",m,[n("部署Gitlab参考2（次要参考）"),s(e)])]),a("li",null,[a("a",h,[n("免密登录"),s(e)])])]),s(l)])}const G=r(o,[["render",g],["__file","Gitlab部署说明.html.vue"]]);export{G as default};
