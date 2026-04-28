/**
 * 检索召回测试组件 - 增强版
 * 支持：单点测试、对比测试、历史记录
 */

class RetrievalTest {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      chunks: [],
      kbName: '',
      mode: 'single',
      onTest: () => {},
      ...options
    };
    this.config = {
      query: '',
      queryA: '',
      queryB: '',
      topK: 5,
      threshold: 0.6,
      scope: 'current' // current 或 all
    };
    this.results = [];
    this.resultsA = [];
    this.resultsB = [];
    this.isTesting = false;
    this.testHistory = [];
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const isCompare = this.options.mode === 'compare';
    this.container.innerHTML = `
      <div class="rt-wrapper">
        <!-- 头部 -->
        <div class="rt-header">
          <div class="rt-header-top">
            <span class="rt-title-icon">🔍</span>
            <span class="rt-title">${isCompare ? '对比测试' : '召回测试'}</span>
            ${this.options.kbName ? `<span class="rt-kb-tag">${this.options.kbName}</span>` : ''}
          </div>

        </div>

        <!-- 查询与配置区 -->
        <div class="rt-config-section ${isCompare ? '' : 'compact'}">
          ${isCompare ? this._renderCompareInputs() : this._renderSingleInput()}
        </div>

        <!-- 结果区域 -->
        <div class="rt-results-section expanded" id="rt-results-section">
          ${this.renderResults()}
        </div>
      </div>
    `;
  }

  _renderSingleInput() {
    return `
      <!-- Query 输入 -->
      <div class="rt-query-area">
        <label class="rt-label">
          <span class="rt-label-icon">💬</span> 测试 Query
        </label>
        <textarea class="rt-query-input" id="rt-query" rows="${this.options.compact ? 2 : 3}"
          placeholder="例如：sqlserver数据库有哪些性能指标？">${this.config.query || ''}</textarea>
      </div>

      <!-- 参数配置 -->
      <div class="rt-params-grid ${this.options.compact ? 'compact' : ''}">
        <div class="rt-param-card ${this.options.compact ? 'compact' : ''}">
          <div class="param-card-header">
            <span class="param-card-title">Top K: ${this.config.topK}</span>
            <span class="param-tooltip" data-tip="Top K：返回最相似的 K 条切片结果。取值范围 1-20，数值越大返回结果越多">?</span>
          </div>
          <input type="range" class="rt-slider" id="rt-topk" min="1" max="20" value="${this.config.topK}">
        </div>

        <div class="rt-param-card ${this.options.compact ? 'compact' : ''}">
          <div class="param-card-header">
            <span class="param-card-title">相似度: ${this.config.threshold.toFixed(2)}</span>
            <span class="param-tooltip" data-tip="相似度阈值：仅返回相似度高于此值的结果。取值范围 0-1，越接近 1 表示匹配越严格">?</span>
          </div>
          <input type="range" class="rt-slider" id="rt-threshold" min="0" max="1" step="0.05" value="${this.config.threshold}">
        </div>
      </div>

      <!-- 测试按钮 -->
      <button class="rt-test-btn" id="rt-test-btn">
        ${this.isTesting
          ? '<span class="rt-loading"></span> 正在检索...'
          : '<span class="rt-btn-icon">⚡</span> 开始测试'}
      </button>
    `;
  }

  _renderCompareInputs() {
    return `
      <!-- 左侧 Query -->
      <div class="rt-query-area">
        <label class="rt-label">
          <span class="rt-label-icon">💬</span> Query A
        </label>
        <textarea class="rt-query-input" id="rt-query-a" rows="2"
          placeholder="输入第一个查询词...">${this.config.queryA || ''}</textarea>
      </div>

      <!-- 右侧 Query -->
      <div class="rt-query-area">
        <label class="rt-label">
          <span class="rt-label-icon">💬</span> Query B
        </label>
        <textarea class="rt-query-input" id="rt-query-b" rows="2"
          placeholder="输入第二个查询词，对比召回差异...">${this.config.queryB || ''}</textarea>
      </div>

      <!-- 参数配置 -->
      <div class="rt-params-grid compact">
        <div class="rt-param-card compact">
          <div class="param-card-header">
            <span class="param-card-title">Top K: ${this.config.topK}</span>
            <span class="param-tooltip" data-tip="Top K：返回最相似的 K 条切片结果。取值范围 1-20">?</span>
          </div>
          <input type="range" class="rt-slider" id="rt-topk" min="1" max="20" value="${this.config.topK}">
        </div>

        <div class="rt-param-card compact">
          <div class="param-card-header">
            <span class="param-card-title">相似度: ${this.config.threshold.toFixed(2)}</span>
            <span class="param-tooltip" data-tip="相似度阈值：仅返回相似度高于此值的结果。取值范围 0-1">?</span>
          </div>
          <input type="range" class="rt-slider" id="rt-threshold" min="0" max="1" step="0.05" value="${this.config.threshold}">
        </div>
      </div>

      <!-- 测试按钮 -->
      <button class="rt-test-btn" id="rt-test-btn">
        ${this.isTesting
          ? '<span class="rt-loading"></span> 正在检索...'
          : '<span class="rt-btn-icon">⚡</span> 开始对比测试'}
      </button>
    `;
  }

  renderResults() {
    const isCompare = this.options.mode === 'compare';

    if (isCompare) {
      const hasA = this.resultsA && this.resultsA.length > 0;
      const hasB = this.resultsB && this.resultsB.length > 0;

      if (!hasA && !hasB) {
        return `
          <div class="rt-empty">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="35" cy="35" r="16" stroke="#d9d9d9" stroke-width="2.5"/>
              <path d="M50 50L65 65" stroke="#d9d9d9" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="35" cy="35" r="4" fill="#d9d9d9"/>
            </svg>
            <p class="rt-empty-title">开始对比召回测试</p>
            <p class="rt-empty-desc">在上方输入 Query A 和 Query B 后点击「开始对比测试」<br>系统将分别检索并展示两组召回结果</p>
          </div>
        `;
      }

      if (hasA && hasB) {
        return `
          <div class="rt-compare-layout">
            <div class="rtc-col">
              <div class="rtc-col-header">
                <span class="rtc-badge rtc-badge-a">Query A</span>
                <span class="rtc-count">${this.resultsA.length} 条召回</span>
              </div>
              <div class="rtc-list">
                ${this.resultsA.map((r, i) => this.renderResultCard(r, i, 'a')).join('')}
              </div>
            </div>
            <div class="rtc-divider"></div>
            <div class="rtc-col">
              <div class="rtc-col-header">
                <span class="rtc-badge rtc-badge-b">Query B</span>
                <span class="rtc-count">${this.resultsB.length} 条召回</span>
              </div>
              <div class="rtc-list">
                ${this.resultsB.map((r, i) => this.renderResultCard(r, i, 'b')).join('')}
              </div>
            </div>
          </div>
        `;
      }

      const results = hasA ? this.resultsA : this.resultsB;
      const label = hasA ? 'Query A' : 'Query B';
      return `
        <div class="rt-results-list">
          <div class="rtc-single-header">
            <span class="rtc-badge ${hasA ? 'rtc-badge-a' : 'rtc-badge-b'}">${label}</span>
            <span class="rtc-count">${results.length} 条召回</span>
          </div>
          ${results.map((r, i) => this.renderResultCard(r, i)).join('')}
        </div>
      `;
    } else {
      if (this.results.length === 0) {
        return `
          <div class="rt-empty">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="35" cy="35" r="16" stroke="#d9d9d9" stroke-width="2.5"/>
              <path d="M50 50L65 65" stroke="#d9d9d9" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="35" cy="35" r="4" fill="#d9d9d9"/>
            </svg>
            <p class="rt-empty-title">开始测试召回效果</p>
            <p class="rt-empty-desc">在上方输入查询问题后点击「开始测试」查看结果<br>系统将根据相似度从知识库中检索匹配的切片片段</p>
          </div>
        `;
      }

      return `
        <div class="rt-results-list">
          <div class="rt-results-header-bar">
            <div class="rt-results-info">
              <span class="rt-results-badge">${this.results.length} 条召回结果</span>
              <span class="rt-results-sort">按相似度降序排列</span>
            </div>
          </div>
          ${this.results.map((r, i) => this.renderResultCard(r, i)).join('')}
        </div>
      `;
    }
  }

  renderResultCard(result, index) {
    const score = result.score;
    const scoreColor = score >= 0.85 ? '#52c41a' : score >= 0.7 ? '#faad14' : '#ff4d4f';
    const scoreBg = score >= 0.85 ? '#f6ffed' : score >= 0.7 ? '#fffbe6' : '#fff1f0';
    const scoreLabel = score >= 0.85 ? '高度匹配' : score >= 0.7 ? '中度匹配' : '低度匹配';

    return `
      <div class="rt-result-card fade-in-up" style="animation-delay:${index * 60}ms;">
        <div class="rcard-header">
          <div class="rcard-rank">${index + 1}</div>
          <div class="rcard-meta">
            <span class="rcard-chunk-id">${result.chunkId}</span>
            ${result.kb ? `<span class="rcard-kb-tag">${result.kb}</span>` : ''}
            <span class="rcard-score-label" style="background:${scoreBg};color:${scoreColor};border:1px solid ${scoreColor}20;">${scoreLabel}</span>
          </div>
          <div class="rcard-score-box">
            <div class="rcard-score-ring" style="--score:${score};--color:${scoreColor}">
              <svg viewBox="0 0 36 36" class="ring-svg">
                <circle class="ring-bg" cx="18" cy="18" r="15.9"/>
                <circle class="ring-fill" cx="18" cy="18" r="15.9"
                  style="stroke-dasharray: ${(score * 100).toFixed(0)} 100;stroke:${scoreColor}"/>
              </svg>
              <span class="ring-text">${(score * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <div class="rcard-body" id="rc-body-${result.chunkId}" onclick="app.toggleRetrievalChunk('${result.chunkId}', this)">
          <div class="rcard-text-wrap">
            ${this.highlightContent(result.content, result.highlights)}
          </div>
          <div class="rcard-expand-hint">点击展开查看全部内容 ▾</div>
        </div>
        <div class="rcard-footer">
          <div class="rcard-stats">
            <span class="rs-item"><b>${result.content.length}</b> 字符</span>
            <span class="rs-sep">|</span>
            <span class="rs-item"><b>${Math.ceil(result.content.length / 1.8)}</b> tokens</span>
            <span class="rs-sep">|</span>
            <span class="rs-item">关键词: <b>${(result.highlights || []).length}</b></span>
          </div>
          <div class="rcard-actions">
            <button class="btn btn-text btn-sm rc-action-btn" data-copy="${result.chunkId}" onclick="app.copyRetrievalChunk(this, '${result.chunkId}')">
              📋 复制
            </button>
          </div>
        </div>
      </div>
    `;
  }

  highlightContent(content, highlights) {
    if (!highlights || highlights.length === 0) {
      return `<pre class="rcard-text">${this.escapeHtml(content)}</pre>`;
    }
    let escaped = this.escapeHtml(content);
    [...new Set(highlights)].forEach(kw => {
      const re = new RegExp(this.escapeRegex(kw), 'gi');
      escaped = escaped.replace(re, '<mark class="rt-highlight">$&</mark>');
    });
    return `<pre class="rcard-text">${escaped}</pre>`;
  }

  escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  bindEvents() {
    const isCompare = this.options.mode === 'compare';

    if (isCompare) {
      const qInputA = this.container.querySelector('#rt-query-a');
      if (qInputA) qInputA.addEventListener('input', e => this.config.queryA = e.target.value);

      const qInputB = this.container.querySelector('#rt-query-b');
      if (qInputB) qInputB.addEventListener('input', e => this.config.queryB = e.target.value);
    } else {
      const qInput = this.container.querySelector('#rt-query');
      if (qInput) qInput.addEventListener('input', e => this.config.query = e.target.value);
    }

    // Top K 滑块
    const tkSlider = this.container.querySelector('#rt-topk');
    const tkCard = this.container.querySelector('.param-card-title');
    if (tkSlider && tkCard) {
      tkSlider.addEventListener('input', e => {
        this.config.topK = parseInt(e.target.value);
        tkCard.textContent = `Top K: ${this.config.topK}`;
      });
    }

    // 阈值滑块
    const thSlider = this.container.querySelector('#rt-threshold');
    const thCard = this.container.querySelectorAll('.param-card-title')[1];
    if (thSlider && thCard) {
      thSlider.addEventListener('input', e => {
        this.config.threshold = parseFloat(e.target.value);
        thCard.textContent = `相似度: ${this.config.threshold.toFixed(2)}`;
      });
    }

    // 测试按钮
    const testBtn = this.container.querySelector('#rt-test-btn');
    if (testBtn) testBtn.addEventListener('click', () => this.runTest());

    // 检索范围选择
    const scopeSelect = this.container.querySelector('#rt-scope');
    if (scopeSelect) {
      scopeSelect.addEventListener('change', e => {
        this.config.scope = e.target.value;
      });
    }

    // Tooltip hover
    this.container.querySelectorAll('.param-tooltip').forEach(tip => {
      const text = tip.getAttribute('data-tip');
      tip.addEventListener('mouseenter', () => {
        let popup = tip.querySelector('.tooltip-popup');
        if (!popup) {
          popup = document.createElement('div');
          popup.className = 'tooltip-popup';
          popup.textContent = text;
          tip.appendChild(popup);
        }
        popup.style.opacity = '1';
        popup.style.visibility = 'visible';
      });
      tip.addEventListener('mouseleave', () => {
        const popup = tip.querySelector('.tooltip-popup');
        if (popup) {
          popup.style.opacity = '0';
          popup.style.visibility = 'hidden';
        }
      });
    });
  }

  async runTest() {
    const isCompare = this.options.mode === 'compare';
    const query = this.config.query.trim();
    const queryA = this.config.queryA.trim();
    const queryB = this.config.queryB.trim();

    if (isCompare) {
      if (!queryA && !queryB) {
        this.shakeElement(this.container.querySelector('#rt-query-a'));
        return;
      }
    } else {
      if (!query) {
        this.shakeElement(this.container.querySelector('#rt-query'));
        return;
      }
    }

    this.isTesting = true;
    this.render();
    this.bindEvents();

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    if (isCompare) {
      this.resultsA = queryA ? this.generateMockResults(queryA) : [];
      this.resultsB = queryB ? this.generateMockResults(queryB) : [];

      if (queryA) {
        this.testHistory.unshift({
          query: queryA,
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          count: this.resultsA.length,
          topK: this.config.topK,
          threshold: this.config.threshold
        });
      }
    } else {
      this.results = this.generateMockResults(query);
      this.testHistory.unshift({
        query: query,
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        count: this.results.length,
        topK: this.config.topK,
        threshold: this.config.threshold
      });
    }

    if (this.testHistory.length > 10) this.testHistory.pop();

    this.isTesting = false;
    this.render();
    this.bindEvents();

    if (this.options.onTest) {
      if (isCompare) {
        this.options.onTest({ queryA: this.resultsA, queryB: this.resultsB });
      } else {
        this.options.onTest(this.results);
      }
    }
  }

  generateMockResults(query) {
    const baseResults = [
      { chunkId: 'chunk-002', content: 'sqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 磁盘写入字节/秒 值 Disk Write Bytes/sec STRING\nsqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 缓冲区缓存命中率 值 Buffer cache hit ratio STRING\nsqlserver 数据库 sqlserver数据库指标 sqlserver指标 300 查询 建议删除 值 Query STRING', baseScore: 0.92, kb: 'doc_parse' },
      { chunkId: 'chunk-003', content: '中间件 中间件 minio监控指标 minio指标 300 等待复制对象数 值 minio_cluster_replication_max_queued_count DOUBLE\n中间件 中间件 minio监控指标 minio指标 300 扫描的目录总数 值 minio_node_scanner_directories_scanned DOUBLE\n中间件 中间件 zookeeper监控指标 zookeeper指标 300 服务端连接数 值 zookeeper_connections INT', baseScore: 0.85, kb: 'doc_parse' },
      { chunkId: 'chunk-005', content: '指标 300 当前处于等待状态的连接数 当前等待连接数 个 值 waiting DOUBLE\n中间件 中间件 nginx监控指标 nginx指标 300 当前正在读取客户端请求的连接数 当前读取请求头数量 个 值 reading DOUBLE\n中间件 中间件 nginx监控指标 nginx指标 300 正在向客户端写入响应的连接数 当前向客户端写入响应的数量 个 值 writing DOUBLE', baseScore: 0.78, kb: 'doc_parse' },
      { chunkId: 'chunk-006', content: '中间件 中间件 mysql监控指标 mysql指标 300 排序算法执行的合并次数 建议删除 值 sort_merge_passes DOUBLE\n中间件 中间件 mysql监控指标 mysql指标 300 服务器启动时间(等于0代表重启) 值 uptime LONG\n中间件 中间件 mysql监控指标 mysql指标 300 磁盘临时表创建数量 值 created_tmp_tables LONG', baseScore: 0.71, kb: 'doc_parse' },
      { chunkId: 'chunk-007', content: 'mongodb 数据库 Mongodb数据库指标 mongodb指标 300 MongoDB实例启动时长 值 uptime INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 assert的s 值 asserts.mongo INT\nmongodb 数据库 Mongodb数据库指标 mongodb指标 300 opcounters.commandopc INT', baseScore: 0.65, kb: 'doc_parse' },
      { chunkId: 'chunk-101', content: '# 智能运维指标体系概述\n\n本知识库收录了企业IT基础设施运维过程中涉及的各类监控指标，包括但不限于：\n\n## 1. 服务器硬件指标\n- CPU使用率、内存利用率、磁盘I/O、网络流量\n- 温度、风扇转速、电源状态等物理指标\n\n## 2. 数据库指标\n- MySQL/PostgreSQL/SQL Server/MongoDB/Redis 等主流数据库的性能指标', baseScore: 0.88, kb: '智能运维指标体系' },
      { chunkId: 'chunk-201', content: '# 金融风控知识体系\n\n## 1. 风险评估模型\n- 信用评分模型\n- 反欺诈检测算法\n- 风险阈值设定\n\n## 2. 监控指标\n- 交易异常检测\n- 账户行为分析\n- 实时风险预警', baseScore: 0.85, kb: '金融风控知识' },
      { chunkId: 'chunk-301', content: '# 医疗知识库\n\n## 1. 临床指标\n- 生命体征监测\n- 实验室检查指标\n- 影像诊断标准\n\n## 2. 疾病管理\n- 慢性病管理指标\n- 治疗效果评估\n- 康复追踪指标', baseScore: 0.82, kb: '医疗知识库' }
    ];

    return baseResults
      .map((br, i) => ({
        id: `result-${String(i + 1).padStart(3, '0')}`,
        chunkId: br.chunkId,
        content: br.content,
        score: Math.max(0.3, br.baseScore - (Math.random() * 0.08)),
        highlights: this.extractKeywords(query),
        kb: br.kb
      }))
      .filter(r => {
        if (this.config.scope === 'current' && this.options.kbName) {
          return r.kb === this.options.kbName;
        }
        return true;
      })
      .filter(r => r.score >= this.config.threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.topK);
  }

  extractKeywords(query) {
    const keywords = [];
    const stopWords = ['的','了','在','是','我','有','和','就','不','人','都','一','一个','上','也','很','到','说','要','去','你','会','着','没有','看','好','自己','这','那','这些','哪些','什么','怎么','如何','哪','吗','呢','吧','啊','呀'];
    for (let len = 6; len >= 2; len--) {
      for (let i = 0; i <= query.length - len; i++) {
        const w = query.substr(i, len);
        if (!stopWords.includes(w) && !keywords.includes(w)) keywords.push(w);
      }
    }
    return keywords.slice(0, 6);
  }

  shakeElement(el) {
    if (!el) return;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => el.style.animation = '', 400);
  }

  setChunks(chunks) { this.options.chunks = chunks; }
  setKBName(name) { this.options.kbName = name; }
  setQuery(query) { this.config.query = query; }
  clearHistory() { this.testHistory = []; }
  getConfig() { return { ...this.config }; }
  getResults() {
    if (this.options.mode === 'compare') {
      return { queryA: [...this.resultsA], queryB: [...this.resultsB] };
    }
    return [...this.results];
  }
  getHistory() { return [...this.testHistory]; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RetrievalTest;
}
