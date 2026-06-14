---
title: TCP/IP 协议
description: 三次握手/四次挥手、TCP 重传、拥塞控制、流量控制、粘包处理、UDP vs TCP
---

# TCP/IP 协议

TCP 是可靠的传输层协议，理解其机制对前端性能优化至关重要。

---

### Q1: 请描述 TCP 三次握手的过程，为什么需要三次？

> **⭐ 简单 · 三次握手**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三次握手过程**：

```
客户端                    服务端
  │                         │
  │── SYN (seq=x) ─────────>│  SYN_SENT
  │                         │
  │<─ SYN+ACK (seq=y,ack=x+1) ─│  SYN_RCVD
  │                         │
  │── ACK (seq=x+1,ack=y+1) ─>│  ESTABLISHED
  │                         │
```

**详细状态变化**：
1. **第一次**：客户端发送 SYN，进入 SYN_SENT 状态
2. **第二次**：服务端收到 SYN，回复 SYN+ACK，进入 SYN_RCVD 状态
3. **第三次**：客户端收到 SYN+ACK，回复 ACK，进入 ESTABLISHED 状态

**为什么需要三次握手**：

| 原因 | 说明 |
|------|------|
| **确认双方收发能力** | 三次才能确认双方发送和接收都正常 |
| **防止历史连接** | 两次握手无法区分有效 SYN 和延迟的旧 SYN |
| **同步序列号** | 双方需要交换初始序列号 (ISN) |
| **防止资源浪费** | 两次握手攻击者可轻易发送大量 SYN 耗资源 |

**为什么不是四次或两次**：
- **两次**：无法确认客户端收到服务端的 SYN；无法防止脏连接
- **四次**：第三次和第四次可以合并（ACK 和数据可一起发）

**代码示例（观察握手）**：
```bash
# 使用 tcpdump 观察
tcpdump -i en0 -n 'tcp[tcpflags] & tcp-syn != 0'

# 使用 Wireshark 过滤器
tcp.flags.syn == 1
```

**知识点：** `三次握手` `SYN` `ACK` `连接建立` `状态机`

:::

---

### Q2: 请描述 TCP 四次挥手的过程，为什么需要四次？

> **⭐ 简单 · 四次挥手**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**四次挥手过程**：

```
客户端                    服务端
  │                         │
  │── FIN (seq=u) ─────────>│  CLOSE_WAIT
  │                         │
  │<─ ACK (ack=u+1) ────────│  LAST_ACK
  │                         │
  │    (服务端继续发送数据)   │
  │                         │
  │<─ FIN (seq=v) ──────────│
  │                         │
  │── ACK (ack=v+1) ───────>│
  │                         │
  │ TIMED_WAIT(2MSL) ──>   CLOSED
```

**状态变化**：
1. **第一次**：主动关闭方发送 FIN，进入 FIN_WAIT_1
2. **第二次**：被动关闭方回复 ACK，进入 CLOSE_WAIT
3. **第三次**：被动关闭方发送 FIN，进入 LAST_ACK
4. **第四次**：主动关闭方回复 ACK，进入 TIME_WAIT

**为什么需要四次**：
```
TCP 是全双工的，每个方向独立关闭

情况：
- A 发送 FIN → 关闭 A 到 B 的方向
- B 回复 ACK → 确认收到
- B 可能还有数据要发送给 A
- B 发送完毕后再发送 FIN → 关闭 B 到 A 的方向
- A 回复 ACK → 确认收到

→ 第二次和第三次不能合并，因为 B 可能还有数据
```

**TIME_WAIT 状态（2MSL）**：
- **MSL**：报文段最大生存时间（通常 2 分钟）
- **等待 2MSL 原因**：
  1. 确保最后一个 ACK 到达服务端
  2. 防止旧连接的数据包污染新连接

**常见问题**：
- **TIME_WAIT 过多**：短连接频繁建立关闭
- **解决**：连接池复用、SO_LINGER 选项

**知识点：** `四次挥手` `FIN` `TIME_WAIT` `连接关闭` `2MSL`

:::

---

### Q3: TCP 的重传机制是什么？

> **🔥 中等 · 重传机制**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**重传机制**：数据包丢失或超时时重新发送。

**触发条件**：

**1. 超时重传（RTO）**
```
发送方维护每个包的计时器
超过 RTO 时间未收到 ACK → 重传
RTO 根据 RTT 动态调整
```

**2. 快速重传（Fast Retransmit）**
```
发送方收到 3 个重复 ACK → 立即重传
不需要等待 RTO 超时
```

**3. 选择确认（SACK）**
```
接收方告知哪些块已收到
发送方只重传丢失的块
减少重复传输
```

**RTO 计算**：
```
RTT = 报文往返时间
SRTT = 平滑 RTT
RTTVAR = RTT 偏差

RTO = SRTT + 4 × RTTVAR
最小 RTO = 1 秒
```

**重传示例**：
```
发送: [1][2][3][4][5]
接收: [1][2][x][4][5]  ← 3 丢失

无 SACK:
发送方重传: [3][4][5]  ← 4 和 5 也重传了

有 SACK:
发送方重传: [3]  ← 只重传丢失的
```

**快速重传流程**：
```
发送: 1 2 3 4 5
接收: 1 2   4 5  ← 3 丢失
ACK:  ACK2 ACK2 ACK2 ACK2 ACK5
               ↑
          3 个重复 ACK → 快速重传 3
```

