/**
 * Mock 数据 - RAG 知识库全链路管理系统
 * 支持完整的 解析-切片-召回 演示流程
 */

var categories = [
  { id: 'all', name: '全部', count: 8 },
  {
    id: 'finance',
    name: '金融领域',
    count: 3,
    children: [
      { id: 'finance-risk', name: '风控', count: 1 },
      { id: 'finance-investment', name: '投资', count: 2 }
    ]
  },
  {
    id: 'medical',
    name: '医疗领域',
    count: 1,
    children: [
      { id: 'medical-clinical', name: '临床', count: 1 }
    ]
  },
  { id: 'legal', name: '法律领域', count: 1 },
  { id: 'education', name: '教育领域', count: 1 },
  { id: 'technology', name: '科技领域', count: 1 },
  { id: 'test', name: '测试', count: 1, children: [{ id: 'test-1', name: '测试1', count: 1 }] }
];

var knowledgeBases = [
  {
    id: 'kb-001',
    name: '智能运维指标体系',
    description: '包含服务器、数据库、中间件等各类运维监控指标的完整知识库，支持故障诊断和性能分析',
    category: 'technology',
    categoryName: '科技领域',
    docCount: 12,
    chunkCount: 156,
    status: 'active',
    createTime: '2025-03-15 09:30:00',
    updateTime: '2025-04-01 10:19:30',
    config: {
      parser: 'enhanced',
      parserName: '增强解析',
      chunkStrategy: 'semantic',
      chunkStrategyName: '自动分段（按语义）',
      chunkSize: 512,
      overlap: 50,
      separators: ['\n\n', '###'],
      embeddingModel: 'bge-large-zh',
      embeddingModelName: 'BGE-Large-ZH (1024维)',
      vectorDB: 'milvus',
      vectorDBName: 'Milvus'
    }
  },
  {
    id: 'kb-002',
    name: '金融产品手册',
    description: '银行理财产品、基金、保险等金融产品的详细说明文档集合',
    category: 'finance',
    categoryName: '金融领域',
    docCount: 18,
    chunkCount: 298,
    status: 'active',
    createTime: '2025-03-10 14:20:00',
    updateTime: '2025-04-01 10:19:05',
    config: {
      parser: 'layout',
      parserName: 'Layout解析',
      chunkStrategy: 'structured',
      chunkStrategyName: '文档结构化切分',
      chunkSize: 1024,
      overlap: 100,
      separators: ['\n\n', '###', '---'],
      embeddingModel: 'openai-text-embedding-3',
      embeddingModelName: 'OpenAI text-embedding-3 (1536维)',
      vectorDB: 'pgvector',
      vectorDBName: 'PGVector'
    }
  },
  {
    id: 'kb-003',
    name: '企业规章制度汇编',
    description: '公司内部管理制度、流程规范、操作手册等文档的集中管理',
    category: 'test',
    categoryName: '测试',
    docCount: 25,
    chunkCount: 420,
    status: 'active',
    createTime: '2025-02-28 16:45:00',
    updateTime: '2025-04-01 10:18:43',
    config: {
      parser: 'general',
      parserName: '通用解析',
      chunkStrategy: 'recursive',
      chunkStrategyName: '递归字符切分',
      chunkSize: 256,
      overlap: 25,
      separators: ['\n\n', '\n'],
      embeddingModel: 'm3e-base',
      embeddingModelName: 'M3E-Base (768维)',
      vectorDB: 'milvus',
      vectorDBName: 'Milvus'
    }
  },
  {
    id: 'kb-004',
    name: '医疗临床指南',
    description: '常见疾病诊疗指南、用药规范、护理标准等医学知识库',
    category: 'medical',
    categoryName: '医疗领域',
    docCount: 8,
    chunkCount: 134,
    status: 'active',
    createTime: '2025-03-20 11:00:00',
    updateTime: '2025-03-19 16:26:52',
    config: {
      parser: 'enhanced',
      parserName: '增强解析',
      chunkStrategy: 'semantic',
      chunkStrategyName: '自动分段（按语义）',
      chunkSize: 768,
      overlap: 75,
      separators: ['\n\n', '###'],
      embeddingModel: 'bge-large-zh',
      embeddingModelName: 'BGE-Large-ZH (1024维)',
      vectorDB: 'qdrant',
      vectorDBName: 'Qdrant'
    }
  },
  {
    id: 'kb-005',
    name: '法律法规知识库',
    description: '国家法律法规、行业规范、合同模板等法律文档管理',
    category: 'legal',
    categoryName: '法律领域',
    docCount: 15,
    chunkCount: 267,
    status: 'active',
    createTime: '2025-03-05 09:15:00',
    updateTime: '2025-03-06 11:57:27',
    config: {
      parser: 'layout',
      parserName: 'Layout解析',
      chunkStrategy: 'identifier',
      chunkStrategyName: '基于标识符切分',
      chunkSize: 512,
      overlap: 50,
      identifierPattern: '第[一二三四五六七八九十百千]+条|Article\\s*\\d+',
      embeddingModel: 'openai-text-embedding-ada-002',
      embeddingModelName: 'OpenAI Ada-002 (1536维)',
      vectorDB: 'weaviate',
      vectorDBName: 'Weaviate'
    }
  },
  {
    id: 'kb-006',
    name: '教育培训资料',
    description: '课程讲义、培训材料、考试题库等教育资源管理',
    category: 'education',
    categoryName: '教育领域',
    docCount: 20,
    chunkCount: 312,
    status: 'active',
    createTime: '2025-02-20 14:30:00',
    updateTime: '2025-03-05 15:26:51',
    config: {
      parser: 'general',
      parserName: '通用解析',
      chunkStrategy: 'recursive',
      chunkStrategyName: '递归字符切分',
      chunkSize: 384,
      overlap: 40,
      separators: ['\n\n', '\n', '。'],
      embeddingModel: 'bge-base-zh',
      embeddingModelName: 'BGE-Base-ZH (768维)',
      vectorDB: 'pgvector',
      vectorDBName: 'PGVector'
    }
  },
  {
    id: 'kb-007',
    name: 'API接口文档中心',
    description: '系统各模块API接口说明、调用示例、错误码定义等技术文档',
    category: 'technology',
    categoryName: '科技领域',
    docCount: 30,
    chunkCount: 489,
    status: 'active',
    createTime: '2025-01-10 10:00:00',
    updateTime: '2025-04-02 08:30:00',
    config: {
      parser: 'layout',
      parserName: 'Layout解析',
      chunkStrategy: 'structured',
      chunkStrategyName: '文档结构化切分',
      chunkSize: 600,
      overlap: 60,
      separators: ['\n\n', '###', '---'],
      embeddingModel: 'm3e-large',
      embeddingModelName: 'M3E-Large (1024维)',
      vectorDB: 'milvus',
      vectorDBName: 'Milvus'
    }
  },
  {
    id: 'kb-008',
    name: '风控规则引擎',
    description: '反欺诈规则、信用评分模型、风险预警策略等风控相关知识',
    category: 'finance',
    categoryName: '金融领域',
    docCount: 10,
    chunkCount: 178,
    status: 'active',
    createTime: '2025-03-25 16:00:00',
    updateTime: '2025-04-01 17:45:00',
    config: {
      parser: 'enhanced',
      parserName: '增强解析',
      chunkStrategy: 'semantic',
      chunkStrategyName: '自动分段（按语义）',
      chunkSize: 512,
      overlap: 50,
      separators: ['\n\n', '###'],
      embeddingModel: 'bge-large-zh',
      embeddingModelName: 'BGE-Large-ZH (1024维)',
      vectorDB: 'milvus',
      vectorDBName: 'Milvus'
    }
  }
];

