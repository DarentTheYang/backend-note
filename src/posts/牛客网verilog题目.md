---
icon: pen-to-square
date: 2023-08-06
category:
  - 杂项
tag:
  - Verilog
  - 数字前端
star:
  - 4
---



<!-- more -->之前做的一些牛客网的Verilog题目，都通过了。不是标准答案，但是能过就对了。稍微整理一下，也放上来。



# 牛客网Verilog题目

## 1. 基础语法

### 1.1 四选一多路器

#### 描述

制作一个四选一的多路选择器，要求输出定义上为线网类型

状态转换：

d0  11
d1  10
d2  01
d3  00

#### 我的解答

```verilog
`timescale 1ns/1ns
module mux4_1(
input [1:0]d1,d2,d3,d0,
input [1:0]sel,
output[1:0]mux_out
);
//*************code***********//
  assign mux_out = (sel == 2'b00)? d3 : 
    (sel == 2'b01)? d2 :
    (sel == 2'b10)? d1 : d0;
//*************code***********//
endmodule
```



### 1.2 异步复位的串联T触发器

#### 描述

用verilog实现两个串联的异步复位的T触发器的逻辑，结构如图：

![异步复位](/misc/牛客网1-2.png)

#### 我的解答

```verilog
`timescale 1ns/1ns
module Tff_2 (
input wire data, clk, rst,
output reg q  
);
//*************code***********//
reg t_q;

always@(posedge clk or negedge rst)
begin
    if(!rst)
    begin
        q <= 0;
        t_q <= 0;
    end
    else
    begin
        t_q <= data;
        q <= t_q;
    end
end

//*************code***********//
endmodule
```

### 1.3 奇偶校验

#### 描述

现在需要对输入的32位数据进行奇偶校验,根据sel输出校验结果（1输出奇校验，0输出偶校验）

![奇偶校验](/misc/牛客网1-3.png)

#### 我的解答

```verilog
`timescale 1ns/1ns
module odd_sel(
input [31:0] bus,
input sel,
output check
);
//*************code***********//

assign check = sel? (^bus) : !(^bus);

//*************code***********//
endmodule
```



### 1.4 移位运算与乘法

#### 描述

已知d为一个8位数，请在每个时钟周期分别输出该数乘1/3/7/8,并输出一个信号通知此时刻输入的d有效（d给出的信号的上升沿表示写入有效）

![移位运算与乘法](/misc/牛客网1-4.png)

#### 我的解答

```verilog
`timescale 1ns/1ns
module multi_sel(
input [7:0]d ,
input clk,
input rst,
output reg input_grant,
output reg [10:0]out
);
//*************code***********//
reg [10:0] temp;
reg [1:0] cnt;

always@(posedge clk or negedge rst) begin
    if(!rst) begin
        out <= 0;
        input_grant <= 0;
        temp <= 0;
        cnt <= 0;
    end
    else if(cnt==0) begin
        out <= d;
        input_grant <= 1'b1;
        temp <= d;
        cnt <= cnt + 1'b1;
    end
    else if(cnt==1) begin
        out <= ((temp<<2) - temp);
        input_grant <= 0;
        cnt <= cnt + 1'b1;
    end
    else if(cnt==2) begin
        out <= ((temp<<3) - temp);
        cnt <= cnt + 1'b1;
    end
    else if(cnt==3) begin
        out <= (temp<<3);
        cnt <= cnt + 1'b1;
    end
end


//*************code***********//
endmodule
```



### 1.5 位拆分运算

#### 描述

现在输入了一个压缩的16位数据，其实际上包含了四个数据[3:0] [7:4] [11:8] [15:12],

现在请按照sel选择输出四个数据的相加结果,并输出valid_out信号（在不输出时候拉低）

0:  不输出且只有此时的输入有效 

1：输出[3:0]+[7:4]

2：输出[3:0]+[11:8]

3：输出[3:0]+[15:12]

![位拆分运算](/misc/牛客网1-5.png)

#### 我的解答

```verilog
`timescale 1ns/1ns

module data_cal(
input clk,
input rst,
input [15:0]d,
input [1:0]sel,

output [4:0]out,
output validout
);
//*************code***********//

reg [4:0] out_reg;
reg [15:0] temp;

assign out = out_reg;
assign validout = (!sel)? 0:1;

always@(posedge clk or negedge rst) begin
    if(!rst) begin
        out_reg <= 0;
        temp <= 0;
    end
    else if(sel == 0)begin
        temp <= d;
        out_reg <= 0;
    end
    else if(sel == 1) begin
        out_reg <= temp[3:0] + temp[7:4];
    end
    else if(sel == 2) begin
        out_reg <= temp[3:0] + temp[11:8];
    end
    else if(sel == 3) begin
        out_reg <= temp[3:0] + temp[15:12];
    end

end

//*************code***********//
endmodule
```



### 1.6 多功能数据处理器

#### 描述

根据指示信号select的不同，对输入信号a,b实现不同的运算。输入信号a,b为8bit有符号数，当select信号为0，输出a；当select信号为1，输出b；当select信号为2，输出a+b；当select信号为3，输出a-b.
接口信号图如下：

![多功能数据处理器](/misc/牛客网1-6.png)

#### 我的解答

```verilog
`timescale 1ns/1ns
module data_select(
	input clk,
	input rst_n,
	input signed[7:0]a,
	input signed[7:0]b,
	input [1:0]select,
	output reg signed [8:0]c
);

always@(posedge clk or negedge rst_n) begin
	if(!rst_n) begin
		c <= 0;
	end
	else if(select==0) begin 
		c <= a;
	end
	else if(select==1) begin
		c <= b;
	end
	else if(select==2) begin
		c <= a+b;
	end
	else if(select==3) begin
		c <= a-b;
	end
end

endmodule
```



### 1.7 求两个数的差值

#### 描述

根据输入信号a,b的大小关系，求解两个数的差值：输入信号a,b为8bit位宽的无符号数。如果a>b，则输出a-b，如果a≤b，则输出b-a。

接口信号图如下：

![求两个数的差值](/misc/牛客网1-7.png)

#### 我的解答

```verilog
`timescale 1ns/1ns
module data_minus(
	input clk,
	input rst_n,
	input [7:0]a,
	input [7:0]b,

	output  reg [8:0]c
);

always@(posedge clk or negedge rst_n) begin
	if(!rst_n) begin
		c <= 0;
	end
	else if(a>b) begin
		c <= a-b;
	end
	else begin
		c <= b-a;
	end
end

endmodule
```



### 1.8 使用generate…for语句简化代码

#### 描述

在某个module中包含了很多相似的连续赋值语句，请使用generata…for语句编写代码，替代该语句，要求不能改变原module的功能。
使用Verilog HDL实现以上功能并编写testbench验证。

```verilog
module template_module( 
  input [7:0] data_in,
  output [7:0] data_out
);
  assign data_out [0] = data_in [7];
  assign data_out [1] = data_in [6];
  assign data_out [2] = data_in [5];
  assign data_out [3] = data_in [4];
  assign data_out [4] = data_in [3];
  assign data_out [5] = data_in [2];
  assign data_out [6] = data_in [1];
  assign data_out [7] = data_in [0];

endmodule
```

#### 我的解答

```verilog
`timescale 1ns/1ns
module gen_for_module( 
    input [7:0] data_in,
    output [7:0] data_out
);

genvar i;

generate
    for(i=0;i<8;i=i+1) begin:gen
        assign data_out[i] = data_in[7-i];
    end
endgenerate

endmodule
```



### 1.9 使用子模块实现三输入数的大小比较

#### 描述

在数字芯片设计中，通常把完成特定功能且相对独立的代码编写成子模块，在需要的时候再在主模块中例化使用，以提高代码的可复用性和设计的层次性，方便后续的修改。

请编写一个子模块，将输入两个8bit位宽的变量data_a,data_b，并输出data_a,data_b之中较小的数。并在主模块中例化，实现输出三个8bit输入信号的最小值的功能。

子模块的信号接口图如下：

![使用子模块实现三输入数的大小比较-子模块](/misc/牛客网1-9-1.png)

主模块的信号接口图如下：

![使用子模块实现三输入数的大小比较-主模块](/misc/牛客网1-9-2.png)

#### 我的解答

```verilog
`timescale 1ns/1ns
module main_mod(
	input clk,
	input rst_n,
	input [7:0]a,
	input [7:0]b,
	input [7:0]c,
	
	output [7:0]d
);

wire [7:0] temp;
reg [7:0] c_temp;

always@(posedge clk) begin
	c_temp <= c;
end


sub_mod first(
	.clk(clk),
	.rst_n(rst_n),
	.a(a),
	.b(b),
	.c(temp)
);

sub_mod second(
	.clk(clk),
	.rst_n(rst_n),
	.a(temp),
	.b(c_temp),
	.c(d)
);

endmodule

module sub_mod(
	input clk, 
	input rst_n,
	input [7:0] a,
	input [7:0] b,

	output reg [7:0] c
);

wire [7:0] c_wire;

assign c_wire = (a < b)? a : b;

always@(posedge clk or negedge rst_n) begin
	if(!rst_n) begin
		c <= 0;
	end
	else begin
		c <= c_wire;
	end
end

endmodule
```



### 1.10 使用函数实现数据大小端转换

#### 描述

在数字芯片设计中，经常把实现特定功能的模块编写成函数，在需要的时候再在主模块中调用，以提高代码的复用性和提高设计的层次，分别后续的修改。

请用函数实现一个4bit数据大小端转换的功能。实现对两个不同的输入分别转换并输出。

程序的接口信号图如下：

![使用函数实现数据大小端转换](/misc/牛客网1-10.png)

#### 我的解答

```verilog
`timescale 1ns/1ns
module function_mod(
	input [3:0]a,
	input [3:0]b,
	
	output [3:0]c,
	output [3:0]d
);

assign c = resort(a);
assign d = resort(b);

function [3:0] resort;
	input [3:0] com;
	resort = {com[0], com[1], com[2], com[3]};
endfunction

endmodule
```



## 2. 组合逻辑

### 2.1 4位数值比较器电路

#### 描述

某4位数值比较器的功能表如下。

请用Verilog语言采用门级描述方式，实现此4位数值比较器

![4位数值比较器电路](/misc/牛客网2-1.png)

#### 我的解答

```verilog
`timescale 1ns/1ns

module comparator_4(
	input		[3:0]       A   	,
	input	   [3:0]		B   	,
 
 	output	 wire		Y2    , //A>B
	output   wire        Y1    , //A=B
    output   wire        Y0      //A<B
);

assign Y1 = (A[3]&B[3] | ~A[3] & ~B[3])&(A[2]&B[2] | ~A[2]& ~B[2])&(A[1]&B[1] | ~A[1] & ~B[1])&(A[0]&B[0] | ~A[0] & ~B[0]);

assign Y2 = A[3]&~B[3] | (A[3]&B[3] | ~A[3] & ~B[3])&(A[2] & ~B[2]) | (A[3]&B[3] | ~A[3] & ~B[3])&(A[2]&B[2] | ~A[2] & ~B[2])&(A[1]&~B[1]) | (A[3]&B[3] | ~A[3] & ~B[3])&(A[2]&B[2] | ~A[2] & ~B[2])&(A[1]&B[1] | ~A[1] & ~B[1])&(A[0]&~B[0]);

assign Y0 = B[3]&~A[3] | (B[3]&A[3] | ~B[3] & ~A[3])&(B[2] & ~A[2]) | (B[3]&A[3] | ~B[3] & ~A[3])&(B[2]&A[2] | ~B[2] & ~A[2])&(B[1]&~A[1]) | (B[3]&A[3] | ~B[3] & ~A[3])&(B[2]&A[2] | ~B[2] & ~A[2])&(B[1]&A[1] | ~B[1] & ~A[1])&(B[0]&~A[0]);

endmodule
```



**持续更新**