**知识点：** `重传机制` `RTO` `快速重传` `SACK` `超时重传`

:::

---

### Q4: TCP 拥塞控制有哪些算法？

> **🔥 中等 · 拥塞控制**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**拥塞控制目的**：防止过多数据注入网络，避免网络过载。

**四种核心算法**：

**1. 慢启动（Slow Start）**
```
cwnd = 1
每收到一个 ACK: cwnd++
→ 指数增长 (1, 2, 4, 8, 16...)
达到 ssthresh 后进入拥塞避免
```

**2. 拥塞避免（Congestion Avoidance）**
```
每 RTT: cwnd++
→ 线性增长
检测到丢包: ssthresh = cwnd/2, cwnd = 1
```

**3. 快重传（Fast Retransmit）**
```
收到 3 个重复 ACK → 立即重传
不等待超时
```

**4. 快恢复（Fast Recovery）**
```
快重传后:
ssthresh = cwnd/2
cwnd = ssthresh + 3
→ 直接进入拥塞避免，不回到慢启动
```

**cwnd 变化图**：
```
cwnd
  │     ╱╲       ╱
  │    ╱  ╲     ╱
  │   ╱    ╲   ╱
  │  ╱      ╲ ╱
  │ ╱        ╲
  └──────────────→ 时间
   慢启动  拥塞避免
```

**Reno vs Tahoe vs Cubic**：

| 算法 | 丢包处理 | 特点 |
|------|----------|------|
| Tahoe | cwnd=1, 慢启动 | 简单 |
| Reno | 快恢复 | 更高效 |
| Cubic | 基于时间的窗口增长 | Linux 默认 |

**BBR 算法（Google）**：
- 基于带宽和 RTT 测量
- 不依赖丢包作为拥塞信号
- 更高吞吐，更低延迟

**知识点：** `拥塞控制` `慢启动` `拥塞避免` `快重传` `快恢复`

:::

---

### Q5: TCP 流量控制是如何实现的？

> **⭐ 简单 · 流量控制**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**流量控制**：防止发送方发送过快，接收方来不及处理。

**实现机制：滑动窗口**

```
发送窗口 = min(接收窗口 rwnd, 拥塞窗口 cwnd)
```

**滑动窗口原理**：
```
接收方: [已接收 | 可用窗口 | 未发送]
         └─ rwnd 告知发送方 ─┘

发送方根据 rwnd 调整发送速率
```

**工作过程**：
```
1. 接收方在 ACK 中携带窗口大小 (rwnd)
2. 发送方根据 rwnd 限制发送量
3. 接收方处理后，窗口滑动
4. 发送方收到新 ACK 后继续发送
```

**窗口缩放**：
```
窗口字段只有 16 位 (最大 65535)
通过 Window Scale 选项扩展到 1GB
```

**零窗口探测**：
```
接收方 rwnd=0 → 发送方停止发送
接收方处理后发送窗口更新
如果更新丢失，发送方定期发送探测包
```

**流量控制 vs 拥塞控制**：

| 特性 | 流量控制 | 拥塞控制 |
|------|----------|----------|
| **目的** | 防止接收方过载 | 防止网络过载 |
| **依据** | 接收窗口 (rwnd) | 拥塞窗口 (cwnd) |
| **范围** | 端到端 | 全局网络 |
| **控制方** | 接收方 | 发送方 |

**实际发送窗口**：
```
发送窗口 = min(rwnd, cwnd)
- 网络好：cwnd 大，受 rwnd 限制
- 网络差：cwnd 小，受 cwnd 限制
```

**知识点：** `流量控制` `滑动窗口` `rwnd` `零窗口` `接收窗口`

:::

---

### Q6: TCP 粘包问题是如何产生的？如何处理？

> **💀 困难 · 粘包问题**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**粘包问题**：TCP 是流式协议，多个数据包可能被合并或拆分。

**产生原因**：
```
1. 发送方：Nagle 算法合并小包
2. 接收方：不及时读取，多个包堆积
3. TCP 没有消息边界，只有字节流
```

**示例**：
```
发送方连续发送:
  "Hello" 和 "World"

接收方可能收到:
  "HelloWorld"  ← 粘包
  或 "Hel", "loWorld"  ← 拆包
```

**解决方案**：

**1. 固定长度消息**
```
每条消息固定 1024 字节
不足补空格或 0
简单但浪费
```

**2. 特殊分隔符**
```
消息格式: data\n
接收方按 \n 分割
适用于文本协议
```

**3. 长度前缀（推荐）**
```
消息格式: [4 字节长度][数据]

发送:
  [0,0,0,5]["Hello"]
  [0,0,0,5]["World"]

接收:
  先读 4 字节长度 = 5
  再读 5 字节数据 = "Hello"
```

**4. 应用层协议**
```
HTTP: Content-Length 指定 body 长度
WebSocket: 帧头包含 payload length
```

**Node.js 实现**：
```javascript
class TCPParser {
  constructor() {
    this.buffer = Buffer.alloc(0);
  }
  
  push(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
    this.parse();
  }
  
  parse() {
    while (this.buffer.length >= 4) {
      const length = this.buffer.readUInt32BE(0);
      if (this.buffer.length >= 4 + length) {
        const message = this.buffer.slice(4, 4 + length);
        this.buffer = this.buffer.slice(4 + length);
        this.onMessage(message);
      } else {
        break; // 数据不完整
      }
    }
  }
  
  onMessage(msg) {
    console.log('收到消息:', msg.toString());
  }
}
```

