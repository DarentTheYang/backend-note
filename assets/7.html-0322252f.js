import{_ as d}from"./testbench_connect-a1422dd7.js";import{_ as a}from"./plugin-vue_export-helper-c27b6911.js";import{r as l,o as t,c as v,d as u,b as n,a as e,e as s,f as r}from"./app-4864bddc.js";const c="/backend-note/数字电路验证/testbench_FIFO.svg",m={},o=r(`<h1 id="_7、uvm机制-二" tabindex="-1"><a class="header-anchor" href="#_7、uvm机制-二" aria-hidden="true">#</a> 7、UVM机制（二）</h1><h2 id="_7-1-sequence机制" tabindex="-1"><a class="header-anchor" href="#_7-1-sequence机制" aria-hidden="true">#</a> 7.1 sequence机制</h2><p>控制和产生一系列的事务，并将事务发送给driver的一套机制。</p><h3 id="sequence机制的作用" tabindex="-1"><a class="header-anchor" href="#sequence机制的作用" aria-hidden="true">#</a> sequence机制的作用</h3><p>控制事务：控制何时产生事务、何时发送事务。</p><p>产生事务。</p><p>将事务发送给driver。</p><p><mark>sequence机制是会消耗仿真时间的，所以需要在task phase中使用，而不能在function phase中使用。</mark></p><h3 id="sequence机制工作过程" tabindex="-1"><a class="header-anchor" href="#sequence机制工作过程" aria-hidden="true">#</a> sequence机制工作过程</h3><ol><li>由driver向sequencer发送事务请求</li><li>sequencer将请求转发给关联的sequence</li><li>sequence将产生的transaction发送到sequencer</li><li>sequencer发送给driver</li><li>driver收到transaction并完成数据处理（例如用transaction驱动DUT，或者显示等）之后，产生完成的响应标志，发送给sequencer</li><li>sequencer将完成标志转发给sequence</li><li>sequence产生下一个事务，并等待下一个事务请求。</li></ol><h3 id="uvm使用sequence机制的原因" tabindex="-1"><a class="header-anchor" href="#uvm使用sequence机制的原因" aria-hidden="true">#</a> UVM使用sequence机制的原因</h3><ol><li>将事务的产生和驱动分离开来，提高验证平台的可重用性。例如，driver可以不再关注事务的产生，而专注于驱动DUT，修改驱动数据不需要直接修改driver，提高了driver的重用性。</li><li>通过挂载不同的sequence，平台就可以实现各种不同的验证数据的使用。</li></ol><h3 id="uvm-sequence机制的原理" tabindex="-1"><a class="header-anchor" href="#uvm-sequence机制的原理" aria-hidden="true">#</a> UVM sequence机制的原理</h3><p>原理基本上和工作过程一致，不过有几点要说明：</p><ol><li>driver和sequencer之间有一个fifo，这个fifo的输入从sequencer来，放入的是sequence产生的transaction。</li><li>sequencer得到driver的完成标志后，需要传给sequence表示完成。</li><li>无论如何，driver都不会直接和sequence通信，必须经过sequencer。</li><li>test中，需要配置default_sequence项目。如果没有定义default_sequence，UVM会去检查其他组件是否手动实例化了sequence并调用了它的start方法，如果没有，就说phase中没有sequence执行。</li></ol><h3 id="uvm-sequence机制实例" tabindex="-1"><a class="header-anchor" href="#uvm-sequence机制实例" aria-hidden="true">#</a> UVM sequence机制实例</h3><ol><li><p>driver中的相关代码</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_driver extends uvm_driver#(my_transaction);
    \`uvm_component_utils(my_driver)
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
    endfunction
    
    // driver的主要任务都是run_phase中完成的
    virtual task run_phase(uvm_phase phase);
        logic [7:0] temp;
        repeat(15)@(m_vif.driver_cb);
        
        // 重点在这里，这条语句就是向sequencer发送事务请求，这是一条阻塞语句。
        seq_item_port.get_next_item(req);
        
        // 完成后，调用这个语句表示给出事务已经处理完成
        seq_item_port.item_done();
    endtask
    
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>sequencer</p><p>sequencer的功能不简单，但它的处理方式非常重复，所以UVM已经把它封装在内部，不需要管里面的内容。FIFO等东西都有。下面这段就是之前的sequencer代码：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>typedef uvm_sequencer#(my_transaction) my_seqr
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>sequence</p></li></ol><p>sequence的主要功能在body方法中完成。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_sequence extends uvm_sequence#(my_transaction);
    \`uvm_object_utils(my_sequence)
    
    function new(string name=&quot;&quot;);
        super.new(name);
    endfunction
    
    virtual task body();
        repeat(15) begin
           // 用这个语句实现sequence机制，它包括产生事务、等待返回完成标志的动作。
            \`uvm_do(req)
        end
    endtask
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="分解uvm-do宏" tabindex="-1"><a class="header-anchor" href="#分解uvm-do宏" aria-hidden="true">#</a> 分解uvm_do宏</h3><p>uvm_do宏不止\`uvm_do一个，它是一个系列。整个系列能完成不同的功能。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>\`uvm_do(SEQ_OR_ITEM) // 这句不止可以产生transaction，也能产生sequence
\`uvm_do_with(SEQ_OR_ITEM, CONSTRAINTS)// 后面的constraint是约束，用于在transaction之外指定其随机化的范围。
\`uvm_do_on(SEQ_OR_ITEM, SEQR)// 为transaction或sequence指定其关联的sequencer
\`uvm_do_on_with(SEQ_OR_ITEM, SEQR, CONSTRAINTS)// 是以上两个宏的集合体
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先，根据传入类型决定要创建的是sequence还是transaction，然后为对象做设置，例如它对应的sequencer。然后需要考虑：</p><ol><li>如果传入的是transaction（即sequence_item类型）就要调用对象的start_item()语句，并随机化item。如果同时传入的还有约束，需要一起考虑。最后调用finish_item()。</li><li>如果传入的是sequence，则调用start()启动传入的sequence。</li></ol><h3 id="绕开uvm-do宏产生sequence-item" tabindex="-1"><a class="header-anchor" href="#绕开uvm-do宏产生sequence-item" aria-hidden="true">#</a> 绕开uvm_do宏产生sequence_item</h3>`,25),p={href:"https://www.edaplayground.com/x/BGvm",target:"_blank",rel:"noopener noreferrer"},_=r(`<p>在sequence代码中，不使用uvm_do宏，而是自己生成transaction也是可行的。只要根据上面的描述去定制产生过程就行。在sequence代码中的body任务中：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// 只列出关键代码
virtual task body();
    // 需要声明创建对象的句柄
    my_transaction tr;
    
    // 不再使用uvm_do宏
    // \`uvm_do(req)
    // 手动创建transaction对象，使用factory机制
    tr=my_transaction::type_id::create(&quot;tr&quot;);
    
    // 调用start_item方法并随机化，注意，start_item()是需要参数的，参数为产生对象的句柄
    start_item(tr);
    tr.randomize();
    
    // 结束产生
    finish_item(tr);
endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>尽管可以自己去创建sequence_item对象，也就是transaction，但通常情况下直接根据需要直接用uvm_do宏完成就行。</p><h3 id="启动sequence的方法" tabindex="-1"><a class="header-anchor" href="#启动sequence的方法" aria-hidden="true">#</a> 启动sequence的方法</h3><h4 id="在sequencer中自动启用" tabindex="-1"><a class="header-anchor" href="#在sequencer中自动启用" aria-hidden="true">#</a> 在sequencer中自动启用</h4><p>如果用uvm_do宏，那么只要配置sequencer中的default_sequence，sequencer就会自动调用sequence的start()方法。</p><p>在test中有这样一段语句：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_config_db#(uvm_object_wrapper)::set(
    this, &quot;*.m_seqr.run_phase&quot;, &quot;default_sequence&quot;, my_sequence::get_type()
);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这就是在test中指定default_sequence。</p><h4 id="用其他平台组件手动启动sequence" tabindex="-1"><a class="header-anchor" href="#用其他平台组件手动启动sequence" aria-hidden="true">#</a> 用其他平台组件手动启动sequence</h4>`,10),b={href:"https://www.edaplayground.com/x/Wm37",target:"_blank",rel:"noopener noreferrer"},g=r(`<p>例如这里选择在test中启动sequence，这里忽略和以前相同的代码。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_test extends uvm_test;
    // 在run_phase中手动启动sequence
    virtual task run_phase(uvm_phase phase);
        // 声明句柄并用factory机制实例化sequence，注意不是sequencer。sequence是一个object，所以不需要传入父对象
        my_sequence m_seq;
        m_seq = my_sequencer::type_id::create(&quot;m_seq&quot;);
        // 因为这里只展示了一个run_phase，所以加上这句
        phase.raise_objection(this);
        // 启动时，需要为这个sequence绑定关联的sequencer。
        m_seq.start(m_env.m_agent.m_seqr);
        phase.drop_objection(this);
    endtask
    
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第二种方法能对sequence进行更精确的控制，是工程中更常用的方法。</p><h3 id="sequence的嵌套" tabindex="-1"><a class="header-anchor" href="#sequence的嵌套" aria-hidden="true">#</a> sequence的嵌套</h3><p>一个sequence是可以包含多个子sequence的，其实从uvm_do_on这个宏可以传入的参数中就可以看出来。</p><p>假设现在有三个sequence需要启动，包括：</p><ol><li>用于重置的reset_sequence，其句柄为t_seq</li><li>用于写的write_sequence，句柄为w_seq</li><li>用于读的read_sequence，句柄为r_seq</li></ol><p>那么，创建一个顶层sequence类，命名为top_sequence，使用uvm_do启动这三个子sequence</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// 在top_sequence中先声明句柄
reset_sequence t_seq;
write_sequence w_seq;
read_sequence r_seq;

// 在top_sequence的body中
virtual task body();
    \`uvm_do(t_seq)
    \`uvm_do(w_seq)
    \`uvm_do(r_seq)
endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="sequence仲裁" tabindex="-1"><a class="header-anchor" href="#sequence仲裁" aria-hidden="true">#</a> sequence仲裁</h3><p>一个sequencer同一时刻只能接收一个sequence发送的transaction。如果同时启动了多个sequence，则需要仲裁机制。</p><p>UVM提供了一些宏，为每一个sequence指定优先级。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>\`uvm_do_pri(SEQ_OR_ITEM, PRIORITY)
\`uvm_do_pri_with(SEQ_OR_ITEM, PRIORITY, CONSTRAINTS)
\`uvm_do_on_pri(SEQ_OR_ITEM, SEQR, PRIORITY)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如何同时启动多个sequence？只要在top_sequence的body里，用fork join语句包围需要同时启动的uvm_do就行。但在这之前，一定要先指定仲裁算法：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// top_sequence的body
virtual task body();
    // 这里的仲裁算法是权重算法，权重高的sequence优先执行。
    //如果权重相同，则按代码顺序执行。如果不写权重，权重默认是100。
    // 仲裁算法是对关联的sequencer的设置。
    m_sequencer.set_arbitration(SEQ_ARB_STRICT_FIFO)
    fork
        \`uvm_do_pri(t_seq, 1000)
        \`uvm_do_pri(w_seq, 50)
        \`uvm_do_pri(r_seq) // 不写默认是100
    join
    
endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了这里的SEQ_ARB_STRICT_FIFO之外还有些其他的算法：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// 默认仲裁算法，优先执行先获得的sequence，忽略权重
SEQ_ARB_FIFO

// 优先执行高权重的
SEQ_ARB_WEIGHTED

// 随机执行sequence
SEQ_ARB_RANDOM

// 先按照权重值分类，优先执行高权重的sequence，也就是上面代码用的算法
SEQ_ARB_STRICT_FIFO

// 先按照权重值分类，具有高优先级的sequence随机执行
SEQ_ARB_STRICT_RANDOM

// 自定义仲裁算法。这需要用户扩展uvm_sequencer并重载user_priority_arbitration()方法。
SEQ_ARB_USER
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实际应用里，需要并行执行sequence的情况不多。</p><p><mark>如果每个sequence各对应一个sequencer，而不是用一个sequencer管理多个sequence的时候，就不需要仲裁。</mark></p><h3 id="sequence获取响应" tabindex="-1"><a class="header-anchor" href="#sequence获取响应" aria-hidden="true">#</a> sequence获取响应</h3><p>如果打算把driver的返回响应保存到本地或是其他操作，可以用sequence响应方法获取。</p><p>driver处理完事务后，不会立即给sequencer发送完成标志，而是先发送一个响应，这个响应会先被转发给sequence。注意，<mark>完成标志和响应是两种不同的东西</mark>。</p><h4 id="sequence中的代码增加" tabindex="-1"><a class="header-anchor" href="#sequence中的代码增加" aria-hidden="true">#</a> sequence中的代码增加</h4><p>在调用完finish_item(tr);后，只需要添加上get_response(rsp);</p><p>就可以获取响应了。</p><p>通过rsp句柄引用返回的响应，打印一下看看</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>virtual task body();
    
    
    get_response(rsp);
    \`uvm_info(&quot;SEQ&quot;, {&quot;\\n&quot;, &quot;Sequence get the response:\\n&quot;, rsp.sprint(), }, UVM_MEDIUM)
    
endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="driver的行为改变" tabindex="-1"><a class="header-anchor" href="#driver的行为改变" aria-hidden="true">#</a> driver的行为改变</h4><p>在完成驱动或其他什么事情之后，给sequencer发送完成标志之前，需要产生响应，所以代码就放在两者之间。</p><p>在driver的主要行为块run_phase中：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>virtual task run_phase(uvm_phase phase);
    // 声明响应的句柄
    my_transaction rsp;
    
    //其他代码
    
    // 获取事务句柄
    seq_item_port.get_next_item(req);
    
    // 用factory例化，并产生响应
    rsp = my_transaction::type_id::create(&quot;rsp&quot;);
    $cast(rsp, req.clone());
    
    // 将响应与对应事务相关联。响应和事务应该一一对应。
    rsp.set_id_info(req);
    
    // 发送响应
    seq_item_port.put_response(rsp);
    
    // 返回完成标志
    seq_item_port.item_done();

endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-tlm-1-0机制" tabindex="-1"><a class="header-anchor" href="#_7-2-tlm-1-0机制" aria-hidden="true">#</a> 7.2 TLM 1.0机制</h2><h3 id="什么是tlm机制" tabindex="-1"><a class="header-anchor" href="#什么是tlm机制" aria-hidden="true">#</a> 什么是TLM机制</h3><p>Transaction Level Modeling，缩写为TLM，这是事务级模型的英文全称。这里再展示一次组件之间的连接图，可以看到有analysis port和port等端口，这些组件之间的端口就是TLM端口。</p><figure><img src="`+d+`" alt="UVM平台结构（已连接）" tabindex="0" loading="lazy"><figcaption>UVM平台结构（已连接）</figcaption></figure><p>这里需要说明的是，driver和sequencer之间的通信虽然没有表明，但也是用TLM实现的。</p><h3 id="为什么要使用tlm机制" tabindex="-1"><a class="header-anchor" href="#为什么要使用tlm机制" aria-hidden="true">#</a> 为什么要使用TLM机制</h3><p>建立专门的通信信道，避免通信出现混乱。各个通信信道之间是相互独立的。</p><p>有些语言需要通过全局变量实现模块间的通信，这很容易出问题。</p><p>SystemVerilog自带的通信方法有mailbox（信箱）、semaphore（旗语）、event（事件）这几种。但它们的数量多起来，或者出现冲突的时候，需要有效地管理才不会乱。</p><h3 id="uvm-tlm机制原理" tabindex="-1"><a class="header-anchor" href="#uvm-tlm机制原理" aria-hidden="true">#</a> UVM TLM机制原理</h3><h4 id="_1-端对端" tabindex="-1"><a class="header-anchor" href="#_1-端对端" aria-hidden="true">#</a> 1. 端对端</h4><p>这种情况下， 平台组件分为producer和consumer。</p><p>producer需要创建一个port类型的端口，consumer需要创建一个import类型的端口，数据将会从port端口传向import端口。</p><p><mark>在TLM中，port总是通信的主动发起方，import总是接收方。</mark></p><h5 id="put模式-发送模式-把port端口定义在producer那边" tabindex="-1"><a class="header-anchor" href="#put模式-发送模式-把port端口定义在producer那边" aria-hidden="true">#</a> put模式/发送模式：把port端口定义在producer那边</h5><p>由带有port的producer主动发起发送行为。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// producer中需要发送，tx表示需要发送的数据的句柄，一般是transaction的对象。
// 但其实这个put任务是在consumer中定义的，而不是producer中。
port.put(tx);

// consumer中需要定义put任务，这是个用户定义的任务。
task put(tx);
    xxx
endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>producer中调用put时，调用的其实是consumer中的put任务。</p><h5 id="get模式-获取模式-把port定义在consumer一方" tabindex="-1"><a class="header-anchor" href="#get模式-获取模式-把port定义在consumer一方" aria-hidden="true">#</a> get模式/获取模式：把port定义在consumer一方</h5><p>由带有port的consumer主动发起发送。这种情况下， producer产生事务后，不会主动发送数据给consumer，而是等待consumer发起请求。</p><p>和put模式相反，consumer中的get任务是在producer中定义的。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// consumer中
port.get(tx);

// producer中
task get(tx);
    xxx
endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>consumer中调用get时，调用的其实是producer中的get任务。</p><p>这两种通信模式都有一个特点：port的所属方其实不知道对方的工作情况：</p><p>在put模式下，producer向consumer发送事务时，并不知道consumer是否正在请求数据。</p><p>在get模式下，consumer向producer请求事务时，并不知道producer是否已经产生了数据。</p><h5 id="fifo模式-在producer和consumer中间加入fifo作为缓冲" tabindex="-1"><a class="header-anchor" href="#fifo模式-在producer和consumer中间加入fifo作为缓冲" aria-hidden="true">#</a> FIFO模式：在producer和consumer中间加入FIFO作为缓冲</h5><p>这样，producer和consumer都成了主动方，也能解决get模式和put模式互不知情的问题。而FIFO则为被动方。</p><p>在producer中使用的put任务和在consumer中使用的get任务都在FIFO里定义就行。</p><h4 id="_2-一对多-write模式" tabindex="-1"><a class="header-anchor" href="#_2-一对多-write模式" aria-hidden="true">#</a> 2. 一对多（write模式）</h4><p>由一个producer产生事务，发送给多个consumer。这种情况下，只能由producer主动发起事务发送，发送端口要使用analysis_port，而不是简单的port；在接收端，需要analysis_import。</p><p>发送时，由producer调用write任务，把事务发送给各个consumer。而这个write任务是定义在各个consumer中的。这个write任务需要用户自己定义。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// 在producer中
analysis_port.write(tx)

// 在consumer中
task write(tx);
    xxx
endtask
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="常用的tlm端口" tabindex="-1"><a class="header-anchor" href="#常用的tlm端口" aria-hidden="true">#</a> 常用的TLM端口</h3><p>常用的TLM端口有三种：port、import、export</p><h4 id="port" tabindex="-1"><a class="header-anchor" href="#port" aria-hidden="true">#</a> port</h4><p>port也分为几种：uvm_put_port、uvm_blocking_put_port、uvm_nonblocking_put_port、uvm_get_port、uvm_blocking_get_port、uvm_nonblocking_get_port。</p><ol><li>uvm_put_port需要用到的语句：</li></ol><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_put_port #(T); // 需要传入port传输的的transaction类型
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>与它相关联的任务/函数有三个：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// put是一个任务，它会阻塞并等待事务传输成功。
put()

// try_put是一个函数，它不阻塞进程，不论传输成功与否都会直接返回
try_put()

// can_put是一个函数，不用于数据传输，而是用来查看接收方是否准备好接收事务
can_put()
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>uvm_blocking_put_port的语句：</li></ol><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_blocking_put_port #(T);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>和uvm_put_port不同，uvm_blocking_put_port只支持put任务，就是会阻塞等待的那个任务。</p><ol start="3"><li>uvm_nonblocking_put_port的语句：</li></ol><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_nonblocking_put_port #(T);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>和uvm_blocking_put_port正好相反，只支持不会阻塞的两个函数，即try_put和can_put</p><ol start="4"><li>uvm_get_port语句</li></ol><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_get_port #(T)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>与之关联的有三个语句，和put是非常类似的，功能也对应。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// get是一个任务，调用时会阻塞，直到传输成功
get()

// try_get是一个函数，不阻塞进程，不论传输是否成功都会立即返回
try_get()

// can_get是一个函数，仅用于确认是否可以传输
can_get() 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="5"><li>uvm_blocking_get_port语句</li></ol><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_blocking_get_port#(T);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>仅能使用get()这个阻塞语句。</p><ol start="6"><li>uvm_nonblocking_get_port语句</li></ol><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_nonblocking_get_port#(T);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>仅能使用try_get()和can_get()这些非阻塞语句。</p><p>六个任务或函数都需要用户重载后才能使用，否则会出错。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>put();
try_put();
can_put();

get();
try_get();
can_get();
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="import" tabindex="-1"><a class="header-anchor" href="#import" aria-hidden="true">#</a> import</h4><p>要完成TLM之间的通信，port必须与对应的import相连，下表是port和import的对应关系。另外需要说明：每一个port必须对应一个import。</p><table><thead><tr><th>port</th><th>import</th></tr></thead><tbody><tr><td>uvm_put_port#(T);</td><td>uvm_put_imp#(T, IMP);</td></tr><tr><td>uvm_blocking_put_port#(T);</td><td>uvm_blocking_put_imp#(T, IMP);</td></tr><tr><td>uvm_nonblocking_put_port#(T);</td><td>uvm_nonblocking_put_imp#(T, IMP);</td></tr><tr><td>uvm_get_port#(T);</td><td>uvm_get_imp#(T, IMP);</td></tr><tr><td>uvm_blocking_get_port#(T);</td><td>uvm_blocking_get_imp#(T, IMP);</td></tr><tr><td>uvm_nonblocking_get_port#(T);</td><td>uvm_nonblocking_get_imp#(T, IMP);</td></tr></tbody></table><p>相比port而言，import多了一个名为IMP的参数。这个参数是指import所在组件的指针。而put、try_put、can_put等任务、函数也需要在这个组件中重载。这些方法虽然在port中调用，但定义是在import中实现的。</p><p>task put、try_put等方法的源码：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>virtual task put(input T t);
    \`uvm_report_error(&quot;put&quot;, \`UVM_TASK_ERROR, UVM_NONE)
endtask

// 返回一个1位的值来表示是否传输成功
virtual function bit try_put(input T t);
    \`uvm_report_error(&quot;try_put&quot;, \`UVM_TASK_ERROR, UVM_NONE);
    return 0;
endfunction

// 无参数，不能传递信息，返回一个1位的值，表示目标组件是否可以接收数据
virtual function bit can_put();
    \`uvm_report_error(&quot;can_put&quot;, \`UVM_TASK_ERROR, UVM_NONE);
    return 0;
endfunction


virtual task get(output T t);
    \`uvm_report_error(&quot;get&quot;, \`UVM_TASK_ERROR, UVM_NONE)
endtask

virtual function bit try_get(output T t);
    \`uvm_report_error(&quot;try_get&quot;, \`UVM_TASK_ERROR, UVM_NONE);
    return 0;
endfunction

virtual function bit can_get();
    \`uvm_report_error(&quot;can_get&quot;, \`UVM_TASK_ERROR, UVM_NONE);
    return 0;
endfunction
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果不重载直接调用，不论调用哪个，显然会直接报错，而且只会报错。</p><h4 id="export" tabindex="-1"><a class="header-anchor" href="#export" aria-hidden="true">#</a> export</h4><p>和port的功能、用法其实是一样的。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>uvm_put_export#(T);
uvm_blocking_put_export#(T);
uvm_nonblocking_put_export#(T);

uvm_get_export#(T);
uvm_blocking_get_export#(T);
uvm_nonblocking_get_export#(T);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一般用于中间组件。</p><h4 id="组件连接" tabindex="-1"><a class="header-anchor" href="#组件连接" aria-hidden="true">#</a> 组件连接</h4><p>组件A和组件B的直接连接：</p><p>组件A中有port端口，组件B为import端口，连接起两个端口只需要语句：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>port.connect(imp);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>组件A、组件B中间有一个中间组件，即组件C的情况：</p><p>A组件有port端口、组件B有import端口，组件C有export端口。</p><p>要将A端口的port与export连接起来：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>port.connect(export);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>将B端口的import与export连接：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>export.connect(imp);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>在sequencer的源码中就有这样一个TLM通信端口，名字正是seq_item_export。在之前的driver代码中可以看到，driver调用了seq_item_port端口的方法get_next_item，以及item_done()方法。前面也说到，driver和seqencer之间正是由TLM通信连接的。在agent的connect_phase中，需要把它们连接起来，当时用的代码如下：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>virtual function void connect_phase(uvm_phase phase);
    if(UVM_IS_ACTIVE)
        // 如果是active模式，就要这条连接
        m_driv.seq_item_port.connect(m_seqr.seq_item_export);
endfunction
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="几种tlm端口的使用" tabindex="-1"><a class="header-anchor" href="#几种tlm端口的使用" aria-hidden="true">#</a> 几种TLM端口的使用</h3><h4 id="put模式" tabindex="-1"><a class="header-anchor" href="#put模式" aria-hidden="true">#</a> put模式</h4><p>根据put、get和fifo模式去决定要用哪种端口比较合适。</p>`,116),h={href:"https://www.edaplayground.com/x/hcgG",target:"_blank",rel:"noopener noreferrer"},q=r(`<p>这里先说put模式。如上文所说，put模式下，由producer主动发起一次数据传输，交给consumer。这里以master agent中的monitor发送数据给reference model为例。因为需要跨过一个master agent，所以不论如何都要在master agent中定义一个export，作为中转端口。当然，也可以用接口传递的方式，monitor里的端口发送给agent，然后连接到reference model上，而不是连接到agent上，再通过agent发送出去。这里采用前者。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// reference model和其他组件不同，需要直接从uvm_component扩展。
class my_reference_model extends uvm_component; 
    \`uvm_component_utils(my_reference_model)
    
    // 定义一个端口，指定传输事务的类型和import所在的类
    uvm_blocking_put_imp #(my_transaction, my_reference_model) i_m2r_imp;
    
    // 在构造函数中，实例化端口
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
        // 第二个参数是该接口所在的组件，这里肯定是写this
        this.i_m2r_imp = new(&quot;i_m2r_imp&quot;, this);
    endfunction

    // 重载put任务，put模式需要在consumer中重载，这里重载为调用put后只是打印一下transaction。
    // 根据这个task的参数，可以用tr为句柄，引用发送过来的事务。
    // 这个put会在producer中被调用，也就是Monitor。
    // 注意，它并不是一个虚方法。
    task put(my_transaction tr);
        \`uvm_info(&quot;REF_REPORT&quot;, {&quot;\\n&quot;, &quot;master agent have been sent a transaction: \\n&quot;, tr.sprint()}, UVM_MEDIUM)
    endtask
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_monitor extends uvm_monitor;
    \`uvm_component_utils(my_monitor)
    
    // 定义一个端口
    uvm_blocking_put_port #(my_transaction) m2r_port;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
        // 在这里初始化
        m2r_port = new(&quot;m2r_port&quot;, this);
    endfunction
    
    virtual task run_phase(uvm_phase phase);
        // 前面一段代码需要先获取DUT端口上的数据，打包成tr对象，这里先省略。
        
        \`uvm_info(&quot;Monitor&quot;, &quot;Now monitor send the transaction to the reference model!&quot;, UVM_MEDIUM)
        // put在monitor里调用，把打包好的tr发送给reference model。
        this.m2r_port.put(tr);
        
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>// monitor和reference中间还隔着一层agent，所以需要定义一个export作为中转。当然，也可以不定义，用其他方法。这里采用定义export的方法。
class master_agent extends uvm_agent;
    \`uvm_component_utils(master_agent)
    
    // export端口定义
    uvm_blocking_put_export #(my_transaction) m_a2r_export;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
        a2r_export = new(&quot;m_a2r_export&quot;, this);
    endfunction
    
    // 在connect里连接
    virtual function void connect_phase(uvm_phase phase);
        super.connect_phase(phase);
        // 必须由port来发起这次连接。此处是agent，所以找到本实例中的monitor对象就可以发起连接。
        m_moni.m2r_port.connect(this.m_a2r_export);
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在env中，需要实例化reference model，同样是用factory机制。</p><p>并且，需要在env中完成export和import的连接。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_env extends uvm_env;
    \`uvm_component_utils(my_env)
    
    // 声明reference句柄
    my_reference_model ref_model;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
    endfunction
    
    virtual function void build_phase(uvm_phase phase);
        super.build_phase(phase);
        ref_model = my_reference_model::type_id::create(&quot;ref_model&quot;, this);
    endfunction
    
    // 同样要在connect_phase里完成连接
    virtual function void connect_phase(uvm_phase phase);
        super.connect_phase(phase);
        // import是被动接收方，所以需要由export来主动发起连接请求
        m_agent.m_a2r_export.connect(ref_model.i_m2r_imp);
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="get模式" tabindex="-1"><a class="header-anchor" href="#get模式" aria-hidden="true">#</a> get模式</h4><p>和put模式不同，get模式由consumer主动发起数据请求。而producer不知道何时会发来请求，所以需要在producer中创建一个数组作为FIFO，暂存数据。这个FIFO不能算作是FIFO模式的标志。</p><p><strong>get模式与put模式比较重复，所以不再演示，但后文将会演示FIFO模式。</strong></p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_reference_model extends uvm_component;
    \`uvm_component_utils(my_reference_model)
    
    // 声明port端口
    uvm_blocking_get_port #(my_transaction) i_m2r_port;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
        // 在构造函数里例化端口。
        // 提问：这里为什么要强调this？
        this.i_m2r_port = new(&quot;i_m2r_port&quot;, this);
    endfunction
    
    // 作为主动发起方，reference需要不断调用get任务，用forever循环实现
    virtual function void run_phase(uvm_phase phase);
        \`uvm_info(&quot;REF_MODEL_RUN&quot;, &quot;Reference model running!&quot;, UVM_MEDIUM)
        // forever循环
        forever begin
            i_m2r_port.get(item); 
            \`uvm_info(&quot;REF_REPORT&quot;, {&quot;\\n&quot;, &quot;master agent have been sent a transaction: \\n&quot;, item.sprint()}, UVM_MEDIUM)
        end
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_monitor extends uvm_monitor;
    \`uvm_component_utils(my_monitor)
    
    // 声明import端口，import端口需要声明所在的组件
    uvm_blocking_get_imp #(my_transaction, my_monitor) m2r_imp;
    
    // 需要声明一个队列作为FIFO，储存生成后未被使用的事务，类型就是my_transaction
    my_transaction tr_fifo[$];
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.name(name, parent);
        m2r_imp = new(&quot;m2r_imp&quot;, this);
    endfunction
    
    virtual task run_phase(uvm_phase phase);
        // 前面加入其他的任务
        
        // 从DUT读出事务后，把数据打包，然后放入fifo中
        tr_fifo.push_back(tr);
    endtask
    
    // import所在的模块需要重载get方法，它会在port所在的组件中被调用。
    // 注意，它并不是一个虚方法。
    task get(output my_transaction s_tr);
        // 如果FIFO为空，等待一个时钟周期，反复等待直到FIFO中存在事务
        while(tr_fifo.size()==0) @(m_vif.imonitor_cb);
        // 把FIFO最靠前的事务取出
        s_tr = tr_fifo.pop_front();
        \`uvm_info(&quot;Monitor&quot;, {&quot;\\n&quot;, &quot;Now monitor send the transaction to the reference model: \\n&quot;, s_tr.sprint()}, UVM_MEDIUM)
    endtask
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class master_agent extends uvm_agent;
    \`uvm_component_utils(master_agent)
    
    // 声明中转的export端口，这个export在env中和reference连接，
    // 和monitor的连接就在本类中进行。
    uvm_blocking_get_export #(my_transaction) m_a2r_export;
    
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
        m_a2r_export = new(&quot;m_a2r_export&quot;, this);
    endfunction
    
    virtual function void build_phase(uvm_phase phase);
        super.build_phase(phase);
        ref_model = my_reference_model::type_id::create(&quot;ref_model&quot;, this);
    endfunction
    
    virtual function void connect_phase(uvm_phase phase);
        super.connect_phase(phase);
        
        this.m_a2r_export.connect(m_moni.m2r_imp);
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_env extends uvm_env;
    \`uvm_component_utils(my_env)
    
    my_reference_model ref_model;
    my_agent m_agent;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
    endfunction
    
    virtual function void build_phase(uvm_phase phase);
        super.build_phase(phase);
        ref_model = my_reference_model::type_id::create(&quot;ref_model&quot;, this);
        m_agent = my_agent::type_id::create(&quot;ref_model&quot;, this);
    endfunction
    
    virtual function void connect_phase(uvm_phase phase);
        super.connect_phase(phase);
        ref_model.i_m2r_port.connect(m_agent.m_a2r_export);
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="fifo模式" tabindex="-1"><a class="header-anchor" href="#fifo模式" aria-hidden="true">#</a> FIFO模式</h4>`,15),f={href:"https://www.edaplayground.com/x/WzQN",target:"_blank",rel:"noopener noreferrer"},y=r('<p>FIFO模式会让monitor和reference model都变成主动发起数据传输方，而把FIFO本身作为被动方。所以，在monitor和reference model上都是用port。不同的是，monitor上用的是put port，reference model上用的是get port。</p><figure><img src="'+c+`" alt="FIFO模式连接图" tabindex="0" loading="lazy"><figcaption>FIFO模式连接图</figcaption></figure><p>这里用到的FIFO已经在UVM中定义好了，不需要自己定义。类似于sequencer已经在UVM中定义好了那样。只需要传入数据类型作为参数就可以。</p><p>同时，FIFO中也已经定义了多种端口，只需要直接连接就行。这里用到的是FIFO上的blocking put export和blocking get export。</p><p>至于get和put方法，也是已经定义好的。使用FIFO模式就有这些好处，很多东西不需要自己写，开箱即用。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class reference_model extends uvm_component;
    \`uvm_component_utils(reference_model)
    
    // reference model需要get port
    uvm_blocking_get_port #(my_transaction) i_m2r_port;
    // 用item句柄储存发送来的事务
    my_transaction item;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
        this.i_m2r_port = new(&quot;i_m2r_port&quot;, this);
    endfunction
    
    virtual task run_phase(uvm_phase phase);
        \`uvm_info(&quot;REF_REPORT&quot;, {&quot;\\n&quot;, &quot;master agent have been sent a transaction: \\n&quot;, item.sprint()}, UVM_MEDIUM)
        // 不断调用get任务
        forever begin
            i_m2r_port.get(item); 
            \`uvm_info(&quot;REF_REPORT&quot;, {&quot;\\n&quot;, &quot;master agent have been sent a transaction: \\n&quot;, item.sprint()}, UVM_MEDIUM)
        end
    endtask
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>env中，需要添加FIFO。这个FIFO和agent、reference model平级。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_env extends uvm_env;
    \`uvm_component_utils(my_env)
    
    my_reference_model ref_model;
    master_agent m_agent;
    
    // 声明FIFO句柄，并指定存储数据的类型
    uvm_tlm_analysis_fifo #(my_transaction) magt2ref_fifo;
    
    function new(string name=&quot;&quot;, uvm_component parent);
        super.new(name, parent);
        // FIFO需要在构造函数中实例化，而不是build phase。
        // FIFO本身是一个component，而不是object，所以需要传入父对象的类，这里写this就可以
        magt2ref_fifo = new(&quot;magt2ref_fifo&quot;, this);
    endfunction
    
    virtual function void build_phase(uvm_phase phase);
        super.build_phase(phase);
        ref_model = my_reference_model::type_id::create(&quot;ref_model&quot;, this);
        m_agent = master_agent::type_id::create(&quot;m_agent&quot;, this);
    endfunction
    
    virtual function void connect_phase(uvm_phase phase);
        super.connect_phase(phase);
        // 在connect phase中连接agent和FIFO、reference和FIFO。FIFO所拥有的端口类型是已经写好的。
        \`super.connect_phase(phase);
        
        // monitor还是需要通过agent传出事务来，所以保留agent中的export，将它连接到FIFO的export上。
        \`uvm_info(&quot;ENV&quot;, &quot;Connect the agent to FIFO&quot;, UVM_MEDIUM)
        m_agent.m_a2r_export.connect(this.magt2ref.blocking_put_export);

        \`uvm_info(&quot;ENV&quot;, &quot;Connect the reference model to FIFO&quot;)
        ref_model.i_m2r_port.connect(this.magt2ref.blocking_get_export);
    endfunction
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="常用的特殊uvm-tlm端口" tabindex="-1"><a class="header-anchor" href="#常用的特殊uvm-tlm端口" aria-hidden="true">#</a> 常用的特殊UVM TLM端口</h3><h2 id="示例代码" tabindex="-1"><a class="header-anchor" href="#示例代码" aria-hidden="true">#</a> 示例代码</h2>`,10),x={href:"https://www.edaplayground.com/x/BGvm",target:"_blank",rel:"noopener noreferrer"},k={href:"https://www.edaplayground.com/x/Wm37",target:"_blank",rel:"noopener noreferrer"},M={href:"https://www.edaplayground.com/x/hcgG",target:"_blank",rel:"noopener noreferrer"},T={href:"https://www.edaplayground.com/x/WzQN",target:"_blank",rel:"noopener noreferrer"},F=e("p",null,[e("strong",null,"持续更新中")],-1);function I(w,O){const i=l("ExternalLinkIcon");return t(),v("div",null,[u(" more "),n("UVM平台的机制是为了方便用户，所以机制本身的原理会比较复杂，对验证工程师来说可以算是透明的。验证工程师只要会用就行。但是，大致了解机制本身其实有助于弄清楚问题所在，特别是出BUG的时候。这章介绍UVM的sequence机制和TLM机制。sequence机制在很多教程中都分一般用法和高级用法， 这里也把一般用法和高级用法分开。TLM1.0则是UVM组件间最重要的通信方法。它可以用在monitor和reference_model之间，或者reference_model和scoreboard之间，或者monitor和scoreboard之间。和configuration机制不同，TLM是为了在组件间以某种通信协议传递仿真数据（一般是事务），而configuration是为了配置仿真平台。==本章章内相关位置及末尾会给出查看示例代码的网站，文章末尾的网站仅为汇总。注意，这些示例代码可能会和内容展示的代码不太一样，因为这些代码是在这章写完后才编写的。代码内容仅供参考，可以随意转载，转载请带上作者博客链接。这些代码存在于EDAPlayground中。如果需要在线运行，需要注册。== "),o,e("p",null,[e("a",p,[n("演示：绕开uvm_do宏产生sequence_item"),s(i)])]),_,e("p",null,[e("a",b,[n("演示：从其他平台组件手动启动sequence"),s(i)])]),g,e("p",null,[e("a",h,[n("演示：TLM put模式"),s(i)])]),q,e("p",null,[e("a",f,[n("演示：TLM FIFO模式"),s(i)])]),y,e("ol",null,[e("li",null,[e("a",x,[n("演示：绕开uvm_do宏产生sequence_item"),s(i)])]),e("li",null,[e("a",k,[n("演示：从其他平台组件手动启动sequence"),s(i)])]),e("li",null,[e("a",M,[n("演示：TLM put模式"),s(i)])]),e("li",null,[e("a",T,[n("演示：TLM FIFO模式"),s(i)])])]),F])}const V=a(m,[["render",I],["__file","7.html.vue"]]);export{V as default};
