import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,d as e,b as i,f as t}from"./app-4864bddc.js";const l={},c=t(`<h1 id="_2、transaction和事务级仿真" tabindex="-1"><a class="header-anchor" href="#_2、transaction和事务级仿真" aria-hidden="true">#</a> 2、transaction和事务级仿真</h1><h2 id="_2-1-何为事务级仿真" tabindex="-1"><a class="header-anchor" href="#_2-1-何为事务级仿真" aria-hidden="true">#</a> 2.1 何为事务级仿真</h2><p>在验证平台中，数据并不以pin级信号传输，而是以一种特殊的数据形式transaction存在。这里提到的transaction指的就是事务，它区别于pin级仿真。以定义transaction类来决定DUT的需要传入的信号，能有效解决数据随机生成问题的。诚然，Verilog中也有random系统函数可用，但用起来不太顺手，复用性也不是很好。</p><p>因此，在DUT固定下来后，首先需要搞清楚DUT的作用，以及它和上位机的通信方式，还有它需要接收的pin级信号有哪些，接着就可以编写transaction类了。</p><p>这里作为例子，用一个非常简单的模块作为DUT：</p><div class="language-verilog line-numbers-mode" data-ext="verilog"><pre class="language-verilog"><code><span class="token comment">// 数据转发模块</span>
<span class="token keyword">module</span> <span class="token function">dut</span><span class="token punctuation">(</span>
    <span class="token keyword">input</span> clk<span class="token punctuation">,</span>
    <span class="token keyword">input</span> rst_n<span class="token punctuation">,</span>
    
    <span class="token keyword">input</span> <span class="token punctuation">[</span><span class="token number">3</span><span class="token punctuation">:</span><span class="token number">0</span><span class="token punctuation">]</span> rxd<span class="token punctuation">,</span>
    <span class="token keyword">input</span> rxv<span class="token punctuation">,</span>
    
    <span class="token keyword">output</span> <span class="token keyword">reg</span> <span class="token punctuation">[</span><span class="token number">3</span><span class="token punctuation">:</span><span class="token number">0</span><span class="token punctuation">]</span>txd<span class="token punctuation">,</span>
    <span class="token keyword">output</span> <span class="token keyword">reg</span> txv
<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token important">always@</span><span class="token punctuation">(</span><span class="token keyword">posedge</span> clk <span class="token keyword">or</span> <span class="token keyword">negedge</span> rst_n<span class="token punctuation">)</span> <span class="token keyword">begin</span>
        <span class="token function">if</span><span class="token punctuation">(</span><span class="token operator">!</span>rst_n<span class="token punctuation">)</span> <span class="token keyword">begin</span>
            txd <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">;</span>
            txv <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">end</span>
        <span class="token keyword">else</span> <span class="token keyword">begin</span>
            txd <span class="token operator">&lt;=</span> rxd<span class="token punctuation">;</span>
            txv <span class="token operator">&lt;=</span> rxv<span class="token punctuation">;</span>
        <span class="token keyword">end</span>
    <span class="token keyword">end</span>
<span class="token keyword">endmodule</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个模块承担一个非常简单的任务：把从上位机接收到的4位数据rxd、他们的有效信号rxv，原封不动地通过txd和txv传给下位机。所以，要这样写transaction：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_transaction extends uvm_sequence_item;
    // 定义transaction类需要向DUT传递的信息，其中rand表示需要随机化的信息：
    rand bit [3:0] rxd;
    rand bit rxv;
    
    // 利用factory机制，到时可以自动生成transaction和自动进行随机化
    // 这里还涉及另一个叫field的机制，现在也先不解释
    \`uvm_object_utils_begin(my_transaction)
    	\`uvm_field_int(rxd, UVM_ALL_ON)
    	\`uvm_field_int(rxv, UVM_ALL_ON)
    \`uvm_object_utils_end
    
    // 约束条件。尽管本文的DUT选取得相当简单，但在更复杂的DUT中，不是所有输入都是符合规范的，
    // 所以需要添加一些约束条件，以限制随机的范围。并且，如果到了验证后期，随机化的部分做得差不多了，
    // 需要定向测试几个边缘条件时，也可以通过这个约束来直接进行定向测试。
    // 直接在transaction中定义的约束称为内部约束，它是可以被从外部改变的，这个后面再考虑。
    constraint Limit{
        // 先把rxd的值限制在一个范围内，rxv不做限制
        // 这样写，rxd会被限制在0到15之间。而这样做其实就相当于没限制，只是这边作为一个示例。
        rxd inside {[0:15]};
    }
    
    // 现在写一下构造函数。构造函数是每个类都需要写的。当这个类的对象被创建时，就需要调用这个构造函数。
    function new(string name = &quot;&quot;);
        super.new(name);
    endfunction
    
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>事实上，transaction虽然在验证平台中承担转运数据的功能，但它并不属于平台组件的一部分，它属于UVM验证平台中的object，而非component。这点在使用UVM的field机制时就能看出来，它使用的宏是\`uvm_object_utils_xxx而不是component。</p><p>这样，就完成了简易的transaction编写。</p>`,10);function d(o,r){return s(),a("div",null,[e(" more "),i("本文简述了事务级仿真以及transaction的部分编写规则，并使用一个简单的数据转发模块作为本文的DUT，内容与代码都仅供参考。 "),c])}const v=n(l,[["render",d],["__file","2.html.vue"]]);export{v as default};