**Nagle 算法**：
```
有小数据未确认时，不发送新的小包
减少网络中小包数量
可通过 TCP_NODELAY 禁用
```

**知识点：** `TCP 粘包` `拆包` `长度前缀` `消息边界` `Nagle 算法`

:::

---

### Q7: UDP 和 TCP 有哪些区别？（6 点以上）

> **⭐ 简单 · UDP vs TCP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | TCP | UDP |
|--------|-----|-----|
| **1. 连接性** | 面向连接 | 无连接 |
| **2. 可靠性** | 可靠（确认、重传） | 不可靠 |
| **3. 顺序** | 保证顺序 | 不保证顺序 |
| **4. 速度** | 慢（握手、确认） | 快（无额外开销） |
| **5. 流量控制** | 有（滑动窗口） | 无 |
| **6. 拥塞控制** | 有 | 无 |
| **7. 数据边界** | 字节流 | 数据报 |
| **8. 头部大小** | 20-60 字节 | 8 字节 |
| **9. 适用场景** | Web、文件传输 | 视频、游戏、DNS |

**详细对比**：

**1. 连接建立**
```
TCP: 三次握手建立连接
UDP: 直接发送，无需握手
```

**2. 可靠性机制**
```
TCP:
- 序号和确认
- 超时重传
- 校验和

UDP:
- 只校验和
- 丢包不重传
```

**3. 头部结构**
```
TCP 头 (20 字节):
源端口 | 目的端口 | 序号 | 确认号 |
数据偏移 | 标志位 | 窗口 | 校验和 | 紧急指针

UDP 头 (8 字节):
源端口 | 目的端口 | 长度 | 校验和
```

**4. 适用场景**

| TCP 场景 | UDP 场景 |
|----------|----------|
| HTTP/HTTPS | DNS 查询 |
| 文件传输 (FTP) | 视频流 |
| 邮件 (SMTP) | 在线游戏 |
| 数据库连接 | VoIP 通话 |

**5. 性能特点**
```
TCP:
- 延迟高（握手、确认）
- 吞吐稳定
- 拥塞时降速

UDP:
- 延迟低
- 可能丢包
- 持续发送
```

**6. 编程复杂度**
```
TCP:
- 处理连接管理
- 处理粘包
- 处理断线重连

UDP:
- 直接收发
- 应用层实现可靠性（如需要）
```

**知识点：** `TCP vs UDP` `传输层协议` `可靠性` `性能对比`

:::

---

### Q8: TCP 如何保证可靠传输？

> **🔥 中等 · 可靠传输**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TCP 可靠性保证机制**：

**1. 校验和（Checksum）**
```
每段数据计算校验和
接收方验证，错误则丢弃
```

**2. 序号和确认（Sequence & ACK）**
```
每个字节有序号
接收方确认已收到的字节
发送方知道哪些数据已送达
```

**3. 超时重传**
```
发送后启动计时器
超时未收到 ACK 则重传
动态调整 RTO
```

**4. 去重**
```
序号重复的数据包被丢弃
处理乱序到达的包
```

**5. 流量控制**
```
滑动窗口防止接收方溢出
根据 rwnd 调整发送速率
```

**6. 拥塞控制**
```
慢启动、拥塞避免
快重传、快恢复
防止网络过载
```

**7. 连接管理**
```
三次握手建立可靠连接
四次挥手优雅关闭
TIME_WAIT 处理延迟包
```

**可靠性数据流**：
```
应用数据 → 分段 → 加序号 → 发送
               ↓
            网络可能
            丢包/乱序
               ↓
接收方 → 校验 → 排序 → 重组 → 应用
         ↓
       发送 ACK
```

**对比 UDP**：
```
UDP 不保证:
- ❌ 数据一定到达
- ❌ 到达顺序正确
- ❌ 数据不重复

TCP 保证:
- ✅ 数据完整到达
- ✅ 按发送顺序交付
- ✅ 无重复数据
```

**知识点：** `可靠传输` `校验和` `序号确认` `重传机制` `流量控制`

:::

---

### Q9: 什么是 OSI 七层模型和 TCP/IP 四层模型？

> **⭐ 简单 · 网络模型**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**OSI 七层模型**：

| 层 | 名称 | 功能 | 协议/设备 |
|----|------|------|-----------|
| 7 | 应用层 | 用户接口 | HTTP、FTP、SMTP |
| 6 | 表示层 | 数据格式、加密 | SSL、JPEG、MPEG |
| 5 | 会话层 | 会话管理 | RPC、NetBIOS |
| 4 | 传输层 | 端到端传输 | TCP、UDP |
| 3 | 网络层 | 路由选择 | IP、ICMP、路由器 |
| 2 | 数据链路层 | 帧传输 | Ethernet、交换机 |
| 1 | 物理层 | 比特传输 | 网线、光纤、Hub |

**TCP/IP 四层模型**：

| 层 | 名称 | 对应 OSI | 协议 |
|----|------|----------|------|
| 4 | 应用层 | 应用/表示/会话 | HTTP、DNS、SMTP |
| 3 | 传输层 | 传输层 | TCP、UDP |
| 2 | 网络层 | 网络层 | IP、ICMP |
| 1 | 网络接口层 | 链路/物理 | Ethernet、WiFi |