var documents = {
  'kb-001': [
    {
      id: 'doc-001',
      name: '智能运维指标体系_20240525153922.pdf',
      format: 'pdf',
      size: '1.80MB',
      status: 'success',
      chunkCount: 24,
      uploadTime: '2025-04-01 14:24:27',
      parseTime: '2025-04-01 14:25:03',
      parser: 'enhanced',
      chunkConfig: { strategy: 'semantic', chunkSize: 512, overlap: 50 }
    },
    {
      id: 'doc-002',
      name: '终端导入.xlsx',
      format: 'excel',
      size: '35.50KB',
      status: 'success',
      chunkCount: 18,
      uploadTime: '2025-04-01 14:24:27',
      parseTime: '2025-04-01 14:24:45',
      parser: 'general',
      chunkConfig: { strategy: 'recursive', chunkSize: 256, overlap: 25 }
    },
    {
      id: 'doc-003',
      name: '指标组和指标整理-修正版.xlsx',
      format: 'excel',
      size: '423.37KB',
      status: 'success',
      chunkCount: 32,
      uploadTime: '2025-04-01 14:24:26',
      parseTime: '2025-04-01 14:25:12',
      parser: 'general',
      chunkConfig: { strategy: 'recursive', chunkSize: 256, overlap: 25 }
    },
    {
      id: 'doc-004',
      name: '指标开发平台接口文档v0.2.xlsx',
      format: 'excel',
      size: '3.31MB',
      status: 'success',
      chunkCount: 28,
      uploadTime: '2025-04-01 14:24:26',
      parseTime: '2025-04-01 14:25:30',
      parser: 'layout',
      chunkConfig: { strategy: 'structured', chunkSize: 600, overlap: 60 }
    },
    {
      id: 'doc-005',
      name: '附件1：告警软件-员工操作手册20201117.pptx',
      format: 'pptx',
      size: '5.21MB',
      status: 'success',
      chunkCount: 45,
      uploadTime: '2025-04-01 14:24:26',
      parseTime: '2025-04-01 14:26:15',
      parser: 'enhanced',
      chunkConfig: { strategy: 'semantic', chunkSize: 512, overlap: 50 }
    },
    {
      id: 'doc-006',
      name: 'Nginx配置最佳实践.docx',
      format: 'word',
      size: '890.50KB',
      status: 'processing',
      chunkCount: 0,
      uploadTime: '2025-04-02 09:15:00',
      parseTime: null,
      progress: 65,
      parser: 'general',
      chunkConfig: { strategy: 'recursive', chunkSize: 384, overlap: 40 }
    },
    {
      id: 'doc-007',
      name: 'Kubernetes集群部署指南.pdf',
      format: 'pdf',
      size: '12.34MB',
      status: 'pending',
      chunkCount: 0,
      uploadTime: '2025-04-02 10:30:00',
      parseTime: null,
      progress: 0,
      parser: 'layout',
      chunkConfig: { strategy: 'structured', chunkSize: 768, overlap: 75 }
    },
    {
      id: 'doc-008',
      name: 'Docker容器化实践.md',
      format: 'md',
      size: '156.78KB',
      status: 'error',
      chunkCount: 0,
      uploadTime: '2025-04-02 11:00:00',
      parseTime: '2025-04-02 11:00:15',
      errorMsg: '文件编码格式不支持，请转换为 UTF-8 格式后重新上传',
      parser: 'general',
      chunkConfig: { strategy: 'recursive', chunkSize: 256, overlap: 25 }
    },
    {
      id: 'doc-009',
      name: 'Prometheus监控配置.txt',
      format: 'txt',
      size: '45.20KB',
      status: 'success',
      chunkCount: 12,
      uploadTime: '2025-04-01 16:20:00',
      parseTime: '2025-04-01 16:20:20',
      parser: 'general',
      chunkConfig: { strategy: 'identifier', chunkSize: 512, overlap: 50 }
    },
    {
      id: 'doc-010',
      name: 'Grafana仪表盘设计规范.pdf',
      format: 'pdf',
      size: '2.15MB',
      status: 'success',
      chunkCount: 19,
      uploadTime: '2025-04-01 17:45:00',
      parseTime: '2025-04-01 17:45:35',
      parser: 'layout',
      chunkConfig: { strategy: 'structured', chunkSize: 512, overlap: 50 }
    },
    {
      id: 'doc-011',
      name: 'ELK日志分析平台搭建手册.docx',
      format: 'word',
      size: '1.56MB',
      status: 'success',
      chunkCount: 36,
      uploadTime: '2025-03-28 14:00:00',
      parseTime: '2025-03-28 14:01:20',
      parser: 'enhanced',
      chunkConfig: { strategy: 'semantic', chunkSize: 512, overlap: 50 }
    },
    {
      id: 'doc-012',
      name: 'Zabbix告警规则配置表.xlsx',
      format: 'excel',
      size: '128.90KB',
      status: 'success',
      chunkCount: 15,
      uploadTime: '2025-03-27 10:30:00',
      parseTime: '2025-03-27 10:30:45',
      parser: 'general',
      chunkConfig: { strategy: 'recursive', chunkSize: 256, overlap: 25 }
    }
  ],
  'kb-002': [
    {
      id: 'doc-101',
      name: '银行理财产品说明书_2025版.pdf',
      format: 'pdf',
      size: '3.45MB',
      status: 'success',
      chunkCount: 42,
      uploadTime: '2025-03-28 09:00:00',
      parseTime: '2025-03-28 09:01:30'
    },
    {
      id: 'doc-102',
      name: '基金投资指南_v3.2.docx',
      format: 'word',
      size: '2.10MB',
      status: 'success',
      chunkCount: 35,
      uploadTime: '2025-03-27 14:30:00',
      parseTime: '2025-03-27 14:32:00'
    },
    {
      id: 'doc-103',
      name: '保险条款汇总_人身险篇.pdf',
      format: 'pdf',
      size: '8.90MB',
      status: 'processing',
      chunkCount: 0,
      uploadTime: '2025-04-02 08:00:00',
      progress: 42
    }
  ]
};

