import{_ as i}from"./plugin-vue_export-helper-c27b6911.js";import{r as a,o as r,c as l,d,b as e,a as n,e as t,f as v}from"./app-4864bddc.js";const c="/backend-note/数字电路验证/EDAplayground.png",u="/backend-note/数字电路验证/EDAplayground_result.png",o={},m=v(`<h1 id="_5、environment类和testcase类的创建及仿真" tabindex="-1"><a class="header-anchor" href="#_5、environment类和testcase类的创建及仿真" aria-hidden="true">#</a> 5、environment类和testcase类的创建及仿真</h1><h2 id="_5-1-environment" tabindex="-1"><a class="header-anchor" href="#_5-1-environment" aria-hidden="true">#</a> 5.1 environment</h2><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_env extends uvm_env;
    \`uvm_component_utils(my_env)
    
    // 需要例化的模块，在这里声明
    // 因为没有和DUT的交互，所以现在只声明例化master agent
    my_agent i_agent;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
    endfunction
    
    virtual function void build_phase(uvm_phase phase);
        super.build_phase(phase);
        i_agent = my_agent::type_id::create(&quot;i_agent&quot;, this);
    endfunction
    
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_5-2-testcase" tabindex="-1"><a class="header-anchor" href="#_5-2-testcase" aria-hidden="true">#</a> 5.2 testcase</h2><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_test extends uvm_test;
    \`uvm_component_utils(my_test)
    
    my_env m_env;
    
    function new(string name = &quot;&quot;, uvm_component parent);
        super.new(name, parent);
    endfunction
    
    virtual function void build_phase(uvm_phase phase);
        super.build_phase(phase);
        m_env = my_env::type_id::create(&quot;m_env&quot;, this);
        // 选择需要启动的sequence，用config机制完成
        uvm_config_db#(uvm_object_wrapper)::set(
            this, &quot;*.m_seqr.run_phase&quot;, &quot;default_sequence&quot;, my_sequence::get_type()
        );
        
    endfunction
    
    // 可选项，打印整个验证平台的结构
    virtual function void start_of_simulation_phase(uvm_phase phase);
        super.start_of_simulation_phase(phase);
        uvm_top.print_topology(uvm_default_tree_printer);
    endfunction
    
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_5-3-仿真" tabindex="-1"><a class="header-anchor" href="#_5-3-仿真" aria-hidden="true">#</a> 5.3 仿真</h2><p>仿真首先需要创建一个program块。因为不涉及到interface，所以program块是可行的。如果需要用interface的话，还是得用module才行。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>program automatic test;
    import uvm_pkg::*;
    include &quot;uvm_macros.svh&quot;
    
    // include所有之前的文件
    
    
    // 启动仿真
    initial begin
        run_test(); 
    end
    
endprogram
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来，把前面每一段代码都按顺序复制粘贴到我在用的在线EDA工具EDAplayground里面：</p><figure><img src="`+c+`" alt="EDAplayground" tabindex="0" loading="lazy"><figcaption>EDAplayground</figcaption></figure><p>在左边选择UVM 1.1d，然后选择VCS作为仿真器，这里用的是VCS 2021。然后点击保存，把左边show output file after run点掉，再点run就可以成功运行了！</p><p>不过需要注意：</p><ol><li>这个平台会自动导入uvm_pkg和uvm_macros.svh，所以可以注释掉。</li><li>这个平台在启动仿真的run_test语句中需要填入启动的仿真testcase，这个testcase必须是一个component（我这里就是），所以可以把run_test()改成run_test(&quot;my_test&quot;)</li></ol><p>这样就可以正常仿真出结果了。</p><p>可以看到它的仿真命令：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>vcs <span class="token parameter variable">-licqueue</span> <span class="token string">&#39;-timescale=1ns/1ns&#39;</span> <span class="token string">&#39;+vcs+flush+all&#39;</span> <span class="token string">&#39;+warn=all&#39;</span> <span class="token string">&#39;-sverilog&#39;</span> +incdir+<span class="token variable">$UVM_HOME</span>/src <span class="token variable">$UVM_HOME</span>/src/uvm.sv <span class="token variable">$UVM_HOME</span>/src/dpi/uvm_dpi.cc <span class="token parameter variable">-CFLAGS</span> <span class="token parameter variable">-DVCS</span> design.sv testbench.sv  <span class="token operator">&amp;&amp;</span> ./simv +vcs+lic+wait 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这个以后会学到。</p><p>仿真结果：</p><figure><img src="`+u+'" alt="部分仿真结果" tabindex="0" loading="lazy"><figcaption>部分仿真结果</figcaption></figure><p>这样就仿真完毕。</p><h2 id="示例代码" tabindex="-1"><a class="header-anchor" href="#示例代码" aria-hidden="true">#</a> 示例代码</h2>',21),p={href:"https://www.edaplayground.com/x/nd4k",target:"_blank",rel:"noopener noreferrer"};function _(b,g){const s=a("ExternalLinkIcon");return r(),l("div",null,[d(" more "),e("environment是几乎涵盖所有验证平台核心组件的容器类，主要任务是配置一部分平台组件，并把它们实例化。testcase是包围environment的一个组件，目的是选择启动的sequence类型，以及完成一些配置。最后，需要在program块中启动仿真。==本章章内相关位置及末尾会给出查看示例代码的网站，文章末尾的网站仅为汇总。注意，这些示例代码可能会和内容展示的代码不太一样，因为这些代码是在这章写完后才编写的。代码内容仅供参考，可以随意转载，转载请带上作者博客链接。这些代码存在于EDAPlayground中。如果需要在线运行，需要注册。== "),m,n("p",null,[n("a",p,[e("基础平台演示"),t(s)])])])}const y=i(o,[["render",_],["__file","5.html.vue"]]);export{y as default};