**五层混合模型（教学用）**：
```
5. 应用层 - HTTP, DNS
4. 传输层 - TCP, UDP
3. 网络层 - IP
2. 数据链路层 - Ethernet
1. 物理层 - 网线
```

**数据封装过程**：
```
发送方（从上到下）：
数据 → 段 → 包 → 帧 → 比特
      TCP  IP  Ethernet

接收方（从下到上）：
比特 → 帧 → 包 → 段 → 数据
```

**实际数据流**：
```
应用层: GET / HTTP/1.1
   ↓
传输层: [TCP 头][GET / HTTP/1.1]
   ↓
网络层: [IP 头][TCP 头][GET / HTTP/1.1]
   ↓
链路层: [ETH 头][IP 头][TCP 头][数据][ETH 尾]
```

**各层职责**：
- **应用层**：定义应用数据格式
- **传输层**：端到端可靠性
- **网络层**：路径选择
- **链路层**：局域网络内传输
- **物理层**：物理介质传输

**知识点：** `OSI 模型` `TCP/IP 模型` `网络分层` `数据封装`

:::

---

### Q10: 什么是最小 MTU？分片和重组是如何工作的？

> **💀 困难 · MTU 分片**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**MTU（Maximum Transmission Unit）**：数据链路层一次能传输的最大数据量。

**常见 MTU**：
| 网络类型 | MTU |
|----------|-----|
| Ethernet | 1500 字节 |
| PPPoE | 1492 字节 |
| WiFi | 2304 字节 |
| IPv6 最小 | 1280 字节 |

**IP 分片原因**：
```
数据 > MTU 时需要分片
TCP 的 MSS = MTU - IP 头 - TCP 头
通常是 1500 - 20 - 20 = 1460 字节
```

**分片字段**：
```
16 位标识 (Identification)
3 位标志 (DF, MF)
13 位片偏移 (Fragment Offset)

DF (Don't Fragment): 不允许分片
MF (More Fragments): 还有后续分片
```

**分片过程**：
```
原始包 (4000 字节)
  ↓
分片 1: [头][1480 字节] MF=1, Offset=0
分片 2: [头][1480 字节] MF=1, Offset=185
分片 3: [头][1040 字节] MF=0, Offset=370
```

**重组过程**：
```
接收方:
1. 根据标识字段识别同属一个包
2. 根据偏移量排序
3. 收到所有分片后重组
4. MF=0 表示最后一个分片
```

**路径 MTU 发现（PMTUD）**：
```
1. 发送 DF=1 的包
2. 如果路由器 MTU 太小，返回 ICMP "需要分片"
3. 源主机减小 MTU 重发
4. 找到路径最小 MTU
```

**分片问题**：
- 任一分片丢失，整个包重传
- 重组消耗资源
- 防火墙可能丢弃分片
- 增加延迟

**TCP 避免分片**：
```
MSS 协商:
- SYN 包携带 MSS 选项
- 双方选择较小值
- 确保不分片
```

**知识点：** `MTU` `IP 分片` `MSS` `PMTUD` `重组`

:::

---
### Q11: UDP 协议为什么不可靠？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**UDP（User Datagram Protocol）不可靠的原因：**

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 确认+重传 | 不确认不重传 |
| 顺序 | 按序到达 | 可能乱序 |
| 流量控制 | 滑动窗口 | 无 |
| 拥塞控制 | 有 | 无 |
| 数据边界 | 字节流（无边界） | 数据报（有边界） |

```text
UDP 为什么不可靠：
1. 不建立连接 — 直接发送，不确认对方是否就绪
2. 不确认到达 — 发完就不管了，不等待ACK
3. 不重传丢失 — 丢包不重发
4. 不保证顺序 — 后发的可能先到
5. 不去重 — 重复包不过滤
6. 不流控 — 不管接收方缓冲区是否满
7. 不拥控 — 不管网络是否拥堵
```

**UDP 适用场景：**

| 场景 | 为什么用UDP | 示例 |
|------|-----------|------|
| 实时音视频 | 丢帧可接受，延迟不可接受 | WebRTC, 视频通话 |
| 在线游戏 | 低延迟优先 | 游戏状态同步 |
| DNS查询 | 简单快速，一问一答 | DNS解析 |
| 直播 | 少量丢包可容忍 | RTSP, 流媒体 |
| IoT传感 | 数据量小，无需可靠 | 传感器上报 |

```js
// UDP vs TCP 代码对比（Node.js）

// TCP — 可靠传输
const net = require('net')
const server = net.createServer(socket => {
  socket.on('data', data => console.log('TCP收到:', data.toString()))
})
server.listen(3000)

// UDP — 不可靠但快速
const dgram = require('dgram')
const server = dgram.createSocket('udp4')
server.on('message', (msg, rinfo) => {
  console.log('UDP收到:', msg.toString())
  // 不需要确认，不保证对方收到
})
server.bind(3000)
```

**知识点：** `UDP` `不可靠` `TCP对比` `实时通信` `无连接`

:::

### Q12: DNS 如何泄漏个人隐私？怎么防范？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**DNS 泄漏原理：** DNS 查询默认以明文传输（UDP 53端口），中间人可以窃听。

