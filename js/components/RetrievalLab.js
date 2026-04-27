/**
 * 检索召回实验室 - 独立全屏页面组件
 * 支持：检索范围管理、单点模式、对比模式(A/B)、测试集管理
 */

class RetrievalLab {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      kb: null,
      doc: null,
      allChunks: [],
      ...options
    };
    this.mode = 'single';
    this.scope = { kb: true, docs: [] };
    this.config = {
      query: '',
      queryA: '',
      queryB: '',
      topK: 5,
      threshold: 0.6
    };
    this.results = [];
    this.resultsA = [];
    this.resultsB = [];
    this.isTesting = false;
    this.testHistory = [];
    this.testSets = [];
    this.currentStrategy = 'semantic';
    this.sandboxStrategy = 'semantic';
    this.sandboxConfig = { chunkSize: 512, overlap: 50, separators: ['\n\n'] };
    this.sidebarCollapsed = false;
    this.sandboxChanged = false;
    this.selectedTestSetIndex = null; // 保持选中的测试集状态
    this.testSetDrawerVisible = false; // 测试集抽屉可见状态
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const strategies = [
      { id: 'semantic', label: '语义分割', icon: '🧠' },
      { id: 'identifier', label: '按标识符切分', icon: '🔖' },
      { id: 'recursive', label: '递归切分', icon: '📏' },
      { id: 'structured', label: '按结构切分', icon: '🏗️' }
    ];
    this.container.innerHTML = `
      <div class="rlab-wrapper">
        <!-- 顶部导航栏 -->
        <div class="rlab-topbar">
          <div class="rlab-topbar-left">
            <button class="btn btn-default btn-sm" onclick="app.closeRetrievalLab()">
              ← 返回
            </button>
            <div class="rlab-title">
              <span class="rlab-title-icon">🔬</span>
              <span>检索召回实验室</span>
            </div>
          </div>
          <div class="rlab-topbar-center">
            ${this._renderScopeManager()}
          </div>
          <div class="rlab-topbar-right">
            <div class="mode-switch">
              <button class="mode-btn ${this.mode === 'single' ? 'active' : ''}" data-mode="single" onclick="app.retrievalLabComponent.switchMode('single')">
                单点模式
              </button>
              <button class="mode-btn ${this.mode === 'compare' ? 'active' : ''}" data-mode="compare" onclick="app.retrievalLabComponent.switchMode('compare')">
                对比模式
              </button>
            </div>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="rlab-main">
          ${this.mode === 'compare' ? `


            <!-- 左侧：Baseline 工作区 -->
            <div class="rlab-baseline-panel">
              <!-- 配置区 -->
              <div class="rlab-section-card config-panel">
                <div class="rsc-header">
                  <span class="rsc-title">Query A（基准组）</span>
                </div>
                <div class="rsc-body">
                  <div class="rlab-query-area">
                    <textarea class="rt-query-input" id="rlab-query-a" rows="3" placeholder="输入查询词...">${this.config.queryA || ''}</textarea>
                  </div>
                  <div class="rlab-params readonly">
                    <div class="current-strategy-info readonly">
                      ${this._renderCurrentStrategy()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：Sandbox 工作区 -->
            <div class="rlab-sandbox-panel">
              <!-- 配置区 -->
              <div class="rlab-section-card config-panel">
                <div class="rsc-header">
                  <span class="rsc-title">Query B（实验组）</span>
                </div>
                <div class="rsc-body">
                  <div class="rlab-query-area">
                    <textarea class="rt-query-input" id="rlab-query-b" rows="3" placeholder="输入查询词...">${this.config.queryB || ''}</textarea>
                  </div>

                  <!-- Sandbox 策略切换和参数配置 -->
                  <div class="sandbox-config">
                    <!-- 策略切换 -->
                    <div class="sandbox-strategy-switch">
                      <label class="sp-label">策略切换</label>
                      <div class="strategy-segmented">
                        ${strategies.map(s => `
                          <button class="strategy-segment ${this.sandboxStrategy === s.id ? 'active' : ''}" data-strategy="${s.id}" onclick="app.retrievalLabComponent.setSandboxStrategy('${s.id}')">
                            ${s.icon} ${s.label}
                          </button>
                        `).join('')}
                      </div>
                    </div>

                    <!-- 参数配置 -->
                    <div class="sandbox-params-grid" id="sandbox-params">
                      ${this._renderSandboxParams()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 全局参数配置和测试按钮 -->
            <div class="rlab-global-section">
              <!-- 全局参数配置 -->
              <div class="rlab-global-params">
                <div class="rlab-params-header">
                  <h4>全局参数</h4>
                </div>
                <div class="rlab-params-content">
                  <div class="rlab-param-row">
                    <div class="rlab-param-item">
                      <label class="rlab-param-label">Top K: <strong>${this.config.topK}</strong></label>
                      <input type="range" id="rlab-topk" class="param-slider" min="1" max="20" value="${this.config.topK}" oninput="app.retrievalLabComponent.updateParam('topK', this.value)">
                    </div>
                    <div class="rlab-param-item">
                      <label class="rlab-param-label">相似度阈值: <strong>${parseFloat(this.config.threshold).toFixed(2)}</strong></label>
                      <input type="range" id="rlab-threshold" class="param-slider" min="0" max="1" step="0.01" value="${this.config.threshold}" oninput="app.retrievalLabComponent.updateParam('threshold', this.value)">
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 测试按钮 -->
              <div class="rlab-test-button-panel">
                <button class="rt-test-btn center-btn ${this.sandboxChanged ? 'btn-highlight' : ''}" onclick="app.retrievalLabComponent.runCompareTest()">
                  ${this.isTesting ? '<span class="rt-loading"></span> 正在检索...' : this.sandboxChanged ? '<span class="rt-btn-icon">🔄</span> 重新运行对比' : '<span class="rt-btn-icon">⚡</span> 开始对比测试'}
                </button>
              </div>
            </div>

            <!-- 结果区 -->
            <div class="rlab-baseline-results">
              <div class="rlab-section-card results-panel">
                <div class="rsc-header">
                  <span class="rsc-title">Baseline 结果</span>
                </div>
                <div class="rsc-body" style="height: 100%; overflow-y: auto;">
                  ${this._renderBaselineResults()}
                </div>
              </div>
            </div>

            <div class="rlab-sandbox-results">
              <div class="rlab-section-card results-panel">
                <div class="rsc-header">
                  <span class="rsc-title">Sandbox 结果</span>
                </div>
                <div class="rsc-body" style="height: 100%; overflow-y: auto;">
                  ${this._renderSandboxResults()}
                </div>
              </div>
            </div>

            <!-- 右侧：历史记录与测试集 (可折叠侧边栏) -->
            <div class="rlab-right-panel">
              <div class="sidebar-toggle" onclick="app.retrievalLabComponent.toggleSidebar()">
                ${this.sidebarCollapsed ? '▶' : '◀'}
              </div>
              <div class="sidebar-content ${this.sidebarCollapsed ? 'collapsed' : ''}">
                ${this._renderHistorySidebar()}
              </div>
            </div>
          ` : `
            <!-- 左侧：查询配置区 -->
            <div class="rlab-left-panel">
              <div class="rlab-section-card">
                <div class="rsc-header">
                  <span class="rsc-title">查询配置</span>
                </div>
                <div class="rsc-body">
                  ${this._renderSingleQuery()}
                </div>
              </div>

              <div class="rlab-section-card">
                <div class="rsc-header">
                  <span class="rsc-title">当前切片策略</span>
                </div>
                <div class="rsc-body">
                  ${this._renderCurrentStrategy()}
                </div>
              </div>
            </div>

            <!-- 中间：结果展示区 -->
            <div class="rlab-center-panel">
              ${this._renderSingleResults()}
            </div>

            <!-- 右侧：历史记录与测试集 -->
            <div class="rlab-right-panel">
              ${this._renderHistorySidebar()}
            </div>
          `}
        </div>
      </div>

      <!-- 测试集详情抽屉 -->
      ${this.testSetDrawerVisible && this.selectedTestSetIndex !== null ? this._renderTestSetDrawer(this.testSets[this.selectedTestSetIndex], this.selectedTestSetIndex) : ''}
    `;
  }

  _renderScopeManager() {
    const kbName = this.options.kb?.name || '全部知识库';
    const docName = this.options.doc?.name || '';
    return `
      <div class="scope-manager">
        <div class="scope-label">检索范围：</div>
        <div class="scope-options">
          <div class="scope-dropdown">
            <select class="form-select scope-select" onchange="app.retrievalLabComponent.changeScope(this.value)">
              <option value="kb">📚 ${kbName}</option>
              ${docName ? `<option value="doc">📄 ${docName}</option>` : ''}
            </select>
          </div>
        </div>
      </div>
    `;
  }

  _renderSingleQuery() {
    return `
      <div class="rlab-query-area">
        <label class="rlab-label">测试 Query</label>
        <textarea class="rt-query-input" id="rlab-query" rows="4" placeholder="例如：sqlserver数据库有哪些性能指标？">${this.config.query || ''}</textarea>
      </div>
      <div class="rlab-params">
        <div class="rlab-param-item">
          <span class="rpi-label">Top K: <strong>${this.config.topK}</strong></span>
          <input type="range" class="rt-slider" id="rlab-topk" min="1" max="20" value="${this.config.topK}" oninput="app.retrievalLabComponent.updateParam('topK', this.value)">
        </div>
        <div class="rlab-param-item">
          <span class="rpi-label">相似度阈值: <strong>${this.config.threshold.toFixed(2)}</strong></span>
          <input type="range" class="rt-slider" id="rlab-threshold" min="0" max="1" step="0.05" value="${this.config.threshold}" oninput="app.retrievalLabComponent.updateParam('threshold', this.value)">
        </div>
      </div>
      <button class="rt-test-btn" id="rlab-test-btn" onclick="app.retrievalLabComponent.runTest()">
        ${this.isTesting ? '<span class="rt-loading"></span> 正在检索...' : '<span class="rt-btn-icon">⚡</span> 开始测试'}
      </button>
    `;
  }

  _renderCompareQuery() {
    return `
      <div class="rlab-query-area">
        <label class="rlab-label">Query A（左侧：锁定当前策略）</label>
        <textarea class="rt-query-input" id="rlab-query-a" rows="3" placeholder="输入第一个查询词...">${this.config.queryA || ''}</textarea>
      </div>
      <div class="rlab-query-area">
        <label class="rlab-label">Query B（右侧：Sandbox 策略切换）</label>
        <textarea class="rt-query-input" id="rlab-query-b" rows="3" placeholder="输入第二个查询词...">${this.config.queryB || ''}</textarea>
      </div>
      <div class="rlab-params compact">
        <div class="rlab-param-item">
          <span class="rpi-label">Top K: <strong>${this.config.topK}</strong></span>
          <input type="range" class="rt-slider" id="rlab-topk" min="1" max="20" value="${this.config.topK}" oninput="app.retrievalLabComponent.updateParam('topK', this.value)">
        </div>
        <div class="rlab-param-item">
          <span class="rpi-label">相似度: <strong>${this.config.threshold.toFixed(2)}</strong></span>
          <input type="range" class="rt-slider" id="rlab-threshold" min="0" max="1" step="0.05" value="${this.config.threshold}" oninput="app.retrievalLabComponent.updateParam('threshold', this.value)">
        </div>
      </div>
      <button class="rt-test-btn" id="rlab-test-btn" onclick="app.retrievalLabComponent.runCompareTest()">
        ${this.isTesting ? '<span class="rt-loading"></span> 正在检索...' : '<span class="rt-btn-icon">⚡</span> 开始对比测试'}
      </button>
    `;
  }

  _renderStrategyPanel() {
    const strategies = [
      { id: 'semantic', label: '语义分割', icon: '🧠', desc: '基于语义相似度自动分段' },
      { id: 'identifier', label: '按标识符切分', icon: '🔖', desc: '按标题、章节等标识符分段' },
      { id: 'recursive', label: '递归切分', icon: '📏', desc: '按指定分隔符递归分段' },
      { id: 'structured', label: '按结构切分', icon: '🏗️', desc: '保持文档结构完整性' }
    ];
    return `
      <div class="rlab-section-card">
        <div class="rsc-header">
          <span class="rsc-title">🔧 Sandbox 策略切换（右侧栏）</span>
        </div>
        <div class="rsc-body">
          <div class="strategy-grid">
            ${strategies.map(s => `
              <div class="strategy-card ${this.sandboxStrategy === s.id ? 'active' : ''}" data-strategy="${s.id}" onclick="app.retrievalLabComponent.setSandboxStrategy('${s.id}')">
                <span class="strategy-icon">${s.icon}</span>
                <span class="strategy-label">${s.label}</span>
                <span class="strategy-desc">${s.desc}</span>
              </div>
            `).join('')}
          </div>
          <div class="sandbox-params" id="sandbox-params">
            ${this._renderSandboxParams()}
          </div>
        </div>
      </div>
    `;
  }

  _renderSandboxParams() {
    if (this.sandboxStrategy === 'semantic') {
      return `
        <div class="sandbox-param-row full">
          <label class="sp-label">最大分块大小 (Max Chunk Size)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" min="256" max="4096" step="128" value="${this.sandboxConfig.maxLength || 1024}" oninput="app.retrievalLabComponent.updateSandboxConfig('maxLength', this.value)">
            <input type="number" class="form-input sp-input" value="${this.sandboxConfig.maxLength || 1024}" min="256" max="8192" onchange="app.retrievalLabComponent.updateSandboxConfig('maxLength', this.value)">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">
            限制单个语义块的最大字符数。系统会根据内容语义自动识别文本间的语义差异进行切分
          </div>
        </div>
      `;
    } else if (this.sandboxStrategy === 'recursive') {
      return `
        <div class="sandbox-param-row half">
          <label class="sp-label">最大分块大小 (Max Chunk Size)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" min="128" max="2048" step="64" value="${this.sandboxConfig.chunkSize || 512}" oninput="app.retrievalLabComponent.updateSandboxConfig('chunkSize', this.value)">
            <input type="number" class="form-input sp-input" value="${this.sandboxConfig.chunkSize || 512}" min="128" max="4096" onchange="app.retrievalLabComponent.updateSandboxConfig('chunkSize', this.value)">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">每个切片的最大字符数，超过时尝试下一级分隔符</div>
        </div>
        <div class="sandbox-param-row half">
          <label class="sp-label">重叠量 (Overlap)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" min="0" max="300" step="10" value="${this.sandboxConfig.overlap || 50}" oninput="app.retrievalLabComponent.updateSandboxConfig('overlap', this.value)">
            <input type="number" class="form-input sp-input" value="${this.sandboxConfig.overlap || 50}" min="0" max="500" onchange="app.retrievalLabComponent.updateSandboxConfig('overlap', this.value)">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">相邻切片间的重叠字符数，建议为 Chunk Size 的 10%~20%</div>
        </div>
        <div class="sandbox-param-row">
          <label class="sp-label">分隔符优先级（从左到右依次尝试）</label>
          <div class="separator-tags">
            ${(window.separatorOptions || [
              { label: '段落 (\n\n)' },
              { label: '标题 (###)' },
              { label: '换行 (\n)' },
              { label: '分号 (;)' },
              { label: '句号 (。)' }
            ]).map(opt => `
              <div class="sep-tag">
                <span>${opt.label}</span>
              </div>
            `).join('')}
          </div>
          <div class="param-hint">系统从左到右依次使用分隔符切分，直到所有块都满足长度要求。</div>
        </div>
      `;
    } else if (this.sandboxStrategy === 'identifier') {
      // 使用更简单的分隔符选项，避免转义问题
      const delimiterOptions = [
        { value: 'newline', label: '换行符' },
        { value: '。', label: '中文句号（。）' },
        { value: '；', label: '中文分号（；）' },
        { value: '.', label: '英文句号（.）' },
        { value: ';', label: '英文分号（;）' },
        { value: 'custom', label: '自定义' }
      ];
      return `
        <div class="sandbox-param-row full">
          <label class="sp-label">🎯 主分隔符 (Primary Delimiter) <span class="param-badge required-tag">*</span></label>
          <!-- 下拉枚举组件 -->
          <div class="delimiter-select-area">
            <select class="form-select sp-select" style="margin-bottom:10px;" onchange="app.retrievalLabComponent.updateSandboxConfig('primaryDelimiter', this.value)">
              ${delimiterOptions.map(opt => `
                <option value="${opt.value}" ${((this.sandboxConfig.primaryDelimiter === opt.value) || (this.sandboxConfig.primaryDelimiter === '\n' && opt.value === 'newline') || (this.sandboxConfig.primaryDelimiter && opt.value === 'custom')) ? 'selected' : ''}>${opt.label}</option>
              `).join('')}
            </select>
            <div class="custom-delimiter-input" style="display: ${(this.sandboxConfig.primaryDelimiter && this.sandboxConfig.primaryDelimiter !== '\n' && !delimiterOptions.slice(0, -1).some(opt => opt.value === this.sandboxConfig.primaryDelimiter)) ? '' : 'none'}; margin-top:10px; border:1px solid var(--border-color); border-radius:var(--radius); padding:12px; background:var(--bg-secondary);">
              <label class="sp-label required" style="display:block; margin-bottom:8px;">自定义分隔符</label>
              <input type="text" class="form-input sp-input" placeholder="输入自定义分隔符，如：.、; 等" value="${(this.sandboxConfig.primaryDelimiter && this.sandboxConfig.primaryDelimiter !== '\n' && !delimiterOptions.slice(0, -1).some(opt => opt.value === this.sandboxConfig.primaryDelimiter)) ? this.sandboxConfig.primaryDelimiter || '' : ''}" onchange="app.retrievalLabComponent.updateSandboxConfig('primaryDelimiter', this.value)">
              <div class="param-hint" style="margin-top:4px;">支持普通字符和简单正则表达式</div>
            </div>
          </div>
          <div class="param-hint">系统将在此位置精确切分文档。每个标识符对应一个独立的逻辑单元。</div>
        </div>

        <div class="sandbox-param-row full">
          <label class="sp-label">分隔符处理策略</label>
          <div class="strategy-radios">
            ${[
              { v: 'discard', l: '丢弃分隔符', d: '切分后的块不包含分隔符本身，内容更干净' },
              { v: 'keep-before', l: '保留在块首', d: '将分隔符作为新块的第一个元素（如标题标记）' },
              { v: 'keep-after', l: '保留在块尾', d: '将分隔符附加到前一个块的末尾' }
            ].map(r => `
              <label class="sr-option ${this.sandboxConfig.delimiterStrategy === r.v ? 'sr-active' : ''}" data-sv="${r.v}" onclick="app.retrievalLabComponent.updateSandboxConfig('delimiterStrategy', '${r.v}')">
                <span class="sr-radio"></span>
                <span class="sr-text"><strong>${r.l}</strong><small>${r.d}</small></span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="sandbox-param-row half">
          <label class="sp-label">最大分块大小 (Max Chunk Size)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" min="256" max="4096" step="128" value="${this.sandboxConfig.chunkSize || 512}" oninput="app.retrievalLabComponent.updateSandboxConfig('chunkSize', this.value)">
            <input type="number" class="form-input sp-input" value="${this.sandboxConfig.chunkSize || 512}" min="256" max="8192" onchange="app.retrievalLabComponent.updateSandboxConfig('chunkSize', this.value)">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">限制单个语义块的最大字符数。</div>
        </div>

        <div class="id-no-overlap-hint">
          <span>💡 按标识符切分时不需要 Overlap</span> — 每个块由标识符精确定界，天然保持逻辑完整性，重叠反而破坏结构。
        </div>
      `;
    } else if (this.sandboxStrategy === 'structured') {
      // 初始化自定义层级
      if (!this.sandboxConfig.customHeadingLevel) {
        this.sandboxConfig.customHeadingLevel = 3; // 默认3级
      }
      return `
        <div class="sandbox-param-row">
          <label class="sp-label">分段层级（自定义标题等级）</label>
          <div class="custom-level-input">
            <input type="number" class="form-input sp-input" id="cc-custom-level" min="1" max="5" value="${this.sandboxConfig.customHeadingLevel}" onchange="app.retrievalLabComponent.updateSandboxConfig('customHeadingLevel', this.value)">
            <span class="level-hint">级 (最大支持5级)</span>
          </div>
          <div class="param-hint">系统将根据选定的标题层级进行物理分割，建议层级包含文档的主要大纲。</div>
          <div class="param-tip">
            将基于选定的 ${this.sandboxConfig.customHeadingLevel} 个层级进行结构化切分
          </div>
        </div>
        <div class="sandbox-param-row half">
          <label class="sp-checkbox">
            <input type="checkbox" ${(this.sandboxConfig.appendParentHeading !== false) ? 'checked' : ''} onchange="app.retrievalLabComponent.updateSandboxConfig('appendParentHeading', this.checked)">
            追加父级标题
          </label>
        </div>
        <div class="sandbox-param-row half">
          <label class="sp-label">最大分块大小 (Max Chunk Size)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" min="256" max="4096" step="128" value="${this.sandboxConfig.chunkSize || 512}" oninput="app.retrievalLabComponent.updateSandboxConfig('chunkSize', this.value)">
            <input type="number" class="form-input sp-input" value="${this.sandboxConfig.chunkSize || 512}" min="256" max="4096" onchange="app.retrievalLabComponent.updateSandboxConfig('chunkSize', this.value)">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">同级标题间内容的上限长度</div>
        </div>
        <div class="sandbox-param-row half">
          <label class="sp-label">重叠量 (Overlap)</label>
          <div class="slider-with-input">
            <input type="range" class="param-slider" min="0" max="200" step="10" value="${Math.min(this.sandboxConfig.overlap || 50, 100)}" oninput="app.retrievalLabComponent.updateSandboxConfig('overlap', this.value)">
            <input type="number" class="form-input sp-input" value="${Math.min(this.sandboxConfig.overlap || 50, 100)}" min="0" max="500" onchange="app.retrievalLabComponent.updateSandboxConfig('overlap', this.value)">
            <span class="param-unit">字符</span>
          </div>
          <div class="param-hint">结构化模式下 Overlap 通常较小或不需设置</div>
        </div>
      `;
    }
    return '';
  }

  _renderCurrentStrategy() {
    const kb = this.options.kb;
    const strategyName = kb?.config?.chunkStrategyName || '语义分割';
    const chunkSize = kb?.config?.chunkSize || 512;
    const overlap = kb?.config?.overlap || 50;
    const embedding = kb?.config?.embeddingModelName || 'BGE';
    return `
      <div class="current-strategy-info">
        <div class="csi-row">
          <div class="csi-item">
            <span class="csi-label">策略名称</span>
            <span class="csi-value">${strategyName}</span>
          </div>
          <div class="csi-item">
            <span class="csi-label">Embedding</span>
            <span class="csi-value">${embedding}</span>
          </div>
        </div>
        <div class="csi-row">
          <div class="csi-item">
            <span class="csi-label">Chunk 大小</span>
            <span class="csi-value">${chunkSize} tokens</span>
          </div>
          ${strategyName !== '语义分割' ? `
          <div class="csi-item">
            <span class="csi-label">重叠大小</span>
            <span class="csi-value">${overlap} tokens</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderSingleResults() {
    if (this.results.length === 0) {
      return `
        <div class="rlab-empty">
          <div class="rlab-empty-icon">🔍</div>
          <div class="rlab-empty-title">开始单点召回测试</div>
          <div class="rlab-empty-desc">输入 Query 后点击「开始测试」查看召回结果<br>系统将根据相似度从知识库中检索匹配的切片片段</div>
        </div>
      `;
    }
    return `
      <div class="rlab-results-header">
        <div class="rrh-info">
          <span class="rrh-badge">${this.results.length} 条召回结果</span>
          <span class="rrh-sort">按相似度降序排列</span>
        </div>
        <div class="rrh-actions">
          <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.addToTestSet()">
            ➕ 添加到测试集
          </button>
        </div>
      </div>
      <div class="rlab-results-list">
        ${this.results.map((r, i) => this._renderResultCard(r, i, 'single')).join('')}
      </div>
    `;
  }

  _renderBaselineResults() {
    const hasA = this.resultsA && this.resultsA.length > 0;
    const commonChunkIds = hasA && this.resultsB && this.resultsB.length > 0 ? this._findCommonChunks(this.resultsA, this.resultsB) : new Set();

    if (this.isTesting) {
      return '<div class="rcl-loading">正在检索中...</div>';
    }

    if (!hasA) {
      return '<div class="rcl-empty">请输入查询词并点击开始对比测试</div>';
    }

    return `
      <div class="rcl-list sync-scroll" id="baseline-results">
        ${this.resultsA.map((r, i) => this._renderCompareCard(r, i, 'a', commonChunkIds)).join('')}
      </div>
    `;
  }

  _renderSandboxResults() {
    const hasB = this.resultsB && this.resultsB.length > 0;
    const commonChunkIds = hasB && this.resultsA && this.resultsA.length > 0 ? this._findCommonChunks(this.resultsA, this.resultsB) : new Set();

    if (this.isTesting) {
      return '<div class="rcl-loading">正在检索中...</div>';
    }

    if (!hasB) {
      return '<div class="rcl-empty">请输入查询词并点击开始对比测试</div>';
    }

    return `
      <div class="rcl-list sync-scroll" id="sandbox-results">
        ${this.resultsB.map((r, i) => this._renderCompareCard(r, i, 'b', commonChunkIds, this.resultsA[i])).join('')}
      </div>
    `;
  }

  _renderCompareResults() {
    const hasA = this.resultsA && this.resultsA.length > 0;
    const hasB = this.resultsB && this.resultsB.length > 0;

    if (!hasA && !hasB) {
      return `
        <div class="rlab-empty">
          <div class="rlab-empty-icon">⚖️</div>
          <div class="rlab-empty-title">开始对比召回测试</div>
          <div class="rlab-empty-desc">输入 Query A 和 Query B 后点击「开始对比测试」<br>左侧使用当前策略，右侧使用 Sandbox 策略进行对比</div>
        </div>
      `;
    }

    const commonChunkIds = hasA && hasB ? this._findCommonChunks(this.resultsA, this.resultsB) : new Set();

    return `
      <div class="rlab-compare-layout">
        <div class="rcl-col">
          <div class="rcl-col-header">
            <span class="rcl-badge locked">🔒 Query A - 当前策略</span>
            <span class="rcl-count">${this.resultsA.length} 条</span>
          </div>
          <div class="rcl-list">
            ${hasA ? this.resultsA.map((r, i) => this._renderCompareCard(r, i, 'a', commonChunkIds)).join('') : '<div class="rcl-empty">暂无结果</div>'}
          </div>
        </div>
        <div class="rcl-divider"></div>
        <div class="rcl-col">
          <div class="rcl-col-header">
            <span class="rcl-badge sandbox">🧪 Query B - Sandbox</span>
            <span class="rcl-count">${this.resultsB.length} 条</span>
          </div>
          <div class="rcl-list">
            ${hasB ? this.resultsB.map((r, i) => this._renderCompareCard(r, i, 'b', commonChunkIds, this.resultsA[i])).join('') : '<div class="rcl-empty">暂无结果</div>'}
          </div>
        </div>
      </div>
    `;
  }

  _findCommonChunks(resultsA, resultsB) {
    const idsA = new Set(resultsA.map(r => r.chunkId));
    const common = new Set();
    resultsB.forEach(r => { if (idsA.has(r.chunkId)) common.add(r.chunkId); });
    return common;
  }

  _renderResultCard(result, index, mode) {
    const score = result.score || 0;
    const scoreColor = score >= 0.85 ? '#52c41a' : score >= 0.7 ? '#faad14' : '#ff4d4f';
    const scoreBg = score >= 0.85 ? '#f6ffed' : score >= 0.7 ? '#fffbe6' : '#fff1f0';
    const charCount = result.content?.length || 0;
    const tokenCount = Math.ceil(charCount / 1.8);
    const docName = result.docName || '未知文档';
    const path = result.path || '/';

    return `
      <div class="rlab-result-card fade-in-up" style="animation-delay:${index * 60}ms;">
        <div class="rrc-header">
          <div class="rrc-rank">#${index + 1}</div>
          <div class="rrc-meta">
            <span class="rrc-doc">${docName}</span>
            <span class="rrc-path">${path}</span>
          </div>
          <div class="rrc-score-box">
            <div class="rrc-score-ring" style="--score:${score};--color:${scoreColor}">
              <svg viewBox="0 0 36 36" class="ring-svg">
                <circle class="ring-bg" cx="18" cy="18" r="15.9"/>
                <circle class="ring-fill" cx="18" cy="18" r="15.9"
                  style="stroke-dasharray: ${(score * 100).toFixed(0)} 100;stroke:${scoreColor}"/>
              </svg>
              <span class="ring-text">${(score * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <div class="rrc-body" id="rrc-body-${result.chunkId}" onclick="app.retrievalLabComponent.toggleExpand('${result.chunkId}')">
          <div class="rrc-text-wrap">
            ${this._highlightContent(result.content, result.highlights)}
          </div>
          <div class="rrc-expand-hint">点击展开 ▾</div>
        </div>
        <div class="rrc-footer">
          <div class="rrc-stats">
            <span class="rs-item">📝 <b>${charCount}</b> 字符</span>
            <span class="rs-sep">|</span>
            <span class="rs-item">🔢 <b>${tokenCount}</b> tokens</span>
            <span class="rs-sep">|</span>
            <span class="rs-item">🏷️ <b>${result.chunkId}</b></span>
          </div>
          <div class="rrc-actions">
            <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.copyChunk('${result.chunkId}')">📋 复制</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderCompareCard(result, index, side, commonChunkIds, baselineResult) {
    const score = result.score || 0;
    const scoreColor = score >= 0.85 ? '#52c41a' : score >= 0.7 ? '#faad14' : '#ff4d4f';
    const scoreBg = score >= 0.85 ? '#f6ffed' : score >= 0.7 ? '#fffbe6' : '#fff1f0';
    const isCommon = commonChunkIds.has(result.chunkId);
    const charCount = result.content?.length || 0;
    const tokenCount = Math.ceil(charCount / 1.8);
    const docName = result.docName || '未知文档';

    // 计算差异
    let improvementTags = [];
    if (side === 'b' && baselineResult) {
      const baselineScore = baselineResult.score || 0;
      const baselineTokenCount = Math.ceil((baselineResult.content?.length || 0) / 1.8);
      
      if (score > baselineScore + 0.05) {
        improvementTags.push('<span class="result-improvement">分数提升</span>');
      } else if (score < baselineScore - 0.05) {
        improvementTags.push('<span class="result-worsening">分数下降</span>');
      }
      
      if (tokenCount < baselineTokenCount - 10) {
        improvementTags.push('<span class="result-improvement">Token减少</span>');
      } else if (tokenCount > baselineTokenCount + 10) {
        improvementTags.push('<span class="result-worsening">Token增加</span>');
      }
    }

    return `
      <div class="rcl-result-card ${isCommon ? 'common-chunk' : ''}" style="animation-delay:${index * 40}ms;">
        ${isCommon ? '<div class="common-indicator">⬆️ 相同内容</div>' : ''}
        <div class="rcl-card-header">
          <span class="rcl-rank">#${index + 1}</span>
          <span class="rcl-doc">${docName}</span>
          <span class="rcl-score" style="background:${scoreBg};color:${scoreColor}">${(score * 100).toFixed(0)}%</span>
        </div>
        <div class="rcl-card-body">
          <pre class="rcl-card-text">${this.escapeHtml(result.content?.substring(0, 200) || '')}${result.content?.length > 200 ? '...' : ''}</pre>
        </div>
        <div class="rcl-card-footer">
          <span class="rcl-meta">${charCount} 字符 · ${tokenCount} tokens</span>
          ${improvementTags.length > 0 ? `<div class="rcl-improvements">${improvementTags.join(' ')}</div>` : ''}
        </div>
      </div>
    `;
  }

  _renderHistorySidebar() {
    return `
      <div class="rlab-sidebar">
        <div class="rsb-section">
          <div class="rsb-header">
            <span class="rsb-title">📜 测试历史</span>
            <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.clearHistory()">清空</button>
          </div>
          <div class="rsb-list" id="rlab-history-list">
            ${this.testHistory.length === 0 ? '<div class="rsb-empty">暂无历史记录</div>' :
              this.testHistory.map((h, i) => `
                <div class="rsb-item history-card" onclick="app.retrievalLabComponent.replayHistory(${i})">
                  <div class="history-card-header">
                    <span class="history-tag ${h.mode === 'single' ? 'tag-single' : 'tag-compare'}">[${h.mode === 'single' ? '单点' : '对比'}]</span>
                    <span class="history-time">${h.time || new Date().toLocaleTimeString()}</span>
                    <button class="history-delete" onclick="event.stopPropagation(); app.retrievalLabComponent.deleteHistory(${i})">&times;</button>
                  </div>
                  <div class="history-card-content">
                    ${h.mode === 'single' ? 
                      `<div class="history-query">${h.query?.substring(0, 40)}${h.query?.length > 40 ? '...' : ''}</div>` : 
                      `<div class="history-query compare">Q1: ${h.queries?.[0]?.substring(0, 20)}${h.queries?.[0]?.length > 20 ? '...' : ''} / Q2: ${h.queries?.[1]?.substring(0, 20)}${h.queries?.[1]?.length > 20 ? '...' : ''}</div>`
                    }
                  </div>
                  <div class="history-card-footer">
                    ${h.mode === 'single' ? 
                      `<span class="history-stats">Top 1: ${(h.topScore || 0).toFixed(2)} | 召回: ${h.resultCount || 0}条</span>` : 
                      `<span class="history-stats">Q1: ${(h.topScoreA || 0).toFixed(2)}/${h.resultCountA || 0}条 | Q2: ${(h.topScoreB || 0).toFixed(2)}/${h.resultCountB || 0}条</span>`
                    }
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
        <div class="rsb-section">
          <div class="rsb-header">
            <span class="rsb-title">📚 测试集</span>
            <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.createTestSet()">+ 新建</button>
          </div>
          <div class="rsb-list" id="rlab-testsets-list">
            ${this.testSets.length === 0 ? '<div class="rsb-empty">暂无测试集</div>' :
              this.testSets.map((ts, i) => `
                <div class="rsb-item ${this.selectedTestSetIndex === i ? 'active' : ''}" onclick="app.retrievalLabComponent.openTestSetDrawer(${i})">
                  <div class="rsbi-name">${ts.name}</div>
                  <div class="rsbi-meta">${ts.items?.length || 0} 条用例</div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 为 Query 输入框添加拖拽事件
    const queryInput = document.getElementById('rlab-query');
    const queryAInput = document.getElementById('rlab-query-a');
    const queryBInput = document.getElementById('rlab-query-b');
    
    // 监听输入框变化
    if (queryInput) {
      queryInput.addEventListener('input', (e) => {
        this.config.query = e.target.value;
      });
    }
    
    if (queryAInput) {
      queryAInput.addEventListener('input', (e) => {
        this.config.queryA = e.target.value;
      });
    }
    
    if (queryBInput) {
      queryBInput.addEventListener('input', (e) => {
        this.config.queryB = e.target.value;
      });
    }
    
    const handleDragOver = (event) => {
      event.preventDefault();
      event.currentTarget.style.border = '2px dashed #1890ff';
      event.currentTarget.style.background = '#f0f9ff';
    };
    
    const handleDragLeave = (event) => {
      event.currentTarget.style.border = '';
      event.currentTarget.style.background = '';
    };
    
    const handleDrop = (event) => {
      event.preventDefault();
      event.currentTarget.style.border = '';
      event.currentTarget.style.background = '';
      
      try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const { setIndex, itemIndex } = data;
        
        // 根据输入框类型确定目标
        let target = 'A';
        if (event.currentTarget === queryBInput) {
          target = 'B';
        }
        
        this.fillQueryFromTestSet(setIndex, itemIndex, target);
      } catch (e) {
        console.error('拖拽数据解析失败:', e);
      }
    };
    
    if (queryInput) {
      queryInput.addEventListener('dragover', handleDragOver);
      queryInput.addEventListener('dragleave', handleDragLeave);
      queryInput.addEventListener('drop', handleDrop);
    }
    
    if (queryAInput) {
      queryAInput.addEventListener('dragover', handleDragOver);
      queryAInput.addEventListener('dragleave', handleDragLeave);
      queryAInput.addEventListener('drop', handleDrop);
    }
    
    if (queryBInput) {
      queryBInput.addEventListener('dragover', handleDragOver);
      queryBInput.addEventListener('dragleave', handleDragLeave);
      queryBInput.addEventListener('drop', handleDrop);
    }
  }

  switchMode(mode) {
    this.mode = mode;
    this.results = [];
    this.resultsA = [];
    this.resultsB = [];
    this.render();
    this.bindEvents();
  }

  // 打开测试集抽屉
  openTestSetDrawer(index) {
    this.selectedTestSetIndex = index;
    this.testSetDrawerVisible = true;
    this.render();
    this.bindEvents();
  }

  // 关闭测试集抽屉
  closeTestSetDrawer() {
    this.testSetDrawerVisible = false;
    this.render();
    this.bindEvents();
  }

  // 渲染测试集抽屉内容
  _renderTestSetDrawer(set, index) {
    if (!set) return '';
    return `
      <div class="test-set-drawer">
        <div class="test-set-drawer-content">
          <div class="test-set-drawer-header">
            <div class="test-set-selector">
              <label for="test-set-select" class="test-set-select-label">测试集:</label>
              <select id="test-set-select" class="test-set-select" onchange="app.retrievalLabComponent.switchTestSet(this.value)">
                ${this.testSets.map((ts, i) => `
                  <option value="${i}" ${i === index ? 'selected' : ''}>${ts.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="test-set-drawer-header-actions">
              <button class="btn btn-primary btn-sm" onclick="app.retrievalLabComponent.showAddTestCaseModal(${index})" title="添加新的测试用例">
                &plus; 新增用例
              </button>
              <button class="test-set-drawer-close" onclick="app.retrievalLabComponent.closeTestSetDrawer()" title="关闭">
                &times;
              </button>
            </div>
          </div>
          <div class="test-set-drawer-body">
            <div class="test-set-info">
              <div class="test-set-meta">${set.items?.length || 0} 条测试用例</div>
            </div>
            <div class="test-set-cases">
              ${set.items?.length > 0 ? `
                ${set.items.map((item, i) => `
                  <div class="test-set-case ${item.status === 'failed' ? 'test-case-failed' : ''} ${item.hasRun ? 'test-case-has-results' : ''} ${item.isDebugging ? 'test-case-debugging' : ''}" 
                       id="test-case-${index}-${i}" 
                       draggable="true"
                       ondragstart="app.retrievalLabComponent.onDragStart(event, ${index}, ${i})"
                       ondragend="app.retrievalLabComponent.onDragEnd(event)">
                    <div class="test-set-case-header">
                      <span class="test-set-case-index">用例 ${i + 1}</span>
                      ${item.runTime ? `<span class="run-time-badge" title="结果生成时间: ${new Date(item.runTime).toLocaleString()}">⏱️ ${this._formatRunTime(item.runTime)}</span>` : ''}
                      ${item.isDebugging ? `<span class="debugging-badge" title="当前正在调试中">🔧 调试中</span>` : ''}
                      <div class="test-set-case-actions">
                        <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.editTestCase(${index}, ${i})" title="编辑用例">
                          ✏️ 编辑
                        </button>
                        <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.removeTestCase(${index}, ${i})" title="删除用例">
                          🗑️ 移除
                        </button>
                        <button class="btn btn-primary btn-sm" 
                                onclick="app.retrievalLabComponent.fillQueryFromTestSet(${index}, ${i})" 
                                title="将 Query 填入调试区域">
                          作为 Query 填入
                        </button>
                      </div>
                    </div>
                    <div class="test-set-case-content">
                      <!-- Query 区域 -->
                      <div class="test-set-case-query">
                        <span class="test-set-case-label">🔍 Query:</span>
                        <span class="test-set-case-text">${item.query}</span>
                      </div>
                      
                      <!-- 预期答案区域 - 默认隐藏，鼠标悬浮显示气泡 -->
                      ${item.expected ? `
                        <div class="test-set-case-expected">
                          <div class="expected-header" title="${this._escapeHtml(item.expected)}">
                            <span class="test-set-case-label">📋 预期目标:</span>
                            <span class="expected-bubble-icon">💬</span>
                          </div>
                        </div>
                      ` : ''}
                      
                      <!-- 运行中状态 -->
                      ${item.status === 'running' ? `
                        <div class="test-set-case-running-state">
                          <div class="running-indicator">
                            <div class="loading-spinner"></div>
                            <span>正在检索中...</span>
                          </div>
                          <div class="running-progress-bar">
                            <div class="progress-fill"></div>
                          </div>
                        </div>
                      ` : ''}
                      
                      <!-- 实际结果区域 - 仅在运行后显示 -->
                      ${item.hasRun && item.status !== 'running' ? `
                        <div class="test-set-case-results-section">
                          <div class="results-header">
                            <span class="results-title">📊 召回结果</span>
                            ${item.runTime ? `<span class="results-time">生成于: ${new Date(item.runTime).toLocaleTimeString()}</span>` : ''}
                          </div>
                          
                          ${this.mode === 'compare' && item.baselineResults && item.sandboxResults ? `
                            <!-- 对比模式：并排展示 Baseline 和 Sandbox -->
                            <div class="compare-results-container">
                              <div class="compare-column baseline-column">
                                <div class="column-header">
                                  <span class="column-badge baseline-badge">Baseline</span>
                                  ${item.baselineSemanticScore !== undefined ? `
                                    <span class="column-score ${item.baselineSemanticScore >= 0.6 ? 'score-good' : 'score-bad'}">${(item.baselineSemanticScore * 100).toFixed(0)}%</span>
                                  ` : ''}
                                </div>
                                <div class="column-results-list">
                                  ${item.baselineResults.slice(0, 3).map((result, ri) => `
                                    <div class="result-item">
                                      <span class="result-match-rate">${(result.score * 100).toFixed(0)}%</span>
                                      <span class="result-snippet">${result.content.substring(0, 120)}${result.content.length > 120 ? '...' : ''}</span>
                                    </div>
                                  `).join('')}
                                </div>
                              </div>
                              
                              <div class="vs-divider">VS</div>
                              
                              <div class="compare-column sandbox-column">
                                <div class="column-header">
                                  <span class="column-badge sandbox-badge">Sandbox</span>
                                  ${item.sandboxSemanticScore !== undefined ? `
                                    <span class="column-score ${item.sandboxSemanticScore >= 0.6 ? 'score-good' : 'score-bad'}">${(item.sandboxSemanticScore * 100).toFixed(0)}%</span>
                                  ` : ''}
                                </div>
                                <div class="column-results-list">
                                  ${item.sandboxResults.slice(0, 3).map((result, ri) => `
                                    <div class="result-item">
                                      <span class="result-match-rate">${(result.score * 100).toFixed(0)}%</span>
                                      <span class="result-snippet">${result.content.substring(0, 120)}${result.content.length > 120 ? '...' : ''}</span>
                                    </div>
                                  `).join('')}
                                </div>
                              </div>
                            </div>
                            
                            <!-- 对比评分 -->
                            ${(item.baselineSemanticScore !== undefined && item.sandboxSemanticScore !== undefined) ? `
                              <div class="comparison-summary">
                                <div class="comparison-item">
                                  <span class="comparison-label">Baseline 匹配度:</span>
                                  <span class="comparison-value ${item.baselineSemanticScore >= 0.6 ? 'good' : 'bad'}">${(item.baselineSemanticScore * 100).toFixed(1)}%</span>
                                </div>
                                <div class="comparison-item">
                                  <span class="comparison-label">Sandbox 匹配度:</span>
                                  <span class="comparison-value ${item.sandboxSemanticScore >= 0.6 ? 'good' : 'bad'}">${(item.sandboxSemanticScore * 100).toFixed(1)}%</span>
                                </div>
                                <div class="comparison-diff">
                                  <span class="diff-label">差异:</span>
                                  <span class="diff-value">${((item.sandboxSemanticScore - item.baselineSemanticScore) * 100).toFixed(1)}%</span>
                                  <span class="diff-arrow ${item.sandboxSemanticScore >= item.baselineSemanticScore ? 'positive' : 'negative'}">
                                    ${item.sandboxSemanticScore > item.baselineSemanticScore ? '↑' : '↓'}
                                  </span>
                                </div>
                              </div>
                            ` : ''}
                          ` : `
                            <!-- 单点模式或无对比数据 -->
                            <div class="single-mode-results">
                              ${item.results && item.results.length > 0 ? `
                                <div class="single-results-list">
                                  ${item.results.slice(0, 5).map((result, ri) => `
                                    <div class="result-card ${ri === 0 ? 'top-result' : ''}">
                                      <div class="result-header">
                                        <span class="result-rank">#${ri + 1}</span>
                                        <span class="result-score-value ${result.score >= 0.8 ? 'excellent' : result.score >= 0.6 ? 'good' : 'poor'}">
                                          ${(result.score * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                      <div class="result-body">
                                        ${result.content.substring(0, 200)}${result.content.length > 200 ? '...' : ''}
                                      </div>
                                      ${ri === 0 && item.expected ? `
                                        <div class="top-result-evaluation">
                                          <span class="eval-label">与预期匹配度:</span>
                                          <span class="eval-score ${item.semanticScore >= 0.6 ? 'good' : 'bad'}">
                                            ${item.semanticScore !== undefined ? (item.semanticScore * 100).toFixed(0) + '%' : '-'}
                                          </span>
                                        </div>
                                      ` : ''}
                                    </div>
                                  `).join('')}
                                </div>
                                
                                ${item.results.length > 5 ? `
                                  <div class="more-results-hint">
                                    还有 ${item.results.length - 5} 条结果未显示...
                                  </div>
                                ` : ''}
                                
                                ${item.semanticScore !== undefined ? `
                                  <div class="overall-evaluation">
                                    <div class="eval-main">
                                      <span class="eval-icon">🎯</span>
                                      <span class="eval-title">语义相似度评分</span>
                                    </div>
                                    <div class="eval-score-display">
                                      <span class="eval-big-score ${item.semanticScore >= 0.6 ? 'good' : 'bad'}">
                                        ${(item.semanticScore * 100).toFixed(1)}%
                                      </span>
                                      <span class="eval-desc">
                                        ${item.semanticScore >= 0.8 ? '优秀匹配' : item.semanticScore >= 0.6 ? '良好匹配' : '匹配度较低，建议优化'}
                                      </span>
                                    </div>
                                    <div class="eval-tooltip-trigger">
                                      <span class="info-icon">ℹ️</span>
                                      <span class="eval-tooltip-text">基于预期目标与最高匹配结果的语义相似度计算</span>
                                    </div>
                                  </div>
                                ` : ''}
                              ` : `
                                <div class="no-results-warning">
                                  <span class="warning-icon">⚠️</span>
                                  <span>未检索到任何结果</span>
                                </div>
                              `}
                            </div>
                          `}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              ` : `
                <div class="test-set-empty">
                  <div class="empty-icon">📝</div>
                  <div class="empty-title">暂无测试用例</div>
                  <div class="empty-desc">添加测试用例以验证检索效果</div>
                  <button class="btn btn-primary" onclick="app.retrievalLabComponent.showAddTestCaseModal(${index})">
                    立即添加测试用例
                  </button>
                </div>
              `}
            </div>
          </div>
          <div class="test-set-drawer-footer">
            <button class="btn btn-default" onclick="app.retrievalLabComponent.closeTestSetDrawer()">取消</button>
          </div>
        </div>
      </div>
    `;
  }

  // 从测试集填充Query
  fillQueryFromTestSet(setIndex, itemIndex, target) {
    const set = this.testSets[setIndex];
    if (!set || !set.items || !set.items[itemIndex]) return;
    
    const item = set.items[itemIndex];
    
    if (this.mode === 'single' || target) {
      // 单栏模式或指定目标：直接填充
      item.isDebugging = true;
      if (this.mode === 'single') {
        this.config.query = item.query;
      } else if (target === 'A') {
        this.config.queryA = item.query;
      } else if (target === 'B') {
        this.config.queryB = item.query;
      }
      this.closeTestSetDrawer();
      this.render();
      this.bindEvents();
      this.showMessage(`✅ 已将测试用例 ${itemIndex + 1} 载入调试区域`);
    } else {
      // 对比模式：弹出选择菜单
      this.showCompareModeMenu(setIndex, itemIndex);
    }
  }

  // 显示对比模式选择菜单
  showCompareModeMenu(setIndex, itemIndex) {
    // 创建弹出菜单
    const menu = document.createElement('div');
    menu.className = 'compare-mode-menu';
    menu.innerHTML = `
      <div class="menu-content">
        <div class="menu-title">选择填入位置</div>
        <div class="menu-items">
          <div class="menu-item" onclick="app.retrievalLabComponent.fillToTarget(${setIndex}, ${itemIndex}, 'A')">
            🎯 填入基准组 (A)
          </div>
          <div class="menu-item" onclick="app.retrievalLabComponent.fillToTarget(${setIndex}, ${itemIndex}, 'B')">
            📊 填入实验组 (B)
          </div>
        </div>
      </div>
    `;
    
    // 添加到页面
    document.body.appendChild(menu);
    
    // 点击其他地方关闭
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('.compare-mode-menu')) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 10);
  }

  // 填充到指定目标
  fillToTarget(setIndex, itemIndex, target) {
    const set = this.testSets[setIndex];
    if (!set || !set.items || !set.items[itemIndex]) return;
    
    const item = set.items[itemIndex];
    item.isDebugging = true;
    
    if (target === 'A') {
      this.config.queryA = item.query;
    } else {
      this.config.queryB = item.query;
    }
    
    // 关闭菜单
    const menu = document.querySelector('.compare-mode-menu');
    if (menu) menu.remove();
    
    this.closeTestSetDrawer();
    this.render();
    this.bindEvents();
    this.showMessage(`✅ 已将测试用例 ${itemIndex + 1} 载入 ${target === 'A' ? '基准组 (A)' : '实验组 (B)'}`);
  }

  // 显示填充Query下拉菜单
  showFillQueryDropdown(event, setIndex, itemIndex) {
    event.stopPropagation();
    
    // 关闭其他下拉菜单
    document.querySelectorAll('.fill-query-dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
    
    // 显示当前下拉菜单
    const dropdown = document.getElementById(`fill-dropdown-${setIndex}-${itemIndex}`);
    if (dropdown) {
      dropdown.style.display = 'block';
    }
    
    // 点击其他地方关闭
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.fill-query-dropdown')) {
          if (dropdown) {
            dropdown.style.display = 'none';
          }
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 10);
  }

  // 切换测试集
  switchTestSet(index) {
    const setIndex = parseInt(index);
    if (setIndex >= 0 && setIndex < this.testSets.length) {
      this.selectedTestSetIndex = setIndex;
      this.render();
      this.bindEvents();
    }
  }

  // 拖拽开始
  onDragStart(event, setIndex, itemIndex) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ setIndex, itemIndex }));
    event.currentTarget.style.opacity = '0.5';
  }

  // 拖拽结束
  onDragEnd(event) {
    event.currentTarget.style.opacity = '1';
  }

  // 在当前模式下运行测试集全集
  runTestSetInCurrentMode(setIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items || set.items.length === 0) return;
    
    this.closeTestSetDrawer();
    
    if (this.mode === 'single') {
      // 单点模式下运行第一个测试用例
      if (set.items.length > 0) {
        this.config.query = set.items[0].query;
        this.runTest();
      }
    } else {
      // 对比模式下运行第一个测试用例
      if (set.items.length > 0) {
        this.config.queryA = set.items[0].query;
        this.config.queryB = set.items[0].query;
        this.runCompareTest();
      }
    }
  }

  // 运行单个测试用例
  runSingleTestCase(setIndex, itemIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items || !set.items[itemIndex]) return;
    
    const item = set.items[itemIndex];
    item.status = 'running';
    this.render();
    
    // 模拟测试运行
    setTimeout(() => {
      item.status = 'completed';
      item.hasRun = true;
      item.runTime = Date.now();
      // 模拟结果
      item.results = [
        {
          score: Math.random() * 0.3 + 0.7,
          content: '这是模拟的召回结果1...',
          chunkId: 'chunk1',
          docName: '测试文档'
        },
        {
          score: Math.random() * 0.2 + 0.5,
          content: '这是模拟的召回结果2...',
          chunkId: 'chunk2',
          docName: '测试文档'
        }
      ];
      item.semanticScore = Math.random() * 0.4 + 0.6;
      this.render();
    }, 1000);
  }

  // 运行所有测试用例
  runAllTestCases(setIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items || set.items.length === 0) return;
    
    let completed = 0;
    const total = set.items.length;
    
    set.items.forEach((item, index) => {
      item.status = 'running';
    });
    
    this.render();
    
    // 模拟批量运行
    set.items.forEach((item, index) => {
      setTimeout(() => {
        item.status = 'completed';
        item.hasRun = true;
        item.runTime = Date.now();
        // 模拟结果
        item.results = [
          {
            score: Math.random() * 0.3 + 0.7,
            content: '这是模拟的召回结果1...',
            chunkId: 'chunk1',
            docName: '测试文档'
          }
        ];
        item.semanticScore = Math.random() * 0.4 + 0.6;
        
        completed++;
        if (completed === total) {
          this.render();
        }
      }, index * 500);
    });
  }

  // 运行选中的测试用例
  runSelectedTestCases(setIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items) return;
    
    const selectedItems = set.items.filter((item, index) => {
      const checkbox = document.querySelector(`.test-case-checkbox[data-set="${setIndex}"][data-item="${index}"]`);
      return checkbox && checkbox.checked;
    });
    
    if (selectedItems.length === 0) {
      this.showMessage('请先选择测试用例');
      return;
    }
    
    selectedItems.forEach(item => {
      item.status = 'running';
    });
    
    this.render();
    
    // 模拟运行
    setTimeout(() => {
      selectedItems.forEach(item => {
        item.status = 'completed';
        item.hasRun = true;
        item.runTime = Date.now();
        // 模拟结果
        item.results = [
          {
            score: Math.random() * 0.3 + 0.7,
            content: '这是模拟的召回结果...',
            chunkId: 'chunk1',
            docName: '测试文档'
          }
        ];
        item.semanticScore = Math.random() * 0.4 + 0.6;
      });
      this.render();
    }, 1000);
  }

  // 批量删除测试用例
  batchDelete(setIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items) return;
    
    const selectedIndices = [];
    set.items.forEach((item, index) => {
      const checkbox = document.querySelector(`.test-case-checkbox[data-set="${setIndex}"][data-item="${index}"]`);
      if (checkbox && checkbox.checked) {
        selectedIndices.push(index);
      }
    });
    
    if (selectedIndices.length === 0) {
      this.showMessage('请先选择测试用例');
      return;
    }
    
    // 从后往前删除，避免索引混乱
    selectedIndices.sort((a, b) => b - a).forEach(index => {
      set.items.splice(index, 1);
    });
    
    this.render();
    this.showMessage(`已删除 ${selectedIndices.length} 条测试用例`);
  }

  // 批量导出测试用例
  batchExport(setIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items) return;
    
    const selectedItems = set.items.filter((item, index) => {
      const checkbox = document.querySelector(`.test-case-checkbox[data-set="${setIndex}"][data-item="${index}"]`);
      return checkbox && checkbox.checked;
    });
    
    if (selectedItems.length === 0) {
      this.showMessage('请先选择测试用例');
      return;
    }
    
    // 导出为JSON
    const exportData = selectedItems.map(item => ({
      query: item.query,
      expected: item.expected,
      semanticScore: item.semanticScore
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set.name}_导出_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showMessage(`已导出 ${selectedItems.length} 条测试用例`);
  }

  // 切换全选
  toggleSelectAll(setIndex, checked) {
    document.querySelectorAll(`.test-case-checkbox[data-set="${setIndex}"]`).forEach(checkbox => {
      checkbox.checked = checked;
    });
    this.updateBulkButtons(setIndex);
  }

  // 更新批量操作按钮状态
  updateBulkButtons(setIndex) {
    const checkboxes = document.querySelectorAll(`.test-case-checkbox[data-set="${setIndex}"]`);
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    const batchDeleteBtn = document.getElementById(`batch-delete-${setIndex}`);
    const batchRunBtn = document.getElementById(`batch-run-${setIndex}`);
    const batchExportBtn = document.getElementById(`batch-export-${setIndex}`);
    
    if (batchDeleteBtn) batchDeleteBtn.disabled = checkedCount === 0;
    if (batchRunBtn) batchRunBtn.disabled = checkedCount === 0;
    if (batchExportBtn) batchExportBtn.disabled = checkedCount === 0;
  }

  // 编辑测试用例
  editTestCase(setIndex, itemIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items || !set.items[itemIndex]) return;
    
    const item = set.items[itemIndex];
    const newQuery = prompt('请输入新的Query:', item.query);
    if (newQuery !== null) {
      item.query = newQuery;
      const newExpected = prompt('请输入新的预期答案:', item.expected);
      if (newExpected !== null) {
        item.expected = newExpected;
      }
      this.render();
      this.showMessage('测试用例已更新');
    }
  }

  // 移除测试用例
  removeTestCase(setIndex, itemIndex) {
    const set = this.testSets[setIndex];
    if (!set || !set.items || !set.items[itemIndex]) return;
    
    if (confirm('确定要删除这个测试用例吗？')) {
      set.items.splice(itemIndex, 1);
      this.render();
      this.showMessage('测试用例已删除');
    }
  }

  // 显示添加测试用例模态框
  showAddTestCaseModal(setIndex) {
    const set = this.testSets[setIndex];
    if (!set) return;
    
    const query = prompt('请输入测试 Query:');
    if (query) {
      const expected = prompt('请输入预期答案:');
      if (expected) {
        if (!set.items) set.items = [];
        set.items.push({
          query,
          expected,
          hasRun: false
        });
        this.render();
        this.showMessage('测试用例已添加');
      }
    }
  }

  // 创建测试集
  createTestSet() {
    const name = prompt('请输入测试集名称:');
    if (name) {
      this.testSets.push({
        name,
        items: []
      });
      this.render();
      this.showMessage('测试集已创建');
    }
  }

  // 格式化运行时间
  _formatRunTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }

  // 转义HTML
  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 高亮内容
  _highlightContent(content, highlights) {
    if (!content) return '';
    if (!highlights || highlights.length === 0) return content;
    
    let result = content;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      result = result.replace(regex, '<mark class="highlight">$1</mark>');
    });
    return result;
  }

  // 切换侧边栏
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.render();
    this.bindEvents();
  }

  // 显示消息
  showMessage(message) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = 'rlab-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #52c41a;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(messageEl);
    
    // 3秒后移除
    setTimeout(() => {
      messageEl.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => messageEl.remove(), 300);
    }, 3000);
  }

  // 其他方法...
  changeScope(scope) {
    // 实现检索范围切换逻辑
  }

  updateParam(param, value) {
    this.config[param] = parseFloat(value);
    this.render();
    this.bindEvents();
  }

  updateSandboxConfig(key, value) {
    this.sandboxConfig[key] = value;
    this.sandboxChanged = true;
    this.render();
    this.bindEvents();
  }

  setSandboxStrategy(strategy) {
    this.sandboxStrategy = strategy;
    this.sandboxChanged = true;
    this.render();
    this.bindEvents();
  }

  runTest() {
    // 直接从DOM中获取输入框的值
    const queryInput = document.getElementById('rlab-query');
    const query = queryInput ? queryInput.value.trim() : '';
    
    if (!query) {
      this.showMessage('请输入查询词');
      return;
    }

    // 更新config中的值
    this.config.query = query;

    this.isTesting = true;
    this.render();

    // 模拟测试运行
    setTimeout(() => {
      // 生成模拟结果
      this.results = Array.from({ length: this.config.topK }, (_, i) => ({
        score: Math.random() * 0.3 + 0.7 - i * 0.05,
        content: `这是模拟的召回结果 ${i + 1}：${query} 的相关内容...`,
        chunkId: `chunk${i + 1}`,
        docName: '测试文档',
        path: '/test/doc'
      }));

      // 记录测试历史
      const historyItem = {
        mode: 'single',
        query: query,
        topK: this.config.topK,
        threshold: this.config.threshold,
        time: new Date().toLocaleString(),
        topScore: this.results[0]?.score || 0,
        resultCount: this.results.length,
        results: this.results
      };

      // 添加到历史记录并按时间倒序排序
      this.testHistory.unshift(historyItem);

      this.isTesting = false;
      this.render();
      this.bindEvents();
      this.showMessage('测试完成');
    }, 1000);
  }

  runCompareTest() {
    // 直接从DOM中获取输入框的值
    const queryAInput = document.getElementById('rlab-query-a');
    const queryBInput = document.getElementById('rlab-query-b');
    const queryA = queryAInput ? queryAInput.value.trim() : '';
    const queryB = queryBInput ? queryBInput.value.trim() : '';
    
    if (!queryA || !queryB) {
      this.showMessage('请输入查询词 A 和 B');
      return;
    }

    // 更新config中的值
    this.config.queryA = queryA;
    this.config.queryB = queryB;

    this.isTesting = true;
    this.render();

    // 模拟测试运行
    setTimeout(() => {
      // 生成模拟结果 A
      this.resultsA = Array.from({ length: this.config.topK }, (_, i) => ({
        score: Math.random() * 0.3 + 0.7 - i * 0.05,
        content: `这是模拟的 Baseline 结果 ${i + 1}：${queryA} 的相关内容...`,
        chunkId: `chunkA${i + 1}`,
        docName: '测试文档',
        path: '/test/doc'
      }));

      // 生成模拟结果 B
      this.resultsB = Array.from({ length: this.config.topK }, (_, i) => ({
        score: Math.random() * 0.3 + 0.7 - i * 0.05,
        content: `这是模拟的 Sandbox 结果 ${i + 1}：${queryB} 的相关内容...`,
        chunkId: `chunkB${i + 1}`,
        docName: '测试文档',
        path: '/test/doc'
      }));

      // 记录测试历史
      const historyItem = {
        mode: 'compare',
        queries: [queryA, queryB],
        topK: this.config.topK,
        threshold: this.config.threshold,
        sandboxStrategy: this.sandboxStrategy,
        sandboxConfig: { ...this.sandboxConfig },
        time: new Date().toLocaleString(),
        topScoreA: this.resultsA[0]?.score || 0,
        topScoreB: this.resultsB[0]?.score || 0,
        resultCountA: this.resultsA.length,
        resultCountB: this.resultsB.length,
        resultsA: this.resultsA,
        resultsB: this.resultsB
      };

      // 添加到历史记录并按时间倒序排序
      this.testHistory.unshift(historyItem);

      this.isTesting = false;
      this.render();
      this.bindEvents();
      this.showMessage('对比测试完成');
    }, 1500);
  }

  addToTestSet() {
    // 实现添加到测试集逻辑
  }

  exportResults() {
    // 实现导出结果逻辑
  }

  clearHistory() {
    this.testHistory = [];
    this.render();
    this.bindEvents();
  }

  deleteHistory(index) {
    this.testHistory.splice(index, 1);
    this.render();
    this.bindEvents();
  }

  replayHistory(index) {
    const historyItem = this.testHistory[index];
    if (!historyItem) return;

    // 切换到对应的模式
    this.mode = historyItem.mode;

    // 回填参数
    this.config.topK = historyItem.topK;
    this.config.threshold = historyItem.threshold;

    if (historyItem.mode === 'single') {
      // 单点模式
      this.config.query = historyItem.query;
      this.results = historyItem.results || [];
      this.resultsA = [];
      this.resultsB = [];
    } else if (historyItem.mode === 'compare') {
      // 对比模式
      this.config.queryA = historyItem.queries[0];
      this.config.queryB = historyItem.queries[1];
      this.resultsA = historyItem.resultsA || [];
      this.resultsB = historyItem.resultsB || [];
      this.results = [];

      // 恢复 Sandbox 策略和配置
      if (historyItem.sandboxStrategy) {
        this.sandboxStrategy = historyItem.sandboxStrategy;
      }
      if (historyItem.sandboxConfig) {
        this.sandboxConfig = { ...historyItem.sandboxConfig };
      }
    }

    this.render();
    this.bindEvents();
    this.showMessage('历史记录回放完成');
  }

  toggleExpand(chunkId) {
    // 实现结果卡片展开/折叠逻辑
  }

  copyChunk(chunkId) {
    // 实现复制切片内容逻辑
  }
}