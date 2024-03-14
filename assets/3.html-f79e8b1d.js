import{_ as e}from"./plugin-vue_export-helper-c27b6911.js";import{o as n,c as s,d as i,b as r,f as a}from"./app-4864bddc.js";const c={},d=a(`<h1 id="_3、sequence与sequencer的任务" tabindex="-1"><a class="header-anchor" href="#_3、sequence与sequencer的任务" aria-hidden="true">#</a> 3、sequence与sequencer的任务</h1><h2 id="_3-1-sequence的任务和代码" tabindex="-1"><a class="header-anchor" href="#_3-1-sequence的任务和代码" aria-hidden="true">#</a> 3.1 sequence的任务和代码</h2><p>sequence的任务，主要是根据sequencer传来的请求数据信号，产生transaction数据并发送给sequencer。sequencer，然后再由sequencer转交给agent。</p><p>由于它不属于验证平台组件之一，所以在注册使用UVM factory机制时，需要填入object。使用的DUT仍为数据转运模块。uvm_sequence是个带参数的类，需要输入它所生成的类的名字。</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>class my_sequence extends uvm_sequence#(my_transaction);
    // 首先，注册为object
    \`uvm_object_utils(my_sequence)
    
    // 构造函数
    function new(string name = &quot;&quot;);
        super.new(name);
    endfunction
    
    // sequence的任务几乎都是在body任务中完成的。这是一个虚任务。
    virtual task body();
        // sequence是在仿真开始时才会运行的，因此要先查看验证是否开始
        if(starting_phase != null)
            starting_phase.raise_objection(this);
        
        // 产生transaction 10个
        repeat(10) begin
            \`uvm_do(req)
        end
        
        // 等待100个时间单位
        #100
        
        if(starting_phase != null)
            starting_phase.drop_objection(this);
        
    endtask
endclass
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里的raise和drop是一种特殊的机制。在UVM特定的一些虚任务中，必须调用或者在其他同名虚任务中调用过raise，才能使本任务中后面那些消耗时间的语句生效。raise必须在第一句消耗时间的语句之前被调用，否则就会让整个仿真直接退出。在本虚任务结束前，需要调用一个drop来标记结束。</p><p>==同名虚任务之间是会相互影响的。==如果在某个组件中的同名虚任务中已经调用过raise和drop，那么就算在其他同名任务中不写raise和drop，任务也会照常执行和停止。然而，如果这个调用了raise和drop的任务运行得太快，时间太短，就会让其他没写raise和drop的、任务时间比较长的那些组件在还没运行结束就强行终止，这是不可接受的。因此，作者推荐在所有能够并且需要调用raise和drop的虚任务中，都加上raise和drop。这样，率先完成的虚任务只会阻止本模块继续运行下去，阻塞在这里等待其他同名任务运行完毕，而不会阻止其他模块的同名任务继续运行。</p><h2 id="_3-2-sequencer的任务" tabindex="-1"><a class="header-anchor" href="#_3-2-sequencer的任务" aria-hidden="true">#</a> 3.2 sequencer的任务</h2><p>一般来说，如果在前面的类编写中，完全采用了uvm的factory完成了注册，那么可以很轻松地完成sequencer的编写。seuqnecer也是一个带参数的类，它的参数同样是transaction：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>typedef uvm_sequencer#(my_transaction) my_sequencer; 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这一句就结束了。这算是factory机制中比较方便的一点。</p><p>和sequence不同，sequencer属于验证平台中的其中一环，所以如果需要自己手动编写sequencer的话，注意调用component的注册方法，而不是object的注册方法：</p><div class="language-systemverilog line-numbers-mode" data-ext="systemverilog"><pre class="language-systemverilog"><code>\`uvm_component_utils(my_sequencer)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="_3-3-sequence、sequencer和agent之间的联系" tabindex="-1"><a class="header-anchor" href="#_3-3-sequence、sequencer和agent之间的联系" aria-hidden="true">#</a> 3.3 sequence、sequencer和agent之间的联系</h2><p>这里还没讲到过agent，但可以在验证平台结构图中找到它的位置。它位于DUT之前，包含三个模块：sequencer、driver和monitor。</p><p>factory机制工作时，首先会让sequence产生一个transaction并阻塞，等待sequencer送来从agent中的driver请求数据的信号。接收到数据后，sequence会将生成的transaction发送给sequencer，由sequencer转交agent，进而转交driver，用于驱动DUT。在driver接收到数据后，会发送一个数据已经使用的回信到sequence。如果此时sequence已经产生了下一个数据，那么直接发送给sequencer转交agent，发送给driver；如果sequence还没产生下一个数据，就阻塞等待sequence产生下一个数据进行发送，如此循环往复直到数据发送完毕。</p><p>sequence的代码\`uvm_do(req)中，req指的就是transaction的句柄，transaction例化后就以req为句柄。它并不是显式表达的，而是被封装在了\`uvm_do这个宏中。这个宏也是可以拆解开自定义的，这点后面再讲。</p>`,17);function u(t,l){return n(),s("div",null,[i(" more "),r("在那张验证平台的结构图中，可以看到sequencer的位置，但找不到sequence。这表明，sequence并不属于验证平台的一个组件。但它仍然在验证时处于非常重要的位置，承担产生并向sequencer输送transaction的任务。 "),d])}const m=e(c,[["render",u],["__file","3.html.vue"]]);export{m as default};