```text
正常DNS查询流程（明文暴露）：
浏览器 → 本地DNS(UDP 53明文) → 递归DNS(UDP 53明文) → 根域名服务器
         ↑ 中间人可以：
         - 看到你在访问什么网站
         - 篡改DNS响应(钓鱼)
         - 记录你的访问日志
         - 根据SNI(明文)知道你要访问的域名
```

**隐私泄漏场景：**

| 泄漏方式 | 原理 | 风险 |
|---------|------|------|
| ISP监控 | 运营商可以看到所有DNS查询 | 知道你访问什么网站 |
| DNS劫持 | 篡改DNS响应指向恶意IP | 钓鱼攻击 |
| DNS缓存投毒 | 伪造DNS响应污染缓存 | 长时间重定向 |
| SNI泄漏 | TLS握手时域名明文传输 | 知道HTTPS站点域名 |
| 智能DNS | 根据位置返回不同IP | 位置跟踪 |
| 日志记录 | DNS服务器记录查询日志 | 隐私收集 |

**防范措施：**

```text
1. DNS over HTTPS (DoH)
   - DNS查询通过HTTPS加密传输
   - 端口443，和普通HTTPS流量混合
   - 防止ISP窃听和篡改

2. DNS over TLS (DoT)
   - DNS查询通过TLS加密传输
   - 端口853
   - 防止窃听但端口可被识别

3. DNSSEC
   - DNS响应数字签名验证
   - 防止篡改，但不加密查询内容

4. Encrypted Client Hello (ECH)
   - 加密TLS握手中的SNI信息
   - 防止域名泄漏（Chrome已支持）
```

```js
// 浏览器配置 DoH
// Chrome: 设置 → 安全 → 使用安全DNS
// Firefox: about:config → network.trr.mode = 2

// Node.js 使用 DoH
const { Resolver } = require('dns').promises
const resolver = new Resolver()
// 需要第三方DoH库
// 查询: https://dns.google/resolve?name=example.com&type=A
```

**DoH vs DoT：**

| 维度 | DoH | DoT |
|------|-----|-----|
| 端口 | 443（与HTTPS混合） | 853（专用端口） |
| 协议 | HTTPS | TLS |
| 抗封锁 | 强（流量混合） | 弱（端口可识别） |
| 延迟 | 略高（HTTP开销） | 略低 |

**知识点：** `DNS泄漏` `DoH` `DoT` `DNSSEC` `SNI` `隐私保护`

:::

### Q13: 运营商劫持是什么？如何防范？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**运营商劫持：** ISP（运营商）利用其网络中间人地位，篡改或注入用户访问的网页内容。

**常见类型：**

| 类型 | 手段 | 表现 |
|------|------|------|
| DNS劫持 | 返回错误的IP | 访问A网站跳到B网站 |
| HTTP劫持 | 篡改HTTP响应内容 | 页面被注入广告/弹窗 |
| 302跳转 | 返回302重定向 | 跳到运营商推广页 |
| iframe嵌入 | 注入iframe | 页面底部/弹窗广告 |

```text
HTTP劫持原理：
用户请求 → ISP中间设备 → 篡改响应 → 注入广告 → 用户收到被修改的页面

典型注入代码：
<script src="http://isp-ads.com/popup.js"></script>
<iframe src="http://isp-ads.com/banner.html" style="position:fixed;bottom:0">
```

**如何检测：**

```js
// 1. 检测页面是否被注入额外内容
const scripts = document.querySelectorAll('script')
scripts.forEach(s => {
  if (!s.src.includes('your-domain.com')) {
    console.warn('可疑脚本注入:', s.src)
  }
})

// 2. 检测DNS劫持
// 对比多个DNS服务器的解析结果
const dns1 = await resolve('example.com', '8.8.8.8')  // Google DNS
const dns2 = await resolve('example.com', '114.114.114.114')  // 114 DNS
const dns3 = await resolve('example.com', 'local')  // 运营商DNS
if (dns1 !== dns3) console.warn('DNS劫持！')

// 3. CSP报告
// Content-Security-Policy: default-src 'self'; report-uri /csp-report
// 被注入内容会触发CPS违规报告

// 4. SRI (Subresource Integrity)
// <script src="app.js" integrity="sha384-xxx"></script>
// 脚本被篡改则不执行
```

**防范措施：**

| 方案 | 原理 | 效果 |
|------|------|------|
| **HTTPS** | 加密传输，篡改可被检测 | 防止HTTP劫持 |
| **HSTS** | 强制HTTPS，防降级 | 防止302劫持 |
| **CSP** | 限制可加载资源来源 | 防止注入脚本/iframe |
| **SRI** | 校验资源完整性 | 防止CDN劫持 |
| **DoH** | 加密DNS查询 | 防止DNS劫持 |
| **Certificate Pinning** | 固定证书 | 防止伪造证书 |

```nginx
# Nginx 安全配置
# HSTS - 强制HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# CSP - 限制资源来源
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'" always;

# 防止被iframe嵌入
add_header X-Frame-Options "SAMEORIGIN" always;
```

**知识点：** `运营商劫持` `DNS劫持` `HTTP劫持` `CSP` `HSTS` `SRI`

:::

---

### Q14: 三次握手中 SYN Flood 攻击是什么？如何防范？

> **🔥 中等 · TCP 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SYN Flood 是一种经典的 DDoS 攻击，利用 TCP 三次握手的弱点消耗服务器资源。**