var chunks = {
  'doc-003': [
    {
      id: 'chunk-001',
      index: 1,
      content: 'Sheet1\n指标组类型 | 指标组类型编码 | 指标组名称 | 指标组名称修改 | 粒度 | 属性名称 | 名称修改 | 备注 | 属性单位 | 属性类型 | 属性字段 | 字段类型\n性能 | 性能系统 | 性能系统性能指标 | 设备性能指标 | 300 | 运行时间 | 服务器运行时间 | 服务器运行时间(小时) | 小时 | 值 | uptime_hour | DOUBLE\n性能 | 性能系统 | 性能系统性能指标 | 设备性能指标 | 300 | 正常运行时间 | 启动时间(等于0代表重启) | 值 | uptime | LONG',
      charCount: 234,
      tokenCount: 132
    },
    {
      id: 'chunk-002',
      index: 2,
      content: 'sqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 磁盘写入字节/秒 值 Disk Write Bytes/sec STRING\nsqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 缓冲区缓存命中率 值 Buffer cache hit ratio STRING\nsqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 查询 建议删除 值 Query STRING\nsqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 写磁盘IO/s 值 Disk Write IO/sec STRING',
      charCount: 245,
      tokenCount: 140
    },
    {
      id: 'chunk-003',
      index: 3,
      content: '中间件 中间件 minio监控指标 minio指标 300 等待复制对象数 值 minio_cluster_replication_max_queued_count DOUBLE\n中间件 中间件 minio监控指标 minio指标 300 扫描的目录总数 值 minio_node_scanner_directories_scanned DOUBLE\n中间件 中间件 zookeeper监控指标 zookeeper指标 300 服务端连接数 值 zookeeper_connections INT\n中间件 中间件 zookeeper监控指标 zookeeper指标 300 Watch数量 值 zookeeper_watch_count INT',
      charCount: 280,
      tokenCount: 160
    },
    {
      id: 'chunk-004',
      index: 4,
      content: '性能 中间件 node监控指标 node指标 300 最大客户端连接数 值 maxclients DOUBLE\n性能 中间件 node监控指标 node指标 300 正常运行时间 启动时间(等于0代表重启) 值 uptime LONG\n性能 中间件 node监控指标 node指标 300 配置设置的最大可用内存值，默认0，不限制 值 maxmemory DOUBLE\n性能 中间件 node监控指标 node指标 300 已使用内存 值 used_memory DOUBLE',
      charCount: 218,
      tokenCount: 124
    },
    {
      id: 'chunk-005',
      index: 5,
      content: '指标 300 当前处于等待状态的连接数 当前等待连接数 个 值 waiting DOUBLE\n中间件 中间件 nginx监控指标 nginx指标 300 当前正在读取客户端请求的连接数 当前读取请求头数量 个 值 reading DOUBLE\n中间件 中间件 nginx监控指标 nginx指标 300 正在向客户端写入响应的连接数 当前向客户端写入响应的数量 个 值 writing DOUBLE\n中间件 中间件 nginx监控指标 nginx指标 300 空闲客户端连接数（waiting） 个 值 waiting DOUBLE',
      charCount: 290,
      tokenCount: 165
    },
    {
      id: 'chunk-006',
      index: 6,
      content: '中间件 中间件 mysql监控指标 mysql指标 300 排序算法执行的合并次数 建议删除 值 sort_merge_passes DOUBLE\n中间件 中间件 mysql监控指标 mysql指标 300 服务器启动时间(等于0代表重启) 值 uptime LONG\n中间件 中间件 mysql监控指标 mysql指标 300 磁盘临时表创建数量 值 created_tmp_tables LONG\n中间件 中间件 mysql监控指标 mysql指标 300 数据库当前已用空间 采集方式待定 KB 值 dbsize INT',
      charCount: 276,
      tokenCount: 157
    },
    {
      id: 'chunk-007',
      index: 7,
      content: 'mongodb 数据库 Mongodb数据库指标 mongodb指标 300 MongoDB实例启动时长 值 uptime INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 assert的s 值 asserts.mongo INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.commandopc INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.delete INT',
      charCount: 198,
      tokenCount: 113
    },
    {
      id: 'chunk-008',
      index: 8,
      content: 'opcounters.commandopc INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.delete INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 metrics.document.deletedps INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.insert INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.query INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.update INT',
      charCount: 235,
      tokenCount: 134
    },
    {
      id: 'chunk-009',
      index: 9,
      content: 'Redis 缓存 redis监控指标 redis指标 300 已使用内存 值 used_memory_human STRING\nRedis 缓存 redis监控指标 redis指标 300 内存碎片率 值 mem_fragmentation_ratio DOUBLE\nRedis 缓存 redis监控指标 redis指标 300 连接客户端数 值 connected_clients INT\nRedis 缓存 redis监控指标 redis指标 300 每秒执行命令数 值 instantaneous_ops_per_sec INT',
      charCount: 218,
      tokenCount: 124
    }
  ],
  'doc-001': [
    {
      id: 'chunk-101',
      index: 1,
      content: '# 智能运维指标体系概述\n\n本知识库收录了企业IT基础设施运维过程中涉及的各类监控指标，包括但不限于：\n\n## 1. 服务器硬件指标\n- CPU使用率、内存利用率、磁盘I/O、网络流量\n- 温度、风扇转速、电源状态等物理指标\n\n## 2. 数据库指标\n- MySQL/PostgreSQL/SQL Server/MongoDB/Redis 等主流数据库的性能指标\n- 连接数、查询响应时间、慢查询统计、缓存命中率等\n\n## 3. 中间件指标\n- Nginx/Tomcat/Node.js/Zookeeper/Kafka 等中间件的运行状态\n- 请求量、响应时间、错误率、队列深度等',
      charCount: 312,
      tokenCount: 178
    },
    {
      id: 'chunk-102',
      index: 2,
      content: '# 指标采集规范\n\n## 数据采集频率\n- **实时指标**：采集间隔 ≤ 10秒（如CPU、内存）\n- **准实时指标**：采集间隔 30秒~1分钟（如磁盘I/O）\n- **周期性指标**：采集间隔 ≥ 5分钟（如日志分析）\n\n## 数据存储要求\n- 原始数据保留周期：≥ 30天\n- 聚合数据保留周期：≥ 1年\n- 支持的数据格式：JSON、Prometheus、InfluxDB Line Protocol\n\n## 告警阈值设定原则\n- 基于 P95/P99 分位数设定警告阈值\n- 考虑业务时段差异，支持多时段阈值配置',
      charCount: 328,
      tokenCount: 187
    }
  ]
};

