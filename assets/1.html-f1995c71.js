import{_ as o}from"./testbench_connect-a1422dd7.js";import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{r as i,o as p,c as l,d as h,b as a,a as e,e as t,f as s}from"./app-4864bddc.js";const d="/backend-note/数字电路验证/testbench.svg",c={},_=s('<h1 id="_1、数字电路验证简介" tabindex="-1"><a class="header-anchor" href="#_1、数字电路验证简介" aria-hidden="true">#</a> 1、数字电路验证简介</h1><h2 id="_1-1-数字电路" tabindex="-1"><a class="header-anchor" href="#_1-1-数字电路" aria-hidden="true">#</a> 1.1 数字电路</h2><p>仅用二值逻辑表示电路状态的电路称为数字电路。逻辑1/逻辑0并不代表实际的电压值，甚至不一定代表高电平/低电平。</p><p>一般来说，逻辑电平是人为决定的，它可以是实际电压的一个范围。例如，可以用逻辑1表示5V-3V的电压，同时逻辑0对应于2V-0V。而在负逻辑中，可能会用逻辑1代表电压较低的那一段范围，而用逻辑0指代电压较高的那个范围。不论如何，千万不能机械地、死板地理解数字电路中的逻辑电平与实际电压之间的关系。</p><p>另外，对于Flash所使用的器件来说，有时一个器件能表示多个比特的数据。例如，当使用QLC颗粒时，其中的每一个浮栅管都能储存4位数据，而非传统认知中的1位。因此，也不能简单地认为，每一个器件只能表示2种状态。这里提到的浮栅管事实上能用4位数据表示16种状态。</p><p>然而，数字电路制造本身和他们的原理并不是本文的重点。这一系列文章旨在记录我学习数字电路功能验证的过程，以及一些其他的感受。</p><h2 id="_1-2-什么是数字电路功能验证" tabindex="-1"><a class="header-anchor" href="#_1-2-什么是数字电路功能验证" aria-hidden="true">#</a> 1.2 什么是数字电路功能验证</h2><p>每一个数字电路都是为了完成一定的功能产生的。对于使用RTL语言（或其他语言）完成的电路设计，需要用一些方法去验证它的功能是否正确，然后才能送到下一个部门继续工作。</p><p>对于复杂的数字系统来说，写出BUG不算什么怪事，而数字电路功能验证就是为了解决这个问题。尽管验证人员也可能犯错，写出错误的代码，带来错误的验证结果，但如果一直假定某个环节一定会出错，那么很多事情就无法进行了。那么，如何避免验证人员犯错呢？</p><p>首先，需要把功能验证做成一套固定的思路，只要遵循这种思路来，就不容易出错。这种定式可以称为“方法学”。在过去的几十年间，验证工程师通过他们的切身经历，提出了许多方法学，例如VMM、OVM等等。在2011年，几大EDA公司都开始大力推进UVM验证方法学的发展，目前（截至2023年）已经出到UVM 1.2了。它的发展我在其他参考资料中已经看了很多，也就不写了。</p><p>可以稍微记一下UVM的特点：</p><ol><li><p>可重用性</p><p>UVM有个很重要的思想就是可重用性。这主要体现在，无论是利用UVM的config机制或者普通的System Verilog语言的替换，都可以很轻松地完成验证平台的功能替换。当被验证的模块（Design Under Test, DUT）具有一定相似性时，UVM甚至可以直接用在这些类似的模块上，只需要稍作修改就可以。</p></li><li><p>扩展性</p><p>在UVM中， 绝大多数组件都由UVM自带的类扩展而来，可以说充分发挥了System Verilog这种面向对象语言的特点，也就是封装、继承、多态。用户甚至可以在自己扩展出来的类的基础上再进行扩展，然后用于接下来的仿真。</p></li><li><p>自动化仿真并收集数据</p><p>UVM有一个特殊的机制，叫做factory机制。它的存在主要解决了验证自动化的问题。在合理配置每个组件后，仅需要一行代码就可以开始整个仿真，全程自动进行，并给出非常详尽的报告。这是手动使用Verilog语言进行验证做不到的。当然，前提是正确配置仿真组件。</p></li></ol><h2 id="_1-3-验证平台的结构" tabindex="-1"><a class="header-anchor" href="#_1-3-验证平台的结构" aria-hidden="true">#</a> 1.3 验证平台的结构</h2><p>正如刚才所说，为了让验证尽量不容易出错，需要把验证平台做一些规范化，形成定式。所以，验证平台的结构很重要。一般来说，在介绍不论是张强的《UVM实战》这本书还是什么别的地方，都会类似的图。尽管如此，我还是不厌其烦地再放一次，而且不仅放出常见的未连接的图，还把每个组件之间的连接方法也表现出来并放在另一张图里，方便记忆。</p><figure><img src="'+d+'" alt="UVM平台结构（未连接）" tabindex="0" loading="lazy"><figcaption>UVM平台结构（未连接）</figcaption></figure><figure><img src="'+o+'" alt="UVM平台结构（已连接）" tabindex="0" loading="lazy"><figcaption>UVM平台结构（已连接）</figcaption></figure><p>需要说明的是，这里的平台结构是参考了张强的《UVM实战》中的插图，并且有根据他的代码做改动。比如，在master agent中，我就把他用的analysis port也一起放进去做展示了。实际操作中，还可以有其他的端口可以用在这里，而不仅限于analysis port。</p><h2 id="_1-4-数字验证的工具和前置知识" tabindex="-1"><a class="header-anchor" href="#_1-4-数字验证的工具和前置知识" aria-hidden="true">#</a> 1.4 数字验证的工具和前置知识</h2><p>我个人是准备了下面这些东西：</p><ol><li><p>System Verilog</p><p>这是基础中的基础，如果连SV都没学过，就得赶紧去学了。一般来说都是推荐皮尔森的绿皮书，这本书写得非常详细，例子也非常好。</p></li><li><p>Python</p><p>Python一开始用不上，后面会非常有用，而且很多UVM岗位也需要会用Python去写一些东西，当然用Perl也是有的。不过，Python学会的人更多，所以我还是学了Python。</p></li><li><p>ModelSim/VCS</p><p>用来实际跑仿真的工具，这个网上教程很多，我总结了之后也会写到这里。</p></li></ol><h2 id="_1-5-参考文献" tabindex="-1"><a class="header-anchor" href="#_1-5-参考文献" aria-hidden="true">#</a> 1.5 参考文献</h2><p>全文的参考文献都会放在这里。</p>',22),V=e("p",null,"[1] 张强 《UVM实战》，机械工业出版社",-1),f={href:"https://www.bilibili.com/video/BV1QE411Z7XF",target:"_blank",rel:"noopener noreferrer"},m={href:"https://www.edaplayground.com/",target:"_blank",rel:"noopener noreferrer"},u={href:"https://zhuanlan.zhihu.com/p/424887852",target:"_blank",rel:"noopener noreferrer"};function g(M,U){const r=i("ExternalLinkIcon");return p(),l("div",null,[h(" more "),a("最近在学习数字验证方面的东西，想到了就随手记录一下，不一定对。 "),_,e("blockquote",null,[V,e("p",null,[a("[2] E课网 《UVM基础》，"),e("a",f,[a("https://www.bilibili.com/video/BV1QE411Z7XF"),t(r)])]),e("p",null,[a("[3] EDAplayground，"),e("a",m,[a("https://www.edaplayground.com/"),t(r)])]),e("p",null,[a("[4] Config_db机制基础 - 芯片学堂的文章 - 知乎 "),e("a",u,[a("https://zhuanlan.zhihu.com/p/424887852"),t(r)])])])])}const w=n(c,[["render",g],["__file","1.html.vue"]]);export{w as default};