**1. TCP 三次握手回顾：**

```text
正常三次握手：
Client                    Server
   │── SYN (seq=x) ──────►│ 状态：LISTEN → SYN_RECV
   │                      │ 分配资源（连接队列、内存）
   │◄── SYN-ACK (seq=y,ack=x+1) ──│
   │── ACK (ack=y+1) ────►│ 状态：SYN_RECV → ESTABLISHED
   │                      │ 完成连接建立
```

**2. SYN Flood 攻击原理：**

```text
攻击场景：
攻击者                受害者服务器
   │── SYN（伪造源 IP）──►│
   │                      │ 分配资源，等待 ACK
   │◄── SYN-ACK ─────────│ 发送到伪造的 IP
   │                      │ 等待...（超时 30s-2min）
   │                      │
   │── SYN（伪造源 IP）──►│ 重复攻击
   │                      │
   │  ... 大量 SYN 请求   │
   │                      │ 连接队列被填满
   │                      │ 无法接受正常连接 → DoS
```

**攻击特点：**
- 攻击者发送大量 SYN 包，不完成握手
- 服务器为每个 SYN 分配资源（TCB，Transmission Control Block）
- 连接队列耗尽，无法服务正常用户
- 伪造源 IP，难以追溯

**3. SYN Flood 的危害：**

```text
资源消耗：
- 半开连接队列（SYN Queue）被填满
- 内存耗尽（每个连接 ~256 字节 TCB）
- CPU 处理大量无效连接
- 正常用户无法建立连接

典型攻击流量：
- 10,000+ SYN/秒
- 持续数分钟到数小时
- 分布式攻击（ botnet）更难防御
```

**4. 防御技术：**

**(1) SYN Cookie（无状态防御）：**

```text
原理：
- 不立即分配资源
- 用哈希计算初始 seq 号
- 客户端 ACK 时验证 seq

SYN Cookie 计算：
seq = hash(源 IP, 源端口，目标 IP, 目标端口，时间戳，秘钥)

优点：
- 无需存储连接状态
- 免疫资源耗尽攻击

缺点：
- 不支持 TCP 选项（如 MSS、窗口缩放）
- 增加 CPU 开销
```

```bash
# Linux 开启 SYN Cookie
sysctl -w net.ipv4.tcp_syncookies=1

# 永久配置 /etc/sysctl.conf
net.ipv4.tcp_syncookies=1
```

**(2) 连接队列调优：**

```bash
# 增加 SYN 队列长度
sysctl -w net.ipv4.tcp_max_syn_backlog=65536

# 增加 listen 队列（已完成握手）
sysctl -w net.core.somaxconn=65536

# 减少 SYN-ACK 重试次数
sysctl -w net.ipv4.tcp_synack_retries=2
```

**(3) 防火墙/内核级过滤：**

```bash
# iptables 限制 SYN 频率
iptables -A INPUT -p tcp --syn -m limit --limit 100/second -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# 连接跟踪
conntrack -L | wc -l  # 查看连接数
```

**(4) 应用层防护：**

```nginx
# Nginx 限流配置
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn addr 10;  # 每 IP 最多 10 个并发连接

# SYN 代理（反向代理）
upstream backend {
    server 127.0.0.1:8080;
}
server {
    listen 80;
    location / {
        proxy_pass http://backend;
        # Nginx 完成三次握手后再转发
    }
}
```

**(5) 云服务商防护：**

```text
AWS Shield / WAF:
- 自动检测 SYN Flood
- 弹性扩展吸收攻击流量
- 结合 CloudFront 边缘防护

Cloudflare:
- Anycast 网络分散攻击
- 自动 SYN Cookie
- 机器学习识别异常流量
```

**5. 检测 SYN Flood：**

```bash
# 查看半开连接数
netstat -n -p TCP | grep SYN_RECV | wc -l

# 查看 SYN 包速率
watch -n1 'netstat -s | grep "segments received"'

# 异常指标
# - SYN_RECV 状态连接 > 1000
# - SYN 包速率突增 10 倍以上
# - 连接成功率大幅下降
```

**6. 攻击流量特征：**

| 特征 | 正常流量 | SYN Flood |
|------|----------|-----------|
| SYN/ACK 比例 | ~1:1 | SYN 远大于 ACK |
| 源 IP 分布 | 多样 | 大量伪造 IP |
| 连接完成率 | >90% | <10% |
| 包大小 | 多样 | 多为最小包（60 字节） |

**知识点：** `SYN Flood` `DDoS` `三次握手` `SYN Cookie` `网络安全` `流量防护`

:::

---

### Q15: TCP 的 TIME_WAIT 状态是什么？MSL 是什么？

> **🔥 中等 · TCP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TIME_WAIT 是 TCP 主动关闭方在连接关闭后进入的状态，持续 2 MSL 时间，确保连接的可靠终止。**

**1. TCP 四次挥手回顾：**

```text
正常四次挥手：
Client (主动关闭)         Server (被动关闭)
   │── FIN (seq=u) ──────►│ 状态：ESTABLISHED → FIN_WAIT_1
   │                      │
   │◄── ACK (ack=u+1) ────│ 状态：FIN_WAIT_1 → FIN_WAIT_2
   │                      │ 状态：CLOSED → CLOSE_WAIT
   │                      │
   │                      │ (应用处理剩余数据)
   │                      │
   │◄── FIN (seq=v) ──────│ 状态：FIN_WAIT_2 → TIME_WAIT
   │── ACK (ack=v+1) ────►│ 状态：CLOSE_WAIT → LAST_ACK
   │                      │
   │ 状态：TIME_WAIT (2MSL) │ 状态：LAST_ACK → CLOSED
   │ 等待 2MSL 后           │
   │ → CLOSED             │
```