var retrievalResults = [
  {
    id: 'result-001',
    chunkId: 'chunk-002',
    content: 'sqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 磁盘写入字节/秒 值 Disk Write Bytes/sec STRING\nsqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 缓冲区缓存命中率 值 Buffer cache hit ratio STRING\nsqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 查询 建议删除 值 Query STRING',
    score: 0.92,
    highlights: ['sqlserver', '数据库', '指标']
  },
  {
    id: 'result-002',
    chunkId: 'chunk-003',
    content: '中间件 中间件 minio监控指标 minio指标 300 等待复制对象数 值 minio_cluster_replication_max_queued_count DOUBLE\n中间件 中间件 minio监控指标 minio指标 300 扫描的目录总数 值 minio_node_scanner_directories_scanned DOUBLE\n中间件 中间件 zookeeper监控指标 zookeeper指标 300 服务端连接数 值 zookeeper_connections INT',
    score: 0.85,
    highlights: ['minio', '监控', '指标']
  },
  {
    id: 'result-003',
    chunkId: 'chunk-005',
    content: '指标 300 当前处于等待状态的连接数 当前等待连接数 个 值 waiting DOUBLE\n中间件 中间件 nginx监控指标 nginx指标 300 当前正在读取客户端请求的连接数 当前读取请求头数量 个 值 reading DOUBLE\n中间件 中间件 nginx监控指标 nginx指标 300 正在向客户端写入响应的连接数 当前向客户端写入响应的数量 个 值 writing DOUBLE',
    score: 0.78,
    highlights: ['nginx', '监控', '连接数']
  },
  {
    id: 'result-004',
    chunkId: 'chunk-006',
    content: '中间件 中间件 mysql监控指标 mysql指标 300 排序算法执行的合并次数 建议删除 值 sort_merge_passes DOUBLE\n中间件 中间件 mysql监控指标 mysql指标 300 服务器启动时间(等于0代表重启) 值 uptime LONG\n中间件 中间件 mysql监控指标 mysql指标 300 磁盘临时表创建数量 值 created_tmp_tables LONG',
    score: 0.71,
    highlights: ['mysql', '监控', '指标']
  },
  {
    id: 'result-005',
    chunkId: 'chunk-007',
    content: '库中的数据量 值 data_size STRING\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 MongoDB实例启动时长 值 uptime INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 assert的s 值 asserts.mongo INT',
    score: 0.65,
    highlights: ['mongodb', '数据库', '指标']
  },
  {
    id: 'result-006',
    chunkId: 'chunk-008',
    content: 'opcounters.commandopc INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.delete INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 metrics.document.deletedps INT',
    score: 0.58,
    highlights: ['mongodb', '指标']
  },
  {
    id: 'result-007',
    chunkId: 'chunk-009',
    content: 'Redis 缓存 redis监控指标 redis指标 300 已使用内存 值 used_memory_human STRING\nRedis 缓存 redis监控指标 redis指标 300 内存碎片率 值 mem_fragmentation_ratio DOUBLE\nRedis 缓存 redis监控指标 redis指标 300 连接客户端数 值 connected_clients INT',
    score: 0.52,
    highlights: ['redis', '缓存', '内存']
  }
];

