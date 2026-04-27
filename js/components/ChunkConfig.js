/**
 * 切片规则配置组件 - 策略差异化版 v2
 * 
 * 4种策略的参数完全不同：
 * - semantic:    仅 Max Length（语义断句无需Overlap）
 * - identifier:  主分隔符 + 处理策略（保留/丢弃），无Overlap
 * - recursive:   ChunkSize + Overlap + 分隔符优先级（经典模式）
 * - structured:  分段层级(H1~H4) + 上下文追加（层级感）
 * 
 * 预览图也随策略变化：
 * - semantic:    干净无重叠的色块
 * - identifier:  等高干净色块，按标识符断开
 * - recursive:   黄色重叠块（唯一有Overlap的模式）
 * - structured:  层级缩进的树状切片
 */

class ChunkConfig {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = { onChange: () => {}, ...options };
    this.config = {
      strategy: 'semantic',
      chunkSize: 512,
      overlap: 50,
      maxLength: 1024,
      separators: ['\n\n', '###'],
      primaryDelimiter: '',
      delimiterStrategy: 'discard',
      identifierPattern: '',
      headingLevel: 2,
      appendParentHeading: true
    };
    this.strategies = window.chunkStrategies || [];
    this.separatorOptions = window.separatorOptions || [];
    this.init();
  }

  init() { this.render(); this.bindEvents(); }

  render() {
    const strategies = this.strategies;
    this.container.innerHTML = `
      <div class="chunk-config-wrapper">
        <div class="cc-section">
          <label class="cc-section-label"><span class="cc-label-icon">⚙️</span>切片策略</label>
          <div class="strategy-grid" id="strategy-grid">
            ${strategies.map(s => `
              <div class="strategy-card ${this.config.strategy === s.value ? 'active' : ''}" data-strategy="${s.value}">
                <div class="strategy-card-icon">${s.icon}</div>
                <div class="strategy-card-title">${s.label}</div>
                <div class="strategy-card-desc">${s.desc}</div>
                ${this.config.strategy === s.value ? '<div class="strategy-check">✓</div>' : ''}
              </div>
            `).join('')}
          </div>
          <div class="strategy-hint" id="strategy-hint">${this.getCurrentStrategyHint()}</div>
        </div>

        <div class="cc-params-section" id="params-section">${this.renderParams()}</div>

        <div class="cc-diagram-section">
          <label class="cc-section-label"><span class="cc-label-icon">📊</span>切片效果预览</label>
          <div class="diagram-box" id="chunk-diagram">${this.renderDiagram()}</div>
        </div>
      </div>
    `;
  }

  getCurrentStrategyHint() {
    const s = this.strategies.find(st => st.value === this.config.strategy);
    return s ? s.hint : '';
  }

  // ==================== 参数渲染：4种策略各自独立 ====================

  renderParams() {
    const s = this.config.strategy;
    switch (s) {
      case 'semantic': return this._paramsSemantic();
      case 'identifier': return this._paramsIdentifier();
      case 'recursive': return this._paramsRecursive();
      case 'structured': return this._paramsStructured();
      default: return '';
    }
  }

  /** 语义切分 — 只有 Max Length，无 Overlap */
  _paramsSemantic() {
    return `
      <div class="param-row-single">
        <div class="param-item full-width">
          <label class="param-label">
            最大分块大小 (Max Chunk Size)
          </label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" id="cc-maxlength" min="256" max="4096" step="128" value="${this.config.maxLength}">
            <input type="number" class="param-number" id="cc-maxlength-num" min="256" max="8192" value="${this.config.maxLength}">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">
            限制单个语义块的最大字符数。系统会根据内容语义自动识别文本间的语义差异进行切分
          </div>
        </div>
      </div>
    `;
  }

  /** 标识符切分 — 主分隔符 + 处理策略，无 Overlap */
  _paramsIdentifier() {
    const delimiterOptions = [
      { value: '\\n', label: '换行符 (\\n)' },
      { value: '。', label: '中文句号（。）' },
      { value: '；', label: '中文分号（；）' },
      { value: '\\.', label: '英文句号（.）' },
      { value: ';', label: '英文分号（;）' },
      { value: 'custom', label: '自定义' }
    ];
    return `
      <div class="param-row">
        <div class="param-item full-width">
          <label class="param-label">
            🎯 主分隔符 (Primary Delimiter)
            <span class="param-badge required-tag">*</span>
          </label>
          <!-- 下拉枚举组件 -->
          <div class="delimiter-select-area">
            <select class="form-select" id="cc-delimiter-select" style="margin-bottom:10px;">
              ${delimiterOptions.map(opt => `
                <option value="${opt.value}" ${(this.config.primaryDelimiter === opt.value || (this.config.primaryDelimiter && opt.value === 'custom')) ? 'selected' : ''}>${opt.label}</option>
              `).join('')}
            </select>
            <div class="custom-delimiter-input" id="cc-custom-del-input-area" style="${this.config.primaryDelimiter && !delimiterOptions.slice(0, -1).some(opt => opt.value === this.config.primaryDelimiter) ? '' : 'display:none; margin-top:10px; border:1px solid var(--border-color); border-radius:var(--radius); padding:12px; background:var(--bg-secondary);'}">
              <label class="wf-label required" style="display:block; margin-bottom:8px;">自定义分隔符</label>
              <input type="text" class="form-input" id="cc-custom-del-input" placeholder="输入自定义分隔符，如：\\n、.、; 等" value="${!delimiterOptions.slice(0, -1).some(opt => opt.value === this.config.primaryDelimiter) ? this.config.primaryDelimiter || '' : ''}">
              <div class="param-hint" style="margin-top:4px;">支持普通字符和简单正则表达式</div>
            </div>
          </div>
          <div class="param-hint">系统将在此位置精确切分文档。每个标识符对应一个独立的逻辑单元。</div>
        </div>
      </div>

      <div class="param-row">
        <div class="param-item full-width">
          <label class="param-label">分隔符处理策略</label>
          <div class="strategy-radios">
            ${[
              { v: 'discard', l: '丢弃分隔符', d: '切分后的块不包含分隔符本身，内容更干净' },
              { v: 'keep-before', l: '保留在块首', d: '将分隔符作为新块的第一个元素（如标题标记）' },
              { v: 'keep-after', l: '保留在块尾', d: '将分隔符附加到前一个块的末尾' }
            ].map(r => `
              <label class="sr-option ${this.config.delimiterStrategy === r.v ? 'sr-active' : ''}" data-sv="${r.v}">
                <span class="sr-radio"></span>
                <span class="sr-text"><strong>${r.l}</strong><small>${r.d}</small></span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="param-row">
        <div class="param-item flex-1">
          <label class="param-label">最大分块大小 (Max Chunk Size)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" id="cc-chunksize" min="256" max="4096" step="128" value="${this.config.chunkSize}">
            <input type="number" class="param-number" id="cc-chunksize-num" min="256" max="8192" value="${this.config.chunkSize}">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">限制单个语义块的最大字符数。</div>
        </div>
      </div>

      <div class="id-no-overlap-hint">
        <span>💡 按标识符切分时不需要 Overlap</span> — 每个块由标识符精确定界，天然保持逻辑完整性，重叠反而破坏结构。
      </div>
    `;
  }

  /** 递归字符切分 — 经典模式：ChunkSize + Overlap + 分隔符 */
  _paramsRecursive() {
    return `
      <div class="param-row">
        <div class="param-item flex-1">
          <label class="param-label">最大分块大小 (Max Chunk Size)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" id="cc-chunksize" min="128" max="2048" step="64" value="${this.config.chunkSize}">
            <input type="number" class="param-number" id="cc-chunksize-num" min="128" max="4096" value="${this.config.chunkSize}">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">每个切片的最大字符数，超过时尝试下一级分隔符</div>
        </div>
        <div class="param-item flex-1">
          <label class="param-label">重叠量 (Overlap)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" id="cc-overlap" min="0" max="300" step="10" value="${this.config.overlap}">
            <input type="number" class="param-number" id="cc-overlap-num" min="0" max="500" value="${this.config.overlap}">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">相邻切片间的重叠字符数，建议为 Chunk Size 的 10%~20%</div>
        </div>
      </div>
      <div class="param-row">
        <div class="param-item full-width">
          <label class="param-label">分隔符优先级（从左到右依次尝试）</label>
          <div class="separator-tags" id="separator-tags">
            ${(this.separatorOptions || []).map(opt => `
              <div class="sep-tag">
                <span>${opt.label}</span>
              </div>
            `).join('')}
          </div>
          <div class="param-hint">系统从左到右依次使用分隔符切分，直到所有块都满足长度要求。</div>
        </div>
      </div>
    `;
  }

  /** 文档结构化切分 — 层级感：自定义层级输入 + 上下文追加 */
  _paramsStructured() {
    // 初始化自定义层级
    if (!this.config.customHeadingLevel) {
      this.config.customHeadingLevel = 3; // 默认3级
    }
    
    return `
      <div class="param-row">
        <div class="param-item full-width">
          <label class="param-label">📑 分段层级（自定义标题等级）</label>
          <div class="custom-level-input">
            <input type="number" class="form-input" id="cc-custom-level" min="1" max="5" value="${this.config.customHeadingLevel}">
            <span class="level-hint">级 (最大支持5级)</span>
          </div>
          <div class="param-hint">系统将根据选定的标题层级进行物理分割，建议层级包含文档的主要大纲。</div>
          <div class="param-tip" id="structured-tip">
            将基于选定的 ${this.config.customHeadingLevel} 个层级进行结构化切分
          </div>
        </div>
      </div>

      <div class="param-row">
        <div class="param-item flex-1">
          <label class="param-label">最大分块大小 (Max Chunk Size)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" id="cc-chunksize" min="256" max="4096" step="128" value="${this.config.chunkSize}">
            <input type="number" class="param-number" id="cc-chunksize-num" min="256" max="8192" value="${this.config.chunkSize}">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">同级标题间内容的上限长度</div>
        </div>
        <div class="param-item flex-1">
          <label class="param-label">重叠量 (Overlap)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" id="cc-overlap" min="0" max="200" step="10" value="${Math.min(this.config.overlap, 100)}">
            <input type="number" class="param-number" id="cc-overlap-num" min="0" max="500" value="${Math.min(this.config.overlap, 100)}">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">结构化模式下 Overlap 通常较小或不需设置</div>
        </div>
      </div>

      <div class="param-row">
        <div class="param-item full-width">
          <label class="param-label">上下文追加策略</label>
          <div class="context-options">
            <label class="ctx-option ${this.config.appendParentHeading ? 'ctx-active' : ''}" data-cv="true">
              <span class="ctx-radio"></span>
              <span class="ctx-text"><strong>📎 追加父级标题至每个切片头部</strong><small>每个切片自动包含其所属的所有上级标题路径，便于检索时定位来源位置</small></span>
            </label>
            <label class="ctx-option ${!this.config.appendParentHeading ? 'ctx-active' : ''}" data-cv="false">
              <span class="ctx-radio"></span>
              <span class="ctx-text"><strong>✂️ 不追加</strong><small>仅包含当前层级的正文内容，切片更紧凑但缺少上下文信息</small></span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== 预览图：4种策略各不相同 ====================

  renderDiagram() {
    const s = this.config.strategy;
    switch (s) {
      case 'semantic': return this._diagramSemantic();
      case 'identifier': return this._diagramIdentifier();
      case 'recursive': return this._diagramRecursive();
      case 'structured': return this._diagramStructured();
      default: return '';
    }
  }

  /** 语义切分预览 — 干净无重叠的色块 */
  _diagramSemantic() {
    const ml = this.config.maxLength;
    const chunks = [
      { label: '语义块 1', w: Math.min(ml, 800), content: '第一段：引言与背景说明...' },
      { label: '语义块 2', w: Math.min(Math.round(ml * 0.7), 600), content: '第二段：核心概念定义...' },
      { label: '语义块 3', w: Math.min(Math.round(ml * 0.9), 720), content: '第三段：方法与实施步骤...' }
    ];
    return this._renderCleanBlocks(chunks, 'semantic', [
      '🧠 AI 在语义边界处自动断点',
      '每块是完整的语义单元，无需 Overlap',
      '块之间有清晰的自然间隔'
    ]);
  }

  /** 标识符切分预览 — 等高干净色块，按标识符断开 */
  _diagramIdentifier() {
    const delim = this.config.primaryDelimiter || '\\n';
    const delimLabel = delim === '\\n' ? '换行符 (\\n)' :
      delim === '\\.' ? '句号 (.)' :
      delim === ';' ? '分号 (;)' :
      delim.includes('#') ? 'Markdown标题 (#)' : delim;
    const chunks = [
      { label: `「${delimLabel}」`, sub: '块 1', content: '这是第一部分内容，使用标识符进行切分。' },
      { label: `「${delimLabel}」`, sub: '块 2', content: '这是第二部分内容，与第一部分通过标识符分隔。' },
      { label: `「${delimLabel}」`, sub: '块 3', content: '这是第三部分内容，展示了标识符切分的效果。' }
    ];
    const stratLabels = { discard:'丢弃分隔符', keepBefore:'保留在块首', keepAfter:'保留在块尾' };
    const stratLabel = stratLabels[this.config.delimiterStrategy] || '丢弃分隔符';
    return this._renderIdentifierBlocks(chunks, this.config.delimiterStrategy, [
      '按标识符精确切分，块之间互不重叠',
      '主分隔符：' + delimLabel,
      '处理策略：' + stratLabel
    ]);
  }

  /** 递归字符切分预览 — 黄色重叠块（经典） */
  _diagramRecursive() {
    const size = this.config.chunkSize;
    const overlap = this.config.overlap;
    const effectiveStep = Math.max(1, size - overlap);

    return `
      <div class="diagram-visual">
        <div class="diagram-scale">
          <div class="scale-bar"><div class="scale-fill" style="width:${(size / 2048) * 100}%"></div></div>
          <div class="scale-labels"><span>0</span><span>512</span><span>1024</span><span>1536</span><span>2048</span></div>
        </div>
        <div class="chunks-timeline" style="position:relative;height:80px;">
          ${this._renderOverlappingChunks(size, overlap, effectiveStep)}
        </div>
        <div class="diagram-stats">
          <div class="stat-item"><span class="stat-label">Chunk Size</span><span class="stat-value primary">${size}</span><span class="stat-unit">字符/块</span></div>
          <div class="stat-item"><span class="stat-label">Overlap</span><span class="stat-value warning">${overlap}</span><span class="stat-unit">字符</span></div>
          <div class="stat-item"><span class="stat-label">步进距离</span><span class="stat-value success">${effectiveStep}</span><span class="stat-unit">字符</span></div>
          <div class="stat-item"><span class="stat-label">重叠率</span><span class="stat-value info">${size > 0 ? ((overlap / size) * 100).toFixed(1) : 0}%</span></div>
        </div>
        <div class="diagram-explain">
          <div class="explain-title">💡 递归字符切分原理</div>
          <ul class="explain-list">
            <li><strong>Chunk Size</strong>：目标块大小上限</li>
            <li><strong>Overlap</strong>：相邻块重复区域（黄色），保证跨块连续性</li>
            <li><strong>分隔符</strong>：按优先级尝试切分，确保不在词语中间断裂</li>
          </ul>
        </div>
      </div>
    `;
  }

  /** 结构化切分预览 — 层级缩进的树状切片 */
  _diagramStructured() {
    const customLevel = this.config.customHeadingLevel || 3;
    const levelStr = `H1-H${customLevel}`;
    const parentHeadingTag = this.config.appendParentHeading ? '<span class="parent-heading-tag">[第一章 > 第一节]</span>' : '';
    return `
      <div class="diagram-visual">
        <div class="struct-preview-tree">
          <div class="struct-node struct-root">
            <span class="struct-dot root-dot"></span>
            <span class="struct-content">📄 整篇文档</span>
          </div>
          <div class="struct-node struct-l1 struct-highlight">
            <span class="struct-line-v"></span>
            <span class="struct-corner"></span>
            <span class="struct-dot dot-l1 dot-highlight"></span>
            <span class="struct-content"><b># H1 第一章：文档概述</b><span class="struct-split-point">切分点</span></span>
            <span class="struct-badge-sm">独立切片</span>
            <div class="struct-demo-content">
              ${this.config.appendParentHeading ? '<span class="parent-heading-tag">[第一章]</span>' : ''}
              <span class="demo-text">本章主要介绍文档的整体结构和核心内容...</span>
            </div>
          </div>
          ${customLevel >= 2 ? `
          <div class="struct-node struct-l2 struct-highlight">
            <span class="struct-line-v"></span>
            <span class="struct-line-h"></span>
            <span class="struct-corner"></span>
            <span class="struct-dot dot-l2 dot-highlight"></span>
            <span class="struct-content"><b>## H2 1.1 小节：核心概念</b><span class="struct-split-point">切分点</span></span>
            <span class="struct-badge-sm">子切片</span>
            <div class="struct-demo-content">
              ${parentHeadingTag}
              <span class="demo-text">本节详细介绍核心概念的定义和应用场景...</span>
            </div>
          </div>
          <div class="struct-node struct-l2 struct-highlight">
            <span class="struct-line-v"></span>
            <span class="struct-line-h"></span>
            <span class="struct-corner"></span>
            <span class="struct-dot dot-l2 dot-highlight"></span>
            <span class="struct-content"><b>## H2 1.2 小节：实施步骤</b><span class="struct-split-point">切分点</span></span>
            <span class="struct-badge-sm">子切片</span>
            <div class="struct-demo-content">
              ${parentHeadingTag}
              <span class="demo-text">本节提供详细的实施步骤和注意事项...</span>
            </div>
          </div>` : ''}
          ${customLevel >= 3 ? `
          <div class="struct-node struct-l3 struct-highlight">
            <span class="struct-line-v"></span>
            <span class="struct-line-h"></span>
            <span class="struct-line-h2"></span>
            <span class="struct-corner"></span>
            <span class="struct-dot dot-l3 dot-highlight"></span>
            <span class="struct-content"><b>### H3 1.2.1 准备工作</b><span class="struct-split-point">切分点</span></span>
            <div class="struct-demo-content">
              ${this.config.appendParentHeading ? '<span class="parent-heading-tag">[第一章 > 第一节 > 准备工作]</span>' : ''}
              <span class="demo-text">具体准备工作包括环境搭建和资源配置...</span>
            </div>
          </div>` : ''}
          ${customLevel >= 4 ? `
          <div class="struct-node struct-l4 struct-highlight">
            <span class="struct-line-v"></span>
            <span class="struct-line-h"></span>
            <span class="struct-line-h2"></span>
            <span class="struct-line-h3"></span>
            <span class="struct-corner"></span>
            <span class="struct-dot dot-l4 dot-highlight"></span>
            <span class="struct-content"><b>#### H4 1.2.1.1 详细步骤</b><span class="struct-split-point">切分点</span></span>
            <div class="struct-demo-content">
              ${this.config.appendParentHeading ? '<span class="parent-heading-tag">[第一章 > 第一节 > 准备工作 > 详细步骤]</span>' : ''}
              <span class="demo-text">本节提供具体的详细步骤和操作指南...</span>
            </div>
          </div>` : ''}
          ${customLevel >= 5 ? `
          <div class="struct-node struct-l5 struct-highlight">
            <span class="struct-line-v"></span>
            <span class="struct-line-h"></span>
            <span class="struct-line-h2"></span>
            <span class="struct-line-h3"></span>
            <span class="struct-line-h4"></span>
            <span class="struct-corner"></span>
            <span class="struct-dot dot-l5 dot-highlight"></span>
            <span class="struct-content"><b>##### H5 1.2.1.1.1 子步骤</b><span class="struct-split-point">切分点</span></span>
            <div class="struct-demo-content">
              ${this.config.appendParentHeading ? '<span class="parent-heading-tag">[第一章 > 第一节 > 准备工作 > 详细步骤 > 子步骤]</span>' : ''}
              <span class="demo-text">本节提供更详细的子步骤...</span>
            </div>
          </div>` : ''}
        </div>
        <div class="diagram-stats">
          <div class="stat-item"><span class="stat-label">识别层级</span><span class="stat-value primary">${levelStr}</span></div>
          <div class="stat-item"><span class="stat-label">上下文追加</span><span class="stat-value ${this.config.appendParentHeading ? 'success' : 'warning'}">${this.config.appendParentHeading ? '开启' : '关闭'}</span></div>
          <div class="stat-item"><span class="stat-label">Max Length</span><span class="stat-value info">${this.config.chunkSize}</span></div>
        </div>
        <div class="diagram-explain">
          <div class="explain-title">💡 结构化切分原理</div>
          <ul class="explain-list">
            <li>按 Markdown / HTML 标题层级自动识别文档结构</li>
            <li>识别 H1 至 H${customLevel} 的标题层级作为切分点</li>
            <li>${this.config.appendParentHeading ? '<b>已开启</b>：每个切片头部自动追加父级标题路径，如「[第一章 > 第一节]」' : '<b>未开启</b>：切片仅包含本级内容'}</li>
            <li>适合技术文档、API文档、知识库文章等有明确层级结构的文本</li>
            <li>层级缩进展示了文档的结构关系，使切片更加清晰易读</li>
          </ul>
        </div>
      </div>
    `;
  }

  // --- 预览图辅助渲染 ---

  _renderCleanBlocks(chunks, mode, hints) {
    const totalW = chunks.reduce((s, c) => s + c.w + 12, 0);
    let left = 0;
    const colorMap = { semantic: ['#1890ff','#36cfc9','#13c2c2'], identifier: ['#722ed1','#9254de','#b37feb'] };
    const colors = colorMap[mode] || ['#1890ff','#40a9ff','#69c0ff'];

    return `
      <div class="clean-blocks-area">
        <div class="clean-blocks-track" style="gap:12px;">
          ${chunks.map((c, i) => {
            const wPct = (c.w / totalW) * 80;
            const html = `<div class="clean-block cb-${mode}" style="flex:${c.w};min-width:100px;background:${colors[i % colors.length]}20;border-color:${colors[i % colors.length]}">
              <div class="cb-header" style="color:${colors[i % colors.length]}">
                <span class="cb-label">${c.label}</span>
                <span class="cb-size">${c.w}字</span>
              </div>
              <div class="cb-body">${c.content}</div>
            </div>`;
            return html;
          }).join('')}
        </div>
        <div class="clean-blocks-stats">
          ${hints.map(h => `<span class="cbs-item">${h}</span>`).join('')}
        </div>
      </div>
    `;
  }

  _renderIdentifierBlocks(chunks, strategy, hints) {
    const stratTagMap = { 
      discard: '丢弃分隔符', 
      keepBefore: '保留在块首', 
      keepAfter: '保留在块尾' 
    };
    const sTag = stratTagMap[strategy] || '丢弃分隔符';
    const colors = ['#722ed1','#9254de','#b37feb'];
    
    // 根据策略生成不同的内容展示
    const getContentWithStrategy = (content, strategy, isFirst, isLast) => {
      if (strategy === 'keepBefore' && !isFirst) {
        // 保留在块首：在内容前添加分隔符
        return `<span class="delim-marker">${chunks[0].label}</span>${content}`;
      } else if (strategy === 'keepAfter' && !isLast) {
        // 保留在块尾：在内容后添加分隔符
        return `${content}<span class="delim-marker">${chunks[0].label}</span>`;
      }
      return content;
    };
    
    return `
      <div class="identifier-blocks-area">
        ${chunks.map((c, i) => `
          <div class="id-block-row">
            <div class="id-delim-marker ${strategy === 'discard' ? 'delim-visible' : 'delim-hidden'}">${c.label}</div>
            <div class="id-block" style="border-color:${colors[i]};background:${colors[i]}08;">
              <div class="id-block-header" style="color:${colors[i]};">
                <span class="id-b-label">${c.sub}</span>
                <span class="id-b-size">~300字</span>
              </div>
              <div class="id-b-content">
                ${getContentWithStrategy(c.content, strategy, i === 0, i === chunks.length - 1)}
              </div>
              <div class="id-b-strategy-tag">${sTag}</div>
            </div>
          </div>
        `).join('')}
        <div class="identifier-hints-bar">
          ${hints.map(h => `<span>• ${h}</span>`).join('')}
        </div>
      </div>
    `;
  }

  _renderOverlappingChunks(size, overlap, effectiveStep) {
    const cData = [
      { label: 'Chunk 1', start: 0, end: size },
      { label: 'Chunk 2', start: effectiveStep, end: effectiveStep + size },
      { label: 'Chunk 3', start: effectiveStep * 2, end: effectiveStep * 2 + size }
    ];
    const totalW = cData[cData.length - 1].end;
    const cw = 520;

    return cData.map((c, i) => {
      const left = (c.start / totalW) * cw;
      const width = Math.max((size / totalW) * cw, 60);
      let ovHtml = '';
      if (i > 0 && overlap > 0) {
        const prevEnd = cData[i - 1].end;
        if (c.start < prevEnd) {
          const ovLeft = (c.start / totalW) * cw;
          ovLeft !== null; // suppress unused warning
          ovHtml = `<div class="overlap-zone" style="left:${(c.start / totalW) * cw}px;width:${Math.min((overlap / totalW) * cw, width)}px;top:${i % 2 === 0 ? '8px' : '36px'}">重叠${overlap}</div>`;
        }
      }
      return `<div class="chunk-block" style="left:${left}px;width:${width}px;top:${i % 2 === 0 ? '8px' : '36px'}">
        <span class="chunk-block-label">${c.label}</span><span class="chunk-block-size">${size}字</span>
      </div>${ovHtml}`;
    }).join('');
  }

  // 获取结构化切分的动态提示文字
  _getStructuredTip() {
    const level = this.config.headingLevel || 2;
    if (level === 1) {
      return '<span class="tip-icon">💡</span> 提示：将按大章节切分，适合篇幅较短的文档。';
    } else {
      return `<span class="tip-icon">💡</span> 提示：系统将识别 H1 至选择的层级（如 H${level}）的所有标题并触发切分。建议开启 [追加父级标题] 以保持切片的上下文连贯性。`;
    }
  }

  // ==================== 事件绑定 ====================

  bindEvents() {
    // 策略卡片切换
    this.container.querySelectorAll('.strategy-card').forEach(card => {
      card.addEventListener('click', () => {
        this.config.strategy = card.dataset.strategy;
        this.render(); this.bindEvents(); this.notifyChange();
      });
    });

    // MaxLength 滑块（语义）
    this._bindSlider('cc-maxlength', 'cc-maxlength-num', v => { this.config.maxLength = v; }, 256, 8192);
    // ChunkSize 滑块（通用）
    this._bindSlider('cc-chunksize', 'cc-chunksize-num', v => { this.config.chunkSize = v; }, 128, 4096);
    // Overlap 滑块（递归/结构化）
    this._bindSlider('cc-overlap', 'cc-overlap-num', v => { this.config.overlap = v; }, 0, 500);

    // 分隔符下拉选择
    const delSelect = this.container.querySelector('#cc-delimiter-select');
    if (delSelect) delSelect.addEventListener('change', e => {
      const value = e.target.value;
      if (value === 'custom') {
        // 显示自定义输入框
        const customInputArea = this.container.querySelector('#cc-custom-del-input-area');
        if (customInputArea) customInputArea.style.display = '';
      } else {
        // 隐藏自定义输入框
        const customInputArea = this.container.querySelector('#cc-custom-del-input-area');
        if (customInputArea) customInputArea.style.display = 'none';
        // 设置分隔符值
        this.config.primaryDelimiter = value;
        this.updateDiagram(); this.notifyChange();
      }
    });
    
    // 自定义分隔符输入
    const customDelInput = this.container.querySelector('#cc-custom-del-input');
    if (customDelInput) customDelInput.addEventListener('input', e => {
      this.config.primaryDelimiter = e.target.value;
      this.updateDiagram(); this.notifyChange();
    });

    // 处理策略 Radio
    this.container.querySelectorAll('.sr-option').forEach(opt => {
      opt.addEventListener('click', () => {
        this.container.querySelectorAll('.sr-option').forEach(o => o.classList.remove('sr-active'));
        opt.classList.add('sr-active');
        this.config.delimiterStrategy = opt.dataset.sv;
        this.updateDiagram(); this.notifyChange();
      });
    });

    // 自定义层级输入
    const customLevelInput = this.container.querySelector('#cc-custom-level');
    if (customLevelInput) {
      customLevelInput.addEventListener('change', e => {
        let level = parseInt(e.target.value);
        // 限制范围 1-5
        level = Math.max(1, Math.min(5, level));
        this.config.customHeadingLevel = level;
        e.target.value = level;
        // 更新提示文字
        const tipElement = this.container.querySelector('#structured-tip');
        if (tipElement) {
          tipElement.innerHTML = `将基于选定的 ${level} 个层级进行结构化切分`;
        }
        this.updateDiagram();
        this.notifyChange();
      });
    }

    // 上下文追加 Radio
    this.container.querySelectorAll('.ctx-option').forEach(opt => {
      opt.addEventListener('click', () => {
        this.container.querySelectorAll('.ctx-option').forEach(o => o.classList.remove('ctx-active'));
        opt.classList.add('ctx-active');
        this.config.appendParentHeading = opt.dataset.cv === 'true';
        this.updateDiagram(); this.notifyChange();
      });
    });


  }

  _bindSlider(sliderId, numId, setter, minVal, maxVal) {
    const slider = this.container.querySelector(`#${sliderId}`);
    const numEl = this.container.querySelector(`#${numId}`);
    if (!slider || !numEl) return;
    slider.addEventListener('input', e => {
      const v = parseInt(e.target.value); setter(v); numEl.value = v; this.updateDiagram(); this.notifyChange();
    });
    numEl.addEventListener('change', e => {
      let v = parseInt(e.target.value); v = Math.max(minVal, Math.min(maxVal, v)); setter(v);
      slider.value = Math.min(v, parseInt(slider.max)); numEl.value = v; this.updateDiagram(); this.notifyChange();
    });
  }

  updateDiagram() {
    const diagram = this.container.querySelector('#chunk-diagram');
    if (diagram) diagram.innerHTML = this.renderDiagram();
  }

  notifyChange() { this.options.onChange({ ...this.config }); }
  getConfig() { return { ...this.config }; }
  setConfig(config) { this.config = { ...this.config, ...config }; this.render(); this.bindEvents(); }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = ChunkConfig; }