**2. TIME_WAIT 的作用：**

```text
为什么需要 TIME_WAIT？

原因 1：确保最后一个 ACK 可靠到达
如果主动关闭方的 ACK 丢失：
- 被动关闭方重传 FIN
- 主动关闭方在 TIME_WAIT 中收到重传的 FIN
- 重传 ACK，重置 2MSL 计时器
- 确保被动关闭方最终收到 ACK

原因 2：防止旧连接的重复报文干扰新连接
- 网络中可能残留旧连接的报文
- 等待 2MSL 确保所有旧报文失效
- 避免新连接收到过期的数据
```

**3. MSL（Maximum Segment Lifetime）：**

```text
MSL 定义：
- TCP 报文段在网络中的最大生存时间
- RFC 793 建议 MSL = 2 分钟
- 实际实现通常更短

常见 MSL 值：
- Linux: 60 秒
- Windows: 120 秒
- FreeBSD: 30 秒
- macOS: 15 秒

2MSL 等待时间：
- Linux: 120 秒
- Windows: 240 秒
- FreeBSD: 60 秒
```

**4. TIME_WAIT 过多问题：**

```text
高并发场景的问题：
- 服务器主动关闭大量短连接
- 每个连接占用一个端口 2MSL
- 端口耗尽（16 位，最多 65535）
- 无法建立新连接

症状：
- netstat 看到大量 TIME_WAIT
- 新连接报错 "Cannot assign requested address"
- 服务不可用
```

**5. TIME_WAIT 优化方案：**

**(1) 使用连接池（推荐）：**

```javascript
// Node.js HTTP Agent 连接池
const http = require('http');
const agent = new http.Agent({
  keepAlive: true,      // 长连接
  maxSockets: 50,       // 最大并发
  maxFreeSockets: 10,   // 空闲连接池大小
  timeout: 30000
});

http.get({
  hostname: 'api.example.com',
  agent: agent  // 复用连接
}, (res) => {
  // ...
});
```

**(2) 调整内核参数（谨慎使用）：**

```bash
# 开启 TIME_WAIT 快速回收
sysctl -w net.ipv4.tcp_tw_reuse=1  # 允许重用 TIME_WAIT socket

# 开启 TIME_WAIT 快速回收（更激进，可能有问题）
sysctl -w net.ipv4.tcp_tw_recycle=1  # ❌ 已废弃，NAT 环境有问题

# 缩短 MSL 时间
sysctl -w net.ipv4.tcp_fin_timeout=30  # 默认 60 秒

# 增加本地端口范围
sysctl -w net.ipv4.ip_local_port_range="1024 65535"
```

⚠️ **注意：** `tcp_tw_recycle` 在 Linux 4.12+ 已移除，NAT 环境下会导致连接问题！

**(3) 使用长连接：**

```nginx
# Nginx 长连接配置
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;  # 保持 32 个空闲连接
}

server {
    location / {
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_pass http://backend;
    }
}
```

**(4) 应用层避免频繁关闭：**

```python
# ❌ 错误：每次请求都新建连接
for i in range(1000):
    response = requests.get(url)  # 新建 TCP 连接
    # 产生 1000 个 TIME_WAIT

# ✅ 正确：使用 Session 复用连接
session = requests.Session()
for i in range(1000):
    response = session.get(url)  # 复用连接
```

**6. TIME_WAIT 监控：**

```bash
# 查看 TIME_WAIT 连接数
netstat -n | grep TIME_WAIT | wc -l

# 按端口统计
netstat -n | grep TIME_WAIT | awk '{print $4}' | cut -d: -f2 | sort | uniq -c

# 实时监控
watch -n1 'netstat -n | grep TIME_WAIT | wc -l'

# 查看端口范围
sysctl net.ipv4.ip_local_port_range
```

**7. TIME_WAIT 状态迁移图：**

```text
ESTABLISHED
    │
    │ 应用调用 close()，发送 FIN
    ▼
FIN_WAIT_1
    │
    │ 收到 ACK
    ▼
FIN_WAIT_2
    │
    │ 收到对方的 FIN
    ▼
TIME_WAIT ──┐
    │       │ 收到重传 FIN
    │       └─ 重传 ACK，重置计时器
    │
    │ 等待 2MSL
    ▼
CLOSED
```

**知识点：** `TIME_WAIT` `MSL` `四次挥手` `连接复用` `端口耗尽` `性能优化`

:::

---

### Q16: UDP 和 TCP 的使用场景对比？为什么 DNS 用 UDP？

> **🔥 中等 · 网络协议**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**UDP 和 TCP 的选择取决于应用对可靠性、延迟、顺序的权衡。DNS 使用 UDP 是因为查询简单、低延迟需求高。**