var parserOptions = [
  { value: 'general', label: '通用解析', desc: '适用于大多数文档类型，平衡解析速度与准确性', icon: '📄' },
  { value: 'enhanced', label: '增强解析', desc: '使用OCR和AI增强识别，适合扫描件和复杂排版文档', icon: '✨' },
  { value: 'layout', label: 'Layout解析', desc: '保留文档原始布局结构，适合表格和图文混排文档', icon: '📐' }
];

var embeddingModels = [
  { value: 'openai-text-embedding-3', label: 'OpenAI text-embedding-3', dim: 1536, provider: 'OpenAI', desc: '最新一代嵌入模型，支持多语言' },
  { value: 'openai-text-embedding-ada-002', label: 'OpenAI Ada-002', dim: 1536, provider: 'OpenAI', desc: '经典稳定版本，广泛用于生产环境' },
  { value: 'bge-large-zh', label: 'BGE-Large-ZH', dim: 1024, provider: 'BAAI', desc: '中文大模型，中文场景效果优异' },
  { value: 'bge-base-zh', label: 'BGE-Base-ZH', dim: 768, provider: 'BAAI', desc: '中文基础模型，速度快效果好' },
  { value: 'm3e-base', label: 'M3E-Base', dim: 768, provider: 'M3E', desc: '中英双语基础模型' },
  { value: 'm3e-large', label: 'M3E-Large', dim: 1024, provider: 'M3E', desc: '中英双语大模型，精度更高' }
];

