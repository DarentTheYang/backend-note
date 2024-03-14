import{_ as s}from"./plugin-vue_export-helper-c27b6911.js";import{r as d,o as r,c,d as v,b as n,a as e,e as a,f as l}from"./app-4864bddc.js";const u={},b=l('<h1 id="_8、uvm机制-三" tabindex="-1"><a class="header-anchor" href="#_8、uvm机制-三" aria-hidden="true">#</a> 8、UVM机制（三）</h1><h2 id="_8-1-callback机制" tabindex="-1"><a class="header-anchor" href="#_8-1-callback机制" aria-hidden="true">#</a> 8.1 callback机制</h2><h3 id="什么是callback机制" tabindex="-1"><a class="header-anchor" href="#什么是callback机制" aria-hidden="true">#</a> 什么是callback机制？</h3><p>callback机制是用来改变写好的driver等模块的行为的一种机制。</p><p>之前已经展示过了如何用override机制去改变行为，但它还有不足的地方。比如，需要在编写替换类的时候，override机制需要不断继承之前的类。如果工程比较大，那么不仅重写的代码量会很大，而且可能会出现继承关系混乱的问题。</p><p>例如，现在有一个模块验证需要改变driver的行为，选择override机制替换driver。在driver_A中需要注入错误A，在driver_B中需要注入另一种错误B，这两个相互独立的错误注入可以分别从my_driver中继承得来。而第三种情况driver_AB需要同时注入A和B这两种错误。那么，driver_AB到底需要从哪一方进行继承呢？仅仅是三种driver行为就会导致这种问题，那么当需要注入的错误或其他需要注入的行为大量增加且相互交叉时，复杂的关系网就会让仿真寸步难行。</p><p>而使用callback机制做到这点就不需要考虑这个问题。 callback机制通过替换组件中的某个功能，从而实现不同行为，不涉及平台组件的直接替换。</p><h3 id="callback机制的用法" tabindex="-1"><a class="header-anchor" href="#callback机制的用法" aria-hidden="true">#</a> callback机制的用法</h3>',8),m={href:"https://www.edaplayground.com/x/SC8B",target:"_blank",rel:"noopener noreferrer"},t=l(`<p>回调函数在一个对象内使用，但在另一个对象内定义。</p><p>使用callback机制之前，需要先将一个callback方法嵌入组件中，然后在一个<mark>callback类</mark>中，定义回调函数的功能。在组件执行到回调函数的方法时，仿真工具就会自动跳转到该接口指向的回调类中的回调函数，并执行。</p><p>顺序：</p><ol><li>将UVM callback方法内嵌入组件中</li><li>创建一个UVM callback类以供扩展</li><li>从上一步所创建的类扩展出所需的Callback类</li><li>在顶层实例化并注册callback对象</li></ol><h4 id="callback方法的定义与嵌入" tabindex="-1"><a class="header-anchor" href="#callback方法的定义与嵌入" aria-hidden="true">#</a> callback方法的定义与嵌入</h4><p>这里不选择注入错误，而仅仅让callback在某些地方打印几句内容，并打印driver将要驱动的transaction，表明callback的正确运行，且能够访问到transaction（也就是能够注入错误，但不注入）。</p><p>在my_driver中，需要先嵌入callback方法</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_driver extends uvm_driver#(my_transaction);
    // 省略重复的代码
    
    // 需要先指定嵌入的callback基类，这里的cb指的是callback，不是clocking block。
    \`uvm_register_cb(my_driver, driver_base_callback);
    
    // 省略未修改的内容
    
    virtual task run_phase(uvm_phase phase);
        forever begin
            // 这是调用回调函数的地方。这个回调函数需要在callback类中定义。
            // 三个参数的含义：
            // 第一个参数：my_driver是调用回调函数的类
            // 第二个参数：driver_base_callback是调用的回调函数的基类
            // 第三个参数：pre_send(this)是回调函数基类中的方法（函数或任务），这个参数就是具体在此处调用的方法。它带参数，而且参数需要是调用回调函数的类本身，因此填上this。
            \`uvm_do_callbacks(my_driver, driver_base_callback, pre_send(this));
            
            // 省略
            
            // 另一个回调函数，也需要在callback类。它仅用于打印信息，所以不需要输入
            \`uvm_do_callbacks(my_driver, driver_base_callback, post_send());
        end
    endtask
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="callback类与函数-任务的定义" tabindex="-1"><a class="header-anchor" href="#callback类与函数-任务的定义" aria-hidden="true">#</a> callback类与函数/任务的定义</h4><p>接下来创建一个callback的基类。这个<mark>基类仅仅定义了调用的类中所使用的方法原型，而不具体定义其实现</mark>。</p><p><mark>需要扩展基类以具体实现这些方法。</mark></p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// callback基类
class driver_base_callback extends uvm_callback;
    function new(string name=&quot;driver_base_callback&quot;);
        super.new(name);
    endfunction
    
    // 仅定义方法原型，而不定义其实现。
    // 需要有个输入，这个输入就是调用回调方法的类，比如这里是driver。如果仅仅只是打印一条和driver无关的信息，那么这个输入不要也行。
    virtual task pre_send(my_driver drv);
        
    endtask
    
    // 另一个方法同理，但因为这个方法仅仅只是打印信息，所以不需要输入也行。
    virtual task post_send();
        
    endtask
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// callback扩展类，扩展自driver_base_callback基类
class driver_error_callback extends driver_base_callback;
    // 重载构造函数
    function new(string name=&quot;driver_error_callback&quot;);
        super.new(name);
    endfunction
    
    // 在error分支中，仅重载pre_send方法
    virtual task pre_send(my_driver drv);
        \`uvm_info(&quot;DRV_CALLBACK&quot;, {&quot;\\n&quot;, &quot;Callback has reached transaction \\n&quot;, drv.req.sprint()}, UVM_MEDIUM)
    endtask
    
endclass

class driver_info_callback extends driver_base_callback;
    // 重载构造函数
    function new(string name=&quot;driver_info_callback&quot;);
        super.new(name);
    endfunction
    
    // 在info分支，仅重载post_send方法
    virtual task post_send();
        \`uvm_info(&quot;DRV_CALLBACK&quot;, &quot;callback prints infomation&quot;, UVM_MEDIUM)
    endtask
    
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="在组件中使用回调函数" tabindex="-1"><a class="header-anchor" href="#在组件中使用回调函数" aria-hidden="true">#</a> 在组件中使用回调函数</h4><p>在组件中使用回调函数，需要在my_test扩展类的connect_phase中指定driver使用的callback方法的每一个具体实现。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// 例如，此处我们要指定pre_send方法使用的是driver_error_callback中定义的实现，而post_send方法使用driver_info_callback中定义的实现。

// 注意，这里的my_test_driver_error是从my_test扩展而来的，需要在top文件中指定启动的测试是这个类，这样才能正常执行这些修改。

class my_test_driver_error extends my_test;
    // 这个扩展的test类也需要factory注册
    \`uvm_component_utils(my_test_driver_error)
    
    // 首先需要指定callback扩展类的句柄并例化
    driver_error_callback drv_err_cb;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
    endfunction
    
    virtual function void connect_phase(uvm_phase phase);
        super.connect_phase(phase);
        
        // 比较特殊的是，需要在connect_phase中例化callback扩展类
        drv_err_cb = new();
        
        // 在这里指定具体用来实现的类，即将其向driver注册。
        // uvm_callbacks是一个带参数的类，参数为嵌入callback的类和需要使用的callback类的基类。
        // 后面段add则是调用uvm_callbacks函数的静态函数，指定具体使用的对象和callback扩展类。
        uvm_callbacks#(my_driver, driver_base_callback)::add(m_env.i_agent.m_driv, drv_err_cb);
        
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于另一个post_send方法的实现，也是同样的。</p><p>同样，需要扩展my_test类，并在这个类中指定callback的实现</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_test_driver_info extends my_test;
    // 这个扩展的test类也需要factory注册
    \`uvm_component_utils(my_test_driver_info);
    
    // 声明callback扩展类的句柄
    driver_info_callback drv_info_cb;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
    endfunction
    
    // 在connect中例化并指定callback
    virtual function void connect_phase(uvm_phase phase);
        super.connect_phase(phase);
        
        drv_info_cb = new(&quot;drv_info_cb&quot;);
        
        uvm_callbacks#(my_driver, driver_base_callback)::add(m_env.i_agent.m_driv, drv_info_cb);
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-2-高级sequence机制" tabindex="-1"><a class="header-anchor" href="#_8-2-高级sequence机制" aria-hidden="true">#</a> 8.2 高级sequence机制</h2><h2 id="示例代码" tabindex="-1"><a class="header-anchor" href="#示例代码" aria-hidden="true">#</a> 示例代码</h2>`,21),o={href:"https://www.edaplayground.com/x/SC8B",target:"_blank",rel:"noopener noreferrer"};function _(k,p){const i=d("ExternalLinkIcon");return r(),c("div",null,[v(" more "),n("callback机制是用来改变组件行为的一种方法。和override类似的是，它可以修改组件中的一些行为，但不同点在于，override机制会将整个对象或者类替换掉，而且在编写替换类时，需要继承原来的类，这在大型模块验证时可能会造成继承关系混乱的问题。callback机制则是在编写组件代码时，先在相应组件中放入一个回调函数入口，然后通过编写此函数的行为、控制此函数的开关，去控制是否修改整个模块的行为是否改变、如何改变。==本章章内相关位置及末尾会给出查看示例代码的网站，文章末尾的网站仅为汇总。注意，这些示例代码可能会和内容展示的代码不太一样，因为这些代码是在这章写完后才编写的。代码内容仅供参考，可以随意转载，转载请带上作者博客链接。这些代码存在于EDAPlayground中。如果需要在线运行，需要注册。== "),b,e("p",null,[e("a",m,[n("演示：callback机制的用法"),a(i)])]),t,e("ol",null,[e("li",null,[e("a",o,[n("演示：callback机制的用法"),a(i)])])])])}const g=s(u,[["render",_],["__file","8.html.vue"]]);export{g as default};