**1. UDP vs TCP 特性对比：**

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 可靠（确认、重传） | 不可靠（尽力而为） |
| 顺序 | 保证顺序 | 不保证顺序 |
| 流量控制 | 滑动窗口 | 无 |
| 拥塞控制 | 有（慢启动等） | 无 |
| 头部开销 | 20-60 字节 | 8 字节 |
| 传输模式 | 字节流 | 数据报 |
| 延迟 | 较高（握手、确认） | 低（即发即弃） |
| 适用场景 | 文件、网页、邮件 | DNS、视频、游戏、语音 |

**2. TCP 适用场景：**

```text
需要可靠传输的场景：
✅ Web 浏览（HTTP/HTTPS）
  - 必须完整加载 HTML、CSS、JS
  - 不能丢失或乱序

✅ 文件传输（FTP、SFTP）
  - 文件完整性至关重要
  - 允许一定延迟

✅ 电子邮件（SMTP、IMAP）
  - 邮件内容不能丢失
  - 顺序重要

✅ 数据库连接
  - SQL 查询需要精确结果
  - 事务完整性

✅ 远程登录（SSH、Telnet）
  - 每个字符都要准确传输
  - 顺序不能乱
```

**3. UDP 适用场景：**

```text
低延迟容忍少量丢失的场景：
✅ 实时音视频（VoIP、视频会议）
  - 延迟敏感（>150ms 体验差）
  - 丢几帧画面影响不大
  - 重传比丢失更糟

✅ 在线游戏
  - 玩家位置每秒更新多次
  - 旧数据过期，新数据更重要
  - 低延迟优先

✅ 直播流媒体
  - 实时性要求高
  - 偶尔花屏可接受
  - 不能缓冲等待

✅ DNS 查询
  - 查询响应都小（<512 字节）
  - 单次请求单次响应
  - 失败可重试
```

**4. DNS 使用 UDP 的原因：**

```text
历史原因（1983 年设计）：
- 早期网络带宽有限
- UDP 头部开销小（8 字节 vs 20+ 字节）
- 减少服务器负载

技术原因：
1. 查询/响应结构简单
   - 一问一答，无需复杂状态
   - 大多数响应 < 512 字节（UDP 限制）

2. 低延迟需求
   - DNS 是基础设施，影响所有应用
   - 减少握手延迟（无三次握手）
   - 典型查询 < 50ms

3. 天然幂等
   - 查询无副作用
   - 超时重试简单
   - 可用多个 DNS 服务器

4. 广播/组播支持
   - 局域网 DNS 发现
   - mDNS（多播 DNS）
   - TCP 不支持广播
```

**5. DNS over TCP 的场景：**

```text
虽然 DNS 主要用 UDP，但以下情况用 TCP：

1. 响应超过 512 字节
   - 服务端返回 TC（Truncated）标志
   - 客户端重试 TCP 查询

2. 区域传输（Zone Transfer）
   - 主从 DNS 服务器同步
   - AXFR/IXFR 记录多
   - 必须用 TCP

3. DNSSEC
   - 签名数据大
   - 需要可靠传输

4. DNS over TCP 示例：
   dig +tcp example.com      # 强制 TCP
   nslookup -vc example.com  #  verbose + TCP
```

**6. 现代 DNS 演进：**

```text
DoT（DNS over TLS）：
- TCP + TLS 加密
- 端口 853
- 防止 DNS 窃听/篡改

DoH（DNS over HTTPS）：
- HTTPS 承载 DNS
- 端口 443（混入普通流量）
- 更难被审查/拦截

对比：
┌─────────┬──────┬──────┬──────────┐
│ 协议    │ 传输 │ 加密 │ 隐私性   │
├─────────┼──────┼──────┼──────────┤
│ DNS/UDP │ UDP  │ ❌   │ 无       │
│ DNS/TCP │ TCP  │ ❌   │ 无       │
│ DoT     │ TCP  │ ✅   │ 中       │
│ DoH     │ TCP  │ ✅   │ 高       │
└─────────┴──────┴──────┴──────────┘
```

**7. 应用层协议选择示例：**

```javascript
// 选择 TCP 的场景
await fetch('https://api.example.com/data');  // HTTP/HTTPS over TCP
ftp.download('file.zip');  // 文件必须完整

// 选择 UDP 的场景
webRTC.send(videoFrame);   // 实时视频，延迟敏感
game.updatePosition(x, y); // 游戏状态更新，旧数据可丢弃
dns.query('example.com');  // 简单查询，失败重试

// QUIC（HTTP/3）：结合 TCP 可靠 + UDP 低延迟
fetch('https://example.com');  // HTTP/3 over QUIC/UDP
// - 多路复用（像 HTTP/2）
// - 无队头阻塞
// - 更快握手
```

**8. 协议选择决策树：**

```text
应用需求分析：
              ┌──────────────┐
              │ 需要可靠传输？│
              └──────┬───────┘
                     │
        ┌────────────┼────────────┐
        │ Yes        │ No         │
        ▼            │            │
   ┌────────┐        │       ┌────────┐
   │ 需要顺序？│        │       │ 需要低延迟？│
   └────┬───┘        │       └────┬───┘
        │            │            │
   ┌────┴────┐      │      ┌─────┴─────┐
   │ Yes     │ No   │      │ Yes       │ No
   ▼         │      │      ▼           │
 用 TCP    用 TCP   │    用 UDP       用 TCP
           │      │
           ▼      ▼
      文件传输  实时流媒体
      邮件     游戏
```

**知识点：** `UDP` `TCP` `DNS` `协议选择` `可靠性` `延迟` `应用场景`

:::