var vectorDBOptions = [
  { value: 'milvus', label: 'Milvus', desc: '高性能分布式向量数据库，支持十亿级向量检索', icon: '🗄️' },
  { value: 'pgvector', label: 'PGVector', desc: 'PostgreSQL原生向量扩展，与关系数据无缝整合', icon: '🐘' },
  { value: 'qdrant', label: 'Qdrant', desc: ' Rust编写的高性能向量搜索引擎，过滤能力强', icon: '🔍' },
  { value: 'weaviate', label: 'Weaviate', desc: '开源认知搜索平台，支持多模态数据', icon: '🧠' }
];

var separatorOptions = [
  { value: '\n\n', label: '双换行 (段落分隔)' },
  { value: '\n', label: '单换行 (行分隔)' },
  { value: '###', label: '### (Markdown标题)' },
  { value: '---', label: '--- (水平分隔线)' },
  { value: '。', label: '。 (句号)' },
  { value: '；', label: '； (分号)' },
  { value: '，', label: '， (逗号)' }
];

var chunkStrategies = [
  {
    value: 'semantic',
    label: '自动分段（按语义）',
    desc: '利用AI语义理解能力，智能识别文档中的自然段落边界进行分段',
    icon: '🧠',
    params: ['chunkSize', 'overlap'],
    hint: '推荐用于：文章、报告、说明书等具有清晰语义结构的文本'
  },
  {
    value: 'identifier',
    label: '基于标识符切分',
    desc: '按照指定的标识符模式（如章节号、条款号）进行精确切分',
    icon: '🏷️',
    params: ['chunkSize', 'overlap', 'identifierPattern'],
    hint: '推荐用于：法律法规、技术规范、API文档等有明确编号的文档'
  },
  {
    value: 'recursive',
    label: '递归字符切分',
    desc: '按优先级尝试多种分隔符，递归地将文本分割为符合长度要求的块',
    icon: '🔄',
    params: ['chunkSize', 'overlap', 'separators'],
    hint: '推荐用于：代码文件、日志数据、CSV等结构化程度较低的文本'
  },
  {
    value: 'structured',
    label: '文档结构化切分',
    desc: '识别文档的标题层级结构，按章节/小节等逻辑单元进行切分',
    icon: '📑',
    params: ['chunkSize', 'overlap', 'separators'],
    hint: '推荐用于：Markdown、HTML、富文本文档等有明确层级结构的文本'
  }
];

if (typeof window !== 'undefined') {
  window.categories = categories;
  window.knowledgeBases = knowledgeBases;
  window.documents = documents;
  window.chunks = chunks;
  window.retrievalResults = retrievalResults;
  window.parserOptions = parserOptions;
  window.embeddingModels = embeddingModels;
  window.vectorDBOptions = vectorDBOptions;
  window.separatorOptions = separatorOptions;
  window.chunkStrategies = chunkStrategies;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    categories,
    knowledgeBases,
    documents,
    chunks,
    retrievalResults,
    parserOptions,
    embeddingModels,
    vectorDBOptions,
    separatorOptions,
    chunkStrategies
  };
}
