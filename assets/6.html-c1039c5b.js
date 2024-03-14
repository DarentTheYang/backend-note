const e=JSON.parse('{"key":"v-3091d694","path":"/posts/%E6%95%B0%E5%AD%97%E7%94%B5%E8%B7%AF%E9%AA%8C%E8%AF%81/6.html","title":"6、UVM机制（一）","lang":"zh-CN","frontmatter":{"icon":"pen-to-square","date":"2023-07-18T00:00:00.000Z","category":["数字验证"],"tag":["数字验证"],"description":"这一节需要先讲一些杂散的东西，然后才继续集中研究。首先会介绍一下UVM类、factory机制、field机制、configuration机制、phase机制、UVM内嵌的信息服务机制。以后还会有一个TLM信息传输机制需要讲，这是后话。刚才提到的这些机制是基础，需要花一些时间来学，但并不会占用太久的时间（可能还是有点久的，内容不算少）。==本章章内相关位...","head":[["meta",{"property":"og:url","content":"https://darenttheyang.github.io/backend-note/posts/%E6%95%B0%E5%AD%97%E7%94%B5%E8%B7%AF%E9%AA%8C%E8%AF%81/6.html"}],["meta",{"property":"og:site_name","content":"数字验证、后端个人学习站"}],["meta",{"property":"og:title","content":"6、UVM机制（一）"}],["meta",{"property":"og:description","content":"这一节需要先讲一些杂散的东西，然后才继续集中研究。首先会介绍一下UVM类、factory机制、field机制、configuration机制、phase机制、UVM内嵌的信息服务机制。以后还会有一个TLM信息传输机制需要讲，这是后话。刚才提到的这些机制是基础，需要花一些时间来学，但并不会占用太久的时间（可能还是有点久的，内容不算少）。==本章章内相关位..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-09-18T10:40:23.000Z"}],["meta",{"property":"article:author","content":"DarentTheYang"}],["meta",{"property":"article:tag","content":"数字验证"}],["meta",{"property":"article:published_time","content":"2023-07-18T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-09-18T10:40:23.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"6、UVM机制（一）\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-07-18T00:00:00.000Z\\",\\"dateModified\\":\\"2023-09-18T10:40:23.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"DarentTheYang\\",\\"url\\":\\"https://github.com/DarentTheYang\\"}]}"]]},"headers":[{"level":2,"title":"6.1 UVM类","slug":"_6-1-uvm类","link":"#_6-1-uvm类","children":[]},{"level":2,"title":"6.2 factory机制","slug":"_6-2-factory机制","link":"#_6-2-factory机制","children":[{"level":3,"title":"什么是factory机制","slug":"什么是factory机制","link":"#什么是factory机制","children":[]},{"level":3,"title":"factory机制中的两个查找表","slug":"factory机制中的两个查找表","link":"#factory机制中的两个查找表","children":[]},{"level":3,"title":"override机制","slug":"override机制","link":"#override机制","children":[]},{"level":3,"title":"override用法","slug":"override用法","link":"#override用法","children":[]}]},{"level":2,"title":"6.3 field机制","slug":"_6-3-field机制","link":"#_6-3-field机制","children":[{"level":3,"title":"field机制的应用","slug":"field机制的应用","link":"#field机制的应用","children":[]},{"level":3,"title":"UVM field automation机制的内建方法","slug":"uvm-field-automation机制的内建方法","link":"#uvm-field-automation机制的内建方法","children":[]},{"level":3,"title":"成员变量的注册方法","slug":"成员变量的注册方法","link":"#成员变量的注册方法","children":[]},{"level":3,"title":"FLAG标识符","slug":"flag标识符","link":"#flag标识符","children":[]}]},{"level":2,"title":"6.4 configuration机制","slug":"_6-4-configuration机制","link":"#_6-4-configuration机制","children":[{"level":3,"title":"configuration机制的优点","slug":"configuration机制的优点","link":"#configuration机制的优点","children":[]},{"level":3,"title":"configuration原理","slug":"configuration原理","link":"#configuration原理","children":[]},{"level":3,"title":"传递值例子：为sequence配置资源","slug":"传递值例子-为sequence配置资源","link":"#传递值例子-为sequence配置资源","children":[]},{"level":3,"title":"传递interface例子","slug":"传递interface例子","link":"#传递interface例子","children":[]},{"level":3,"title":"传递对象例子","slug":"传递对象例子","link":"#传递对象例子","children":[]}]},{"level":2,"title":"6.5 phase机制","slug":"_6-5-phase机制","link":"#_6-5-phase机制","children":[{"level":3,"title":"UVM phase","slug":"uvm-phase","link":"#uvm-phase","children":[]},{"level":3,"title":"task phase和function phase","slug":"task-phase和function-phase","link":"#task-phase和function-phase","children":[]},{"level":3,"title":"task phase执行顺序","slug":"task-phase执行顺序","link":"#task-phase执行顺序","children":[]},{"level":3,"title":"未定义的phase","slug":"未定义的phase","link":"#未定义的phase","children":[]},{"level":3,"title":"phase的启动","slug":"phase的启动","link":"#phase的启动","children":[]},{"level":3,"title":"UVM task phase objection","slug":"uvm-task-phase-objection","link":"#uvm-task-phase-objection","children":[]},{"level":3,"title":"objection 使用方法总结","slug":"objection-使用方法总结","link":"#objection-使用方法总结","children":[]},{"level":3,"title":"12个runtime phase的记忆方法","slug":"_12个runtime-phase的记忆方法","link":"#_12个runtime-phase的记忆方法","children":[]}]},{"level":2,"title":"6.6 UVM信息服务机制","slug":"_6-6-uvm信息服务机制","link":"#_6-6-uvm信息服务机制","children":[{"level":3,"title":"信息安全等级","slug":"信息安全等级","link":"#信息安全等级","children":[]},{"level":3,"title":"四种安全等级的宏","slug":"四种安全等级的宏","link":"#四种安全等级的宏","children":[]},{"level":3,"title":"uvm_info","slug":"uvm-info","link":"#uvm-info","children":[]},{"level":3,"title":"自定义信息的默认行为","slug":"自定义信息的默认行为","link":"#自定义信息的默认行为","children":[]}]},{"level":2,"title":"示例代码","slug":"示例代码","link":"#示例代码","children":[]}],"git":{"createdTime":1695033623000,"updatedTime":1695033623000,"contributors":[{"name":"DarentTheYang","email":"3339825@qq.com","commits":1}]},"readingTime":{"minutes":30.45,"words":9136},"filePathRelative":"posts/数字电路验证/6.md","localizedDate":"2023年7月18日","excerpt":"","autoDesc":true}');export{e as data};
