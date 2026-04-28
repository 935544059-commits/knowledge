/**
 * 工作台产品中心 - RAG 知识库全链路管理系统
 * 主应用：知识库列表 / 4步向导创建 / 详情文档管理 / 切片编辑+召回测试
 */

class KnowledgeBaseApp {
  constructor() {
    this.currentPage = 'list';
    this.currentKB = null;
    this.currentDoc = null;
    this.chunkConfigComponent = null;
    this.retrievalTestComponent = null;
    this.init();
  }

  init() {
    this.renderLayout();
    this.bindEvents();
    this.navigateTo('list');
  }

  renderLayout() {
    document.body.innerHTML = `
      <div class="app-container">
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">AI</div>
            <span class="sidebar-title">智能体运营</span>
          </div>
          <nav class="sidebar-menu">
            <div class="menu-item" data-page="home"><span class="menu-icon">🏠</span><span>首页</span></div>
            <div class="menu-item" data-page="agent"><span class="menu-icon">🤖</span><span>智能体管理</span></div>
            <div class="menu-item active" data-page="knowledge"><span class="menu-icon">📚</span><span>知识库管理</span></div>
            <div class="menu-item" data-page="model-management"><span class="menu-icon">🧠</span><span>模型管理</span></div>
            <div class="menu-item" data-page="feedback"><span class="menu-icon">💬</span><span>反馈信息管理</span></div>
            <div class="menu-item" data-page="settings"><span class="menu-icon">⚙️</span><span>个性化设置</span></div>
            <div class="menu-item" data-page="user"><span class="menu-icon">👤</span><span>用户权限</span></div>
            <div class="menu-item" data-page="onboarding-rag"><span class="menu-icon">⚙️</span><span>RAG 环境初始化 <span class="menu-tag">(仅演示用)</span></span></div>
          </nav>
        </aside>

        <main class="main-content">
          <header class="header">
            <div class="header-left">
              <div class="breadcrumb" id="breadcrumb">
                <span class="breadcrumb-item active">知识库管理</span>
              </div>
            </div>
            <div class="header-right">
              <span style="color:#8c8c8c;cursor:pointer;">🔔</span>
              <span style="color:#8c8c8c;cursor:pointer;margin-left:16px;">⚙️</span>
              <div class="user-info">
                <div class="user-avatar">马</div>
                <span>Madaya ▾</span>
              </div>
            </div>
          </header>
          <div class="page-content" id="page-content"></div>
        </main>
      </div>
      <div id="modal-container"></div>
    `;
  }

  bindEvents() {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page === 'knowledge') {
          this.currentPage = 'list';
          this.renderPage('list');
        } else if (page === 'settings') {
          this.navigateTo('settings');
        } else if (page === 'model') {
          this.navigateTo('model');
        } else if (page === 'compute-storage') {
          this.navigateTo('compute-storage');
        } else if (page === 'storage') {
          this.navigateTo('storage');
        } else if (page === 'model-management') {
          this.navigateTo('model-management');
        } else if (page === 'onboarding-rag') {
          this.navigateTo('onboarding-rag');
        }
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  navigateTo(page, params = {}) {
    this.currentPage = page;
    if (page === 'detail') this.currentKB = params.kb;
    if (page === 'chunks') { this.currentKB = params.kb; this.currentDoc = params.doc; }
    if (page === 'edit') this.currentKB = params.kb;
    this.renderPage(page, params);
  }

  renderPage(page, params = {}) {
    const content = document.getElementById('page-content');
    const breadcrumb = document.getElementById('breadcrumb');

    switch (page) {
      case 'list':
        breadcrumb.innerHTML = '<span class="breadcrumb-item active">知识库管理</span>';
        this.renderKnowledgeList(content);
        break;
      case 'detail':
        breadcrumb.innerHTML = `
          <span class="breadcrumb-item" onclick="app.navigateTo('list')">知识库管理</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item active">${params.kb.name}</span>`;
        this.renderKnowledgeDetail(content, params.kb);
        break;
      case 'chunks':
        breadcrumb.innerHTML = `
          <span class="breadcrumb-item" onclick="app.navigateTo('list')">知识库管理</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item" onclick="app.navigateTo('detail',{kb:app.currentKB})">${params.kb.name}</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item active">文档切片</span>`;
        this.renderChunkEditorPage(content, params.kb, params.doc);
        break;
      case 'edit':
        breadcrumb.innerHTML = `
          <span class="breadcrumb-item" onclick="app.navigateTo('list')">知识库管理</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item" onclick="app.navigateTo('detail',{kb:app.currentKB})">${params.kb.name}</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item active">编辑</span>`;
        this.renderKnowledgeEdit(content, params.kb);
        break;
      case 'settings':
        breadcrumb.innerHTML = '<span class="breadcrumb-item active">个性化设置</span>';
        this.renderSettings(content);
        break;
      case 'model':
        breadcrumb.innerHTML = '<span class="breadcrumb-item active">模型管理</span>';
        this.renderModelManagement(content);
        break;
      case 'compute-storage':
        breadcrumb.innerHTML = '<span class="breadcrumb-item active">算力与存储</span>';
        this.renderComputeStorage(content);
        break;

      case 'model-management':
        breadcrumb.innerHTML = `
          <span class="breadcrumb-item" onclick="app.navigateTo('compute-storage')">算力与存储</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item active">模型管理</span>`;
        this.renderModelManagement(content);
        break;
      case 'onboarding-rag':
        breadcrumb.innerHTML = '<span class="breadcrumb-item active">RAG 环境初始化</span>';
        this.renderRAGOnboardingGuide(content);
        break;
    }
  }

  // ========== 知识库列表页 ==========
  renderKnowledgeList(container) {
    container.innerHTML = `
      <div class="page-header-row">
        <div class="ph-left">
          <h2 class="page-title-lg">知识库管理</h2>
          <p class="page-subtitle">管理和配置 RAG 知识库，支持文档上传、切片策略、向量化和检索测试全链路</p>
        </div>
        <button class="btn btn-primary btn-lg" onclick="app.openCreateWizard()">
          <span class="btn-plus">+</span> 新建知识库
        </button>
      </div>

      <div class="kb-layout">
        <div class="kb-sidebar-tree">
          <div class="tree-card">
            <div class="tree-search-box">
              <input type="text" placeholder="筛选分类..." class="tree-search-input">
            </div>
            ${this.renderCategoryTree(window.categories || [])}
          </div>
        </div>

        <div class="kb-main-area">
          <div class="kb-toolbar">
            <div class="search-box kb-search">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="搜索知识库名称或描述..." id="kb-search-input">
            </div>
            <div class="kb-toolbar-right">
            </div>
          </div>
          <div class="kb-grid" id="kb-grid">${this.renderKBCards(window.knowledgeBases || [])}</div>
          <div class="pagination-bar">
            <span class="pagi-info">共 ${(window.knowledgeBases || []).length} 条</span>
            <div class="pagi-btns">
              <button class="page-btn" disabled>‹</button>
              <button class="page-btn active">1</button>
              <button class="page-btn">›</button>
            </div>
            <select class="form-select form-select-sm pagi-size"><option>10条/页</option></select>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.kb-card').forEach(card => {
      card.addEventListener('click', () => {
        const kb = (window.knowledgeBases || []).find(k => k.id === card.dataset.id);
        if (kb) this.navigateTo('detail', { kb });
      });
    });

    container.querySelectorAll('.tree-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        container.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  renderCategoryTree(cats, level = 0) {
    return cats.map(cat => `
      <div class="tree-item ${level === 0 ? 'active' : ''}" style="padding-left:${12 + level * 18}px;">
        ${cat.children ? `<span class="tree-arrow expanded" onclick="this.parentElement.classList.toggle('collapsed');this.classList.toggle('expanded');event.stopPropagation();">▶</span>` : '<span style="width:14px;"></span>'}
        <span class="tree-dot"></span>
        <span class="tree-name">${cat.name}</span>
        <span class="tree-count">${cat.count}</span>
      </div>
      ${cat.children ? `<div class="tree-children">${this.renderCategoryTree(cat.children, level + 1)}</div>` : ''}
    `).join('');
  }

  renderKBCards(kbs) {
    return kbs.map(kb => `
      <div class="kb-card" data-id="${kb.id}">
        <div class="kb-card-top">
          <div class="kb-icon-wrap"><span class="kb-icon-emoji">📚</span></div>
          <div class="kb-card-info">
            <div class="kb-name">${kb.name}</div>
            <span class="tag tag-blue">${kb.categoryName}</span>
          </div>
        </div>
        <div class="kb-desc">${kb.description || '暂无描述'}</div>
        <div class="kb-meta-row">
          <span>📄 ${kb.docCount} 文档</span>
          <span>✂️ ${kb.chunkCount} 切片</span>
          <span>🕐 ${kb.updateTime.split(' ')[0]}</span>
        </div>
        <div class="kb-config-tags">
          <span class="cfg-tag">${kb.config.parserName}</span>
          <span class="cfg-tag">${kb.config.chunkStrategyName || '默认'}</span>
          <span class="cfg-tag">${kb.config.embeddingModelName?.split('(')[0] || 'BGE'}</span>
        </div>
        <div class="kb-card-actions">
          <button class="btn btn-text btn-sm" onclick="event.stopPropagation();app.editKnowledgeBase('${kb.id}')">编辑</button>
          <button class="btn btn-text btn-sm btn-danger" onclick="event.stopPropagation();app.deleteKnowledgeBase('${kb.id}', '${kb.name}')">删除</button>
          <button class="btn btn-text btn-sm" onclick="event.stopPropagation();app.viewKnowledgeBase('${kb.id}')">详情</button>
        </div>
      </div>
    `).join('');
  }

  // ========== 5步创建向导（含文档上传+层级配置） ==========
  openCreateWizard() {
    const mc = document.getElementById('modal-container');
    mc.innerHTML = `
      <div class="modal-overlay active" id="wiz-modal">
        <div class="modal modal-wiz-xl">
          <div class="modal-header wiz-header">
            <div>
              <h3 class="modal-title">新建知识库</h3>
              <p class="wiz-subtitle">完成以下步骤创建 RAG 知识库，支持文档上传、解析/切片配置、向量化全链路管理</p>
            </div>
            <button class="modal-close" onclick="app.closeWizModal()">×</button>
          </div>

          <!-- 步骤条：5步 -->
          <div class="wiz-steps-bar">
            <div class="wiz-step ${this._wizStep >= 1 ? 'active' : ''} ${this._wizStep > 1 ? 'done' : ''}" data-s="1">
              <div class="ws-num">${this._wizStep > 1 ? '✓' : '1'}</div>
              <div class="ws-label">基础信息</div>
            </div>
            <div class="wiz-line ${this._wizStep > 1 ? 'active' : ''}"></div>
            <div class="wiz-step ${this._wizStep >= 2 ? 'active' : ''} ${this._wizStep > 2 ? 'done' : ''}" data-s="2">
              <div class="ws-num">${this._wizStep > 2 ? '✓' : '2'}</div>
              <div class="ws-label">文档上传</div>
            </div>
            <div class="wiz-line ${this._wizStep > 2 ? 'active' : ''}"></div>
            <div class="wiz-step ${this._wizStep >= 3 ? 'active' : ''} ${this._wizStep > 3 ? 'done' : ''}" data-s="3">
              <div class="ws-num">${this._wizStep > 3 ? '✓' : '3'}</div>
              <div class="ws-label">配置向量空间</div>
            </div>
            <div class="wiz-line ${this._wizStep > 3 ? 'active' : ''}"></div>
            <div class="wiz-step ${this._wizStep >= 4 ? 'active' : ''} ${this._wizStep > 4 ? 'done' : ''}" data-s="4">
              <div class="ws-num">${this._wizStep > 4 ? '✓' : '4'}</div>
              <div class="ws-label">解析与切片</div>
            </div>
            <div class="wiz-line ${this._wizStep > 4 ? 'active' : ''}"></div>
            <div class="wiz-step ${this._wizStep >= 5 ? 'active' : ''}" data-s="5">
              <div class="ws-num">5</div>
              <div class="ws-label">分段预览</div>
            </div>
          </div>

          <div class="modal-body wiz-body" id="wiz-body"></div>

          <div class="modal-footer wiz-footer">
            <button class="btn btn-default" id="wiz-prev" style="${this._wizStep === 1 ? 'display:none' : ''}" onclick="app.wizPrev()">上一步</button>
            <button class="btn btn-default" onclick="app.closeWizModal()">取消</button>
            <button class="btn btn-primary" id="wiz-next" onclick="app.wizNext()">
              ${this._wizStep === 5 ? '确认创建 ✓' : '下一步 →'}
            </button>
          </div>
        </div>
      </div>
    `;

    if (!this._wizData) this._initWizData();
    if (!this._wizStep) this._wizStep = 1;
    this._renderWizStep();
  }

  _initWizData() {
    this._wizStep = 1;
    this._wizData = {
      name: '', category: '', description: '',
      files: [],
      defaultParser: 'general',
      defaultChunkConfig: { strategy: 'semantic', chunkSize: 512, overlap: 50, separators: ['\n\n'], identifierPattern: '' },
      embeddingModel: 'bge-large-zh',
      vectorDB: 'milvus'
    };
  }

  _renderWizStep() {
    const body = document.getElementById('wiz-body');
    switch (this._wizStep) {
      case 1: body.innerHTML = this._renderWizStep1(); break;
      case 2: body.innerHTML = this._renderWizStep2_Upload(); break;
      case 3: body.innerHTML = this._renderWizStep3_Vectorize(); break;
      case 4: body.innerHTML = this._renderWizStep4_ParseChunk(); break;
      case 5: body.innerHTML = this._renderWizStep5_Preview(); break;
    }
    this._bindWizEvents();
  }

  // ---- Step 1: 基础信息 ----
  _renderWizStep1() {
    return `
      <div class="wiz-step-title">基础信息</div>
      <div class="wiz-form-grid">
        <div class="wf-group full">
          <label class="wf-label required">知识库名称</label>
          <input type="text" class="form-input wf-input" id="wz-name" placeholder="例如：智能运维指标体系" value="${this._wizData.name}">
        </div>
        <div class="wf-group half">
          <label class="wf-label required">领域分类</label>
          <select class="form-select wf-select" id="wz-category">
            <option value="">请选择领域</option>
            <option value="technology" ${this._wizData.category==='technology'?'selected':''}>科技领域</option>
            <option value="finance" ${this._wizData.category==='finance'?'selected':''}>金融领域</option>
            <option value="medical" ${this._wizData.category==='medical'?'selected':''}>医疗领域</option>
            <option value="legal" ${this._wizData.category==='legal'?'selected':''}>法律领域</option>
            <option value="education" ${this._wizData.category==='education'?'selected':''}>教育领域</option>
            <option value="other" ${this._wizData.category==='other'?'selected':''}>其他</option>
          </select>
        </div>
        <div class="wf-group half">
          <label class="wf-label">描述</label>
          <textarea class="form-textarea wf-textarea" id="wz-desc" rows="2" placeholder="简要描述该知识库的用途...">${this._wizData.description}</textarea>
        </div>
      </div>
      <div class="config-level-notice">
        <div class="cln-title">📐 配置层级说明</div>
        <div class="cln-grid">
          <div class="cln-item cln-global">
            <span class="cln-badge">知识库级（全局）</span>
            <span>Embedding 模型 + 向量数据库 —— 强制统一，所有文档共享同一向量空间</span>
          </div>
          <div class="cln-item cln-doc">
            <span class="cln-badge">文档级（可覆盖）</span>
            <span>解析器 + 切片策略 —— 默认继承库配置，上传时可按需自定义</span>
          </div>
        </div>
      </div>
    `;
  }

  // ---- Step 2: 文档上传（新增！）----
  _renderWizStep2_Upload() {
    const fileListHtml = this._wizData.files.length > 0
      ? `<div class="wiz-file-list-area" id="wiz-file-list">
           ${this._wizData.files.map(f => `
             <div class="file-item-up" data-fname="${f.name}">
               <div class="fi-icon">${f.icon || '📄'}</div>
               <div class="fi-info"><div class="fi-name">${f.name}</div><div class="fi-size">${f.size}</div></div>
               <button class="btn btn-text btn-danger btn-sm" onclick="app.wizRemoveFile('${f.name}')">删除</button>
             </div>
           `).join('')}
         </div>`
      : '';

    return `
      <div class="wiz-step-title">上传文档</div>
      <div class="wiz-upload-area" id="wiz-upload-area">
        <div class="upload-icon-lg">☁️</div>
        <div class="upload-text-lg">拖拽文件到此处，或 <span class="upload-link" onclick="document.getElementById('wiz-hidden-input').click()">点击上传</span></div>
        <div class="upload-hint-lg">支持 .doc、.docx、.pdf、.md、.txt、.ppt、.pptx、.html、.wps 文件<br>单文件不超过 20MB，最多同时上传 5 个文件<br>${this._wizData.files.length > 0 ? '<span style="color:#1890ff;font-weight:500;">已选择 ' + this._wizData.files.length + ' 个文件</span>' : '<span style="color:#999;">尚未选择任何文件（也可跳过此步，稍后添加）</span>'}</div>
        <input type="file" id="wiz-hidden-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.pptx" style="display:none;" onchange="app.wizHandleFileSelect(event)">
      </div>
      ${fileListHtml}
      <div class="wiz-tip">
        <span class="tip-icon">💡</span>
        此处上传的文档将使用 Step 3 配置的<strong>全局默认解析器和切片策略</strong>进行处理。后续在详情页添加文档时，可以为单个文档单独配置解析器和切片策略以覆盖默认值。
      </div>
    `;
  }

  wizHandleFileSelect(event) {
    const pool = [
      { name: '智能运维指标体系_20250425.pdf', size: '1.80MB', icon: '📕' },
      { name: 'API接口更新日志_v2.1.docx', size: '890KB', icon: '📘' },
      { name: '系统运维手册_修订版.md', size: '156KB', icon: '📝' },
      { name: '用户培训材料.pptx', size: '5.67MB', icon: '📊' },
      { name: '数据字典.xlsx', size: '245KB', icon: '📗' },
      { name: 'Nginx配置最佳实践.docx', size: '420KB', icon: '📘' },
      { name: 'Kubernetes集群部署指南.pdf', size: '12.34MB', icon: '📕' },
      { name: 'Prometheus监控配置.txt', size: '45KB', icon: '📄' }
    ];
    for (let i = 0; i < Math.min(event.target.files.length || 1, 3); i++) {
      const f = pool[Math.floor(Math.random() * pool.length)];
      if (!this._wizData.files.find(x => x.name === f.name)) {
        this._wizData.files.push({ ...f, uploadTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }) });
      }
    }
    this._renderWizStep();
  }

  wizRemoveFile(name) {
    this._wizData.files = this._wizData.files.filter(f => f.name !== name);
    this._renderWizStep();
  }

  // ---- Step 4: 全局默认配置（解析器+切片策略）----
  _renderWizStep4_ParseChunk() {
    return `
      <div class="wiz-step-title">全局默认配置（解析与切片）</div>
      <div class="config-level-tag-bar global">
        <div class="clt-content">
          <span class="clt-badge global">🔒 全局默认值</span>
          <span class="clt-desc">以下配置将作为所有新上传文档的默认解析方案，单个文档可在上传时覆盖</span>
        </div>
      </div>

      <!-- 解析器选择 -->
      <div class="wf-section">
        <label class="wf-section-label">文档解析器（默认）</label>
        <div class="parser-cards">
          ${(window.parserOptions || []).map(p => `
            <div class="parser-card ${this._wizData.defaultParser === p.value ? 'pc-active' : ''}" data-parser="${p.value}">
              <span class="pc-icon">${p.icon}</span>
              <span class="pc-name">${p.label}</span>
              <span class="pc-desc">${p.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 切片策略（由ChunkConfig组件渲染） -->
      <div class="wf-section">
        <label class="wf-section-label">切片策略配置（默认）</label>
        <div id="wiz-chunk-config"></div>
      </div>

      <div class="wiz-tip">
        <span class="tip-icon">💡</span>
        这是<strong>知识库级别的默认配置</strong>。当用户在详情页「添加文档」时，可以选择「继承库配置」或「自定义」来决定是否使用此处设置的解析器和切片策略。Embedding 模型和向量数据库将在下一步统一配置。
      </div>
    `;
  }

  // ---- Step 5: 分段预览 ----
  _renderWizStep5_Preview() {
    // 为每份文档生成模拟预览数据
    const docsPreview = this._wizData.files.map((file, docIndex) => {
      const mockPreviewChunks = [
        { index: 1, content: `# ${file.name} 第1章 概述\n\n本文档介绍了相关内容的核心概念和工作原理...`, charCount: 234, tokens: 133 },
        { index: 2, content: `## 1.1 基本概念\n\n本节详细介绍了基本概念和定义...`, charCount: 312, tokens: 178 },
        { index: 3, content: `### 1.1.1 核心组件\n\n主要包含以下核心组件：\n\n1. **组件1**：负责...`, charCount: 428, tokens: 244 }
      ];
      return {
        file: file,
        chunks: mockPreviewChunks,
        totalChars: mockPreviewChunks.reduce((s,c)=>s+c.charCount,0),
        totalTokens: mockPreviewChunks.reduce((s,c)=>s+c.tokens,0)
      };
    });
    
    return `
      <div class="wiz-step-title">分段预览</div>
      
      <!-- 配置摘要 -->
      <div class="wiz-summary-box">
        <div class="wsb-title">📋 配置摘要</div>
        <div class="wsb-grid">
          <div class="wsb-item"><span class="wsb-k">名称</span><span class="wsb-v">${this._wizData.name || '-'}</span></div>
          <div class="wsb-item"><span class="wsb-k">分类</span><span class="wsb-v">${this._wizData.category || '-'}</span></div>
          <div class="wsb-item"><span class="wsb-k">文件数</span><span class="wsb-v">${this._wizData.files.length}</span></div>
          ${this._wizData.embeddingModel ? `
            <div class="wsb-item"><span class="wsb-k" style="color:#ff4d4f;">⚡ 选中模型</span><span class="wsb-v" style="font-weight:600;">${(window.embeddingModels.find(m=>m.value===this._wizData.embeddingModel))?.label||'-'}</span></div>
            <div class="wsb-item"><span class="wsb-k" style="color:#ff4d4f;">⚡ 检索维度</span><span class="wsb-v" style="font-weight:600;">${(window.embeddingModels.find(m=>m.value===this._wizData.embeddingModel))?.dim || '未知'} 维</span></div>
          ` : ''}
          ${this._wizData.defaultParser ? `
            <div class="wsb-item"><span class="wsb-k">解析器</span><span class="wsb-v">${(window.parserOptions.find(p=>p.value===this._wizData.defaultParser))?.label||'-'}</span></div>
          ` : ''}
          ${this._wizData.defaultChunkConfig ? `
            <div class="wsb-item"><span class="wsb-k">切片策略</span><span class="wsb-v">${(window.chunkStrategies.find(s=>s.value===this._wizData.defaultChunkConfig.strategy))?.label||'-'}</span></div>
          ` : ''}
          <div class="wsb-item"><span class="wsb-k" style="color:#ff4d4f;">⚡ 向量库</span><span class="wsb-v" style="font-weight:600;">Milvus</span></div>
        </div>
      </div>
      
      <div class="preview-summary">
        <div class="ps-item"><span class="ps-val">${this._wizData.files.length}</span><span class="ps-lbl">上传文件</span></div>
        <div class="ps-item"><span class="ps-val">${docsPreview.reduce((s,d)=>s+d.chunks.length,0)}</span><span class="ps-lbl">预计总切片数</span></div>
        <div class="ps-item"><span class="ps-val">${docsPreview.reduce((s,d)=>s+d.totalChars,0)}</span><span class="ps-lbl">总字符数</span></div>
        <div class="ps-item"><span class="ps-val">${this._wizData.defaultChunkConfig.chunkSize}</span><span class="ps-lbl">Chunk Size</span></div>
        <div class="ps-item"><span class="ps-val">${this._wizData.defaultChunkConfig.overlap}</span><span class="ps-lbl">Overlap</span></div>
      </div>
      
      <div class="preview-files-panel">
        <div class="preview-files-sidebar">
          ${docsPreview.map((doc, idx) => `
            <div class="preview-file-item ${idx === 0 ? 'active' : ''}" data-doc-index="${idx}">
              <span class="file-icon">📄</span>
              <div class="file-info">
                <span class="file-name">${doc.file.name}</span>
                <span class="file-stats">${doc.chunks.length} 切片 · ${doc.totalChars} 字符</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="preview-chunks-content">
          ${docsPreview.map((doc, docIndex) => `
            <div class="preview-chunks-list ${docIndex === 0 ? 'active' : ''}" data-doc-index="${docIndex}">
              ${doc.chunks.map(c => `
                <div class="preview-chunk-card">
                  <div class="pch-header">
                    <span class="pch-index">切片 #${c.index}</span>
                    <span class="pch-stats">${c.charCount} 字符 · ${c.tokens} tokens</span>
                  </div>
                  <div class="pch-content">${c.content.substring(0, 120)}${c.content.length > 120 ? '...' : ''}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="wiz-tip">
        <span class="tip-icon">💡</span>
        以上为基于当前全局默认配置的模拟预览效果。实际切片结果会根据各文档内容自动调整。
      </div>
    `;
  }

  // ---- Step 3: 配置向量空间（Embedding + 向量数据库）----
  _renderWizStep3_Vectorize() {
    // 自动选择最高优先级的向量模型
    if (!this._wizData.embeddingModel) {
      const vectorModels = window.llmModels ? window.llmModels.filter(model => model.type === '向量模型' && model.status === 'active') : [];
      if (vectorModels.length > 0) {
        // 按优先级排序，选择优先级最高的
        vectorModels.sort((a, b) => a.priority - b.priority);
        this._wizData.embeddingModel = vectorModels[0].name;
      }
    }

    // 获取当前选中模型的维度
    const selectedModel = window.embeddingModels ? window.embeddingModels.find(m => m.value === this._wizData.embeddingModel) : null;
    const modelDimension = selectedModel ? selectedModel.dim : '未知';

    return `
      <div class="wiz-step-title">配置向量空间</div>
      <div class="config-level-tag-bar mandatory">
        <div class="clt-content">
          <span class="clt-badge mandatory">🔒 强制统一</span>
          <span class="clt-desc">请选择用于文档索引的 Embedding 模型，所有文档必须使用相同的向量化方案以确保检索一致性</span>
        </div>
      </div>

      <div class="wf-section">
        <label class="wf-section-label">向量数据库（只读）</label>
        <div class="vdb-readonly-panel">
          <div class="vdb-readonly-header">
            <span class="vdb-icon">🗄️</span>
            <div class="vdb-info">
              <div class="vdb-name">Milvus</div>
              <div class="vdb-status">已就绪</div>
            </div>
          </div>
          <div class="vdb-readonly-details">
            <div class="vdb-detail-item">
              <span class="vdb-detail-label">类型：</span>
              <span class="vdb-detail-value">高性能内置向量集群</span>
            </div>
            <div class="vdb-detail-item">
              <span class="vdb-detail-label">状态：</span>
              <span class="vdb-detail-value">已就绪</span>
            </div>
            <div class="vdb-detail-item">
              <span class="vdb-detail-label">维度：</span>
              <span class="vdb-detail-value">${modelDimension} 维</span>
            </div>
          </div>
          <div class="vdb-readonly-hint">
            统一采用高性能内置向量集群，确保检索稳定性。
          </div>
        </div>
      </div>

      <div class="wf-section">
        <label class="wf-section-label">Embedding 模型（向量化模型）<span style="font-size:11.5px;color:#ff4d4f;font-weight:500;"> * 必须选择</span></label>
        <div class="emb-model-grid">
          ${(window.embeddingModels || []).map(m => `
            <div class="emb-model-card ${this._wizData.embeddingModel === m.value ? 'em-active' : ''}" data-model="${m.value}">
              <div class="em-provider">${m.provider}</div>
              <div class="em-name">${m.label}</div>
              <div class="em-dim">${m.dim} 维</div>
              <div class="em-desc">${m.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _bindWizEvents() {
    // Step 2 - Upload area drag/drop
    if (this._wizStep === 2) {
      const area = document.getElementById('wiz-upload-area');
      if (area) {
        area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
        area.addEventListener('dragleave', () => area.classList.remove('dragover'));
        area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('dragover'); app.wizHandleFileSelect({ target: { files: [{}] } }); });
      }
    }

    // Step 4 - parser cards + ChunkConfig
    if (this._wizStep === 4) {
      document.querySelectorAll('.parser-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.parser-card').forEach(c => c.classList.remove('pc-active'));
          card.classList.add('pc-active');
          this._wizData.defaultParser = card.dataset.parser;
        });
      });
      setTimeout(() => {
        this.chunkConfigComponent = new ChunkConfig('wiz-chunk-config', {
          onChange: (cfg) => { this._wizData.defaultChunkConfig = cfg; }
        });
        this.chunkConfigComponent.setConfig(this._wizData.defaultChunkConfig);
      }, 0);
    }

    // Step 5 - Preview files sidebar
    if (this._wizStep === 5) {
      document.querySelectorAll('.preview-file-item').forEach(item => {
        item.addEventListener('click', () => {
          const docIndex = parseInt(item.dataset.docIndex);
          // 更新侧边栏项状态
          document.querySelectorAll('.preview-file-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          // 更新预览内容
          document.querySelectorAll('.preview-chunks-list').forEach(list => list.classList.remove('active'));
          const targetList = document.querySelector(`.preview-chunks-list[data-doc-index="${docIndex}"]`);
          if (targetList) targetList.classList.add('active');
        });
      });
    }

    // Step 3 - embedding model cards
    if (this._wizStep === 3) {
      document.querySelectorAll('.emb-model-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.emb-model-card').forEach(c => c.classList.remove('em-active'));
          card.classList.add('em-active');
          this._wizData.embeddingModel = card.dataset.model;
        });
      });
    }
  }

  wizPrev() {
    if (this._wizStep > 1) {
      this._saveWizStep();
      this._wizStep--;
      this._updateWizStepsUI();
      this._renderWizStep();
    }
  }

  wizNext() {
    if (this._wizStep < 5) {
      // 验证向量模型选择
      if (this._wizStep === 3 && !this._wizData.embeddingModel) {
        alert('请选择一个 Embedding 模型');
        return;
      }
      this._saveWizStep();
      this._wizStep++;
      this._updateWizStepsUI();
      this._renderWizStep();
    } else {
      this._submitCreateKB();
    }
  }

  _saveWizStep() {
    if (this._wizStep === 1) {
      this._wizData.name = document.getElementById('wz-name')?.value || '';
      this._wizData.category = document.getElementById('wz-category')?.value || '';
      this._wizData.description = document.getElementById('wz-desc')?.value || '';
    }
    if (this._wizStep === 3 && this.chunkConfigComponent) {
      this._wizData.defaultChunkConfig = this.chunkConfigComponent.getConfig();
    }
  }

  _updateWizStepsUI() {
    const totalSteps = 5;
    document.querySelectorAll('.wiz-step').forEach(s => {
      const n = parseInt(s.dataset.s);
      s.classList.toggle('active', n <= this._wizStep);
      s.classList.toggle('done', n < this._wizStep);
      const numEl = s.querySelector('.ws-num');
      if (numEl && n < this._wizStep) numEl.textContent = '✓';
      else if (numEl) numEl.textContent = n;
    });
    document.querySelectorAll('.wiz-line').forEach(l => {
      const idx = Array.from(document.querySelectorAll('.wiz-line')).indexOf(l);
      l.classList.toggle('active', idx + 1 < this._wizStep);
    });
    const prevBtn = document.getElementById('wiz-prev');
    const nextBtn = document.getElementById('wiz-next');
    if (prevBtn) prevBtn.style.display = this._wizStep === 1 ? 'none' : '';
    if (nextBtn) nextBtn.innerHTML = this._wizStep === totalSteps ? '确认创建 ✓' : '下一步 →';
  }

  _submitCreateKB() {
    console.log('创建知识库:', this._wizData);
    this.closeWizModal();
    alert('✅ 知识库「' + (this._wizData.name || '未命名') + '」创建成功！\n\n正在处理文档解析和向量化任务...');
    this._wizData = null;
    this._wizStep = 1;
    this.navigateTo('list');
  }

  closeWizModal() {
    const m = document.getElementById('wiz-modal');
    if (m) { m.classList.remove('active'); setTimeout(() => m.remove(), 300); }
  }

  // ========== 知识库详情页 ==========
  renderKnowledgeDetail(container, kb) {
    const docs = (window.documents || {})[kb.id] || [];
    const allKBChunks = Object.values(window.chunks || {}).flat();
    container.innerHTML = `
      <div class="detail-header">
        <div class="dh-left">
          <button class="btn btn-default" onclick="app.navigateTo('list')">← 返回列表</button>
          <div class="dh-info">
            <div class="dh-title-row">
              <span class="dh-icon">📚</span>
              <h2 class="dh-name">${kb.name}</h2>
              <span class="tag tag-blue">${kb.categoryName}</span>
            </div>
            <p class="dh-desc">${kb.description || '暂无描述'}</p>
          </div>
        </div>
        <div class="dh-right">
          <button class="btn btn-default" onclick="app.openUploadDocModal()">
            <span>+</span> 添加文档
          </button>
        </div>
      </div>

      <!-- 配置概览 -->
      <div class="config-overview-bar">
        <div class="cov-item"><span class="cov-label">解析器</span><span class="cov-val">${kb.config.parserName}</span></div>
        <div class="cov-divider"></div>
        <div class="cov-item"><span class="cov-label">切片策略</span><span class="cov-val">${kb.config.chunkStrategyName||'自动分段'}</span></div>
        <div class="cov-divider"></div>
        <div class="cov-item"><span class="cov-label">Chunk/Overlap</span><span class="cov-val">${kb.config.chunkSize}/${kb.config.overlap}</span></div>
        <div class="cov-divider"></div>
        <div class="cov-item"><span class="cov-label">Embedding</span><span class="cov-val">${kb.config.embeddingModelName||kb.config.embeddingModel}</span></div>
        <div class="cov-divider"></div>
        <div class="cov-item"><span class="cov-label">向量库</span><span class="cov-val">${kb.config.vectorDBName||kb.config.vectorDB}</span></div>
      </div>

      <div class="detail-doc-full">
        <!-- 工具栏 -->
        <div class="ddp-header">
          <div class="ddp-header-left">
            <span class="ddp-title">📄 文档列表 (${docs.length})</span>
          </div>
          <div class="ddp-header-right">
            <div class="search-box" style="width:220px;">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="搜索文档名称...">
            </div>
            <button class="btn btn-default" onclick="app.openRetrievalLab()">
              🔬 召回实验室
            </button>
          </div>
        </div>

        <!-- 文档表格 -->
        <div style="flex:1;overflow-y:auto;">
          <table class="table doc-table">
            <thead><tr>
              <th width="45">#</th>
              <th>文档名称</th>
              <th width="70">大小</th>
              <th width="90">解析状态</th>
              <th width="150">解析切片配置</th>
              <th width="60">切片</th>
              <th width="120">操作</th>
            </tr></thead>
            <tbody>${docs.map((d,i)=>this.renderDocRow(d,i,kb)).join('')}</tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="pagination-bar">
          <span class="pagi-info">共 ${docs.length} 条</span>
          <div class="pagi-btns">
            <button class="page-btn" disabled>‹</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">›</button>
          </div>
        </div>
      </div>
    `;
  }

  renderDocRow(doc, idx, kb) {
    const fmtIcons = { pdf:'📕', doc:'📘',docx:'📘', excel:'📗',xlsx:'📗', txt:'📄', md:'📝', pptx:'📊' };
    const statusMap = {
      processing: { text:'解析中', cls:'processing' },
      success: { text:'解析成功', cls:'success' },
      error: { text:'解析失败', cls:'error' }
    };
    const st = statusMap[doc.status] || statusMap.processing;
    
    // 判断是否自定义配置
    const isCustom = doc.chunkConfig && doc.chunkConfig.isCustom;
    const finalConfig = isCustom ? doc.chunkConfig : kb.config;
    
    // 获取策略名称
    const strategyMap = {
      semantic: '自动分段（按语义）',
      identifier: '基于标识符切分',
      recursive: '递归字符切分',
      structured: '文档结构化切分'
    };
    const strategyName = strategyMap[finalConfig.strategy] || strategyMap[finalConfig.chunkStrategy] || finalConfig.chunkStrategyName || '默认';
    
    // 获取解析器名称
    const parserMap = {
      general: '通用解析',
      enhanced: '增强解析',
      layout: 'Layout解析'
    };
    const parserName = parserMap[finalConfig.parser] || doc.parser || kb.config.parserName || '通用解析';
    
    // 获取分隔符/标识符
    const separators = finalConfig.separators || finalConfig.separators?.join(', ') || '';
    const identifierPattern = finalConfig.identifierPattern || '';
    const displayIdentifiers = identifierPattern || separators || '-';
    
    // 处理长标识符截断
    const truncatedIdentifiers = displayIdentifiers.length > 20 ? displayIdentifiers.substring(0, 20) + '...' : displayIdentifiers;
    
    // 获取块大小和重叠
    const chunkSize = finalConfig.chunkSize || finalConfig.chunk_size || kb.config.chunkSize || 512;
    const overlap = finalConfig.overlap || finalConfig.overlap_size || kb.config.overlap || 50;
    
    // Tooltip内容
    const tooltipTitle = isCustom ? '[文档自定义配置]' : '[继承自库配置]';
    const tooltipContent = `
      <div class="tooltip-config-item"><span class="tooltip-label">解析器：</span><span class="tooltip-value">${parserName}</span></div>
      <div class="tooltip-config-item"><span class="tooltip-label">切片策略：</span><span class="tooltip-value">${strategyName}</span></div>
      <div class="tooltip-config-item"><span class="tooltip-label">关键标识符：</span><span class="tooltip-value">${displayIdentifiers}</span></div>
      <div class="tooltip-config-item"><span class="tooltip-label">块大小/重叠：</span><span class="tooltip-value">${chunkSize} / ${overlap}</span></div>
    `;
    
    // 错误弹窗内容
    const errorModalId = `error-modal-${doc.id}`;
    
    return `
      <tr>
        <td>${idx+1}</td>
        <td>
          <div class="doc-cell">
            <span class="doc-fmt-icon">${fmtIcons[doc.format]||'📄'}</span>
            <span class="doc-link" onclick="app.navigateTo('chunks',{kb:${JSON.stringify(kb).replace(/"/g,'&quot;')},doc:${JSON.stringify(doc).replace(/"/g,'&quot;')}})">${doc.name}</span>
          </div>
        </td>
        <td>${doc.size}</td>
        <td>
          ${doc.status === 'processing' ? `
            <div class="status-processing">
              <div class="progress-ring">
                <svg class="pr-svg" viewBox="0 0 36 36">
                  <circle class="pr-bg" cx="18" cy="18" r="16" fill="none" stroke="#e8e8e8" stroke-width="3"/>
                  <circle class="pr-progress" cx="18" cy="18" r="16" fill="none" stroke="#1890ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="${doc.progress * 1.005} ${100.5 - doc.progress * 1.005}" transform="rotate(-90 18 18)"/>
                </svg>
                <span class="pr-text">${doc.progress}%</span>
              </div>
            </div>
          ` : doc.status === 'error' ? `
            <span class="status-badge sb-${st.cls}" onclick="document.getElementById('${errorModalId}').classList.add('active')">
              <span class="sb-dot"></span>${st.text}
            </span>
          ` : `
            <span class="status-badge sb-${st.cls}">
              <span class="sb-dot"></span>${st.text}
            </span>
          `}
        </td>
        <td>
          <div class="config-cell" onmouseenter="this.querySelector('.config-tooltip').style.display='block'" onmouseleave="this.querySelector('.config-tooltip').style.display='none'">
            <div class="config-badge ${isCustom ? 'badge-custom' : 'badge-inherit'}">
              ${isCustom ? `自定义：${strategyName.substring(0, 6)}${strategyName.length > 6 ? '...' : ''}` : '继承全局'}
            </div>
            <div class="config-params">${chunkSize} / ${overlap}</div>
            <div class="config-tooltip">
              <div class="tooltip-title">${tooltipTitle}</div>
              <div class="tooltip-content">${tooltipContent}</div>
            </div>
          </div>
        </td>
        <td>${doc.chunkCount || '-'}</td>
        <td>
          <div class="doc-actions">
            <button class="btn btn-text btn-sm ${doc.status === 'success' ? 'btn-highlight' : ''}" onclick="app.navigateTo('chunks',{kb:app.currentKB,doc:${JSON.stringify(doc).replace(/"/g,'&quot;')}})">切片</button>
            <button class="btn btn-text btn-sm" onclick="app.openDocConfigModal('${doc.id}', ${JSON.stringify(kb).replace(/"/g,'&quot;')})">配置</button>
            ${doc.status === 'error' ? `<button class="btn btn-text btn-sm" onclick="app.retryParseDoc('${doc.id}')">重试</button>` : ''}
            <button class="btn btn-text btn-sm btn-danger" onclick="if(confirm('确定删除？'))alert('已删除')">删除</button>
          </div>
        </td>
      </tr>
      ${doc.status === 'error' && doc.errorMsg ? `
        <div class="modal-overlay" id="${errorModalId}">
          <div class="modal modal-sm">
            <div class="modal-header"><h3 class="modal-title">解析错误详情</h3><button class="modal-close" onclick="document.getElementById('${errorModalId}').classList.remove('active')">×</button></div>
            <div class="modal-body">
              <div class="error-log">
                <div class="error-title">❌ 解析失败</div>
                <div class="error-message">${doc.errorMsg}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-default" onclick="document.getElementById('${errorModalId}').classList.remove('active')">关闭</button>
              <button class="btn btn-primary" onclick="document.getElementById('${errorModalId}').classList.remove('active');app.retryParseDoc('${doc.id}')">重试解析</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  openUploadDocModal() {
    const mc = document.getElementById('modal-container');
    this._uploadFiles = [];
    this._uploadUseCustomConfig = false;
    if (!this.currentKB) return;
    const kb = this.currentKB;
    mc.innerHTML = `
      <div class="modal-overlay active" id="up-modal">
        <div class="modal modal-lg">
          <div class="modal-header"><h3 class="modal-title">添加文档</h3><button class="modal-close" onclick="app.closeUploadModal()">×</button></div>
          <div class="modal-body">
            <!-- 配置模式切换 -->
            <div class="config-mode-toggle">
              <span class="cmt-label">解析配置：</span>
              <label class="cmt-option ${!this._uploadUseCustomConfig ? 'cmt-active' : ''}" onclick="app.toggleUploadConfigMode(false)">
                <input type="radio" name="configMode" value="inherit" ${!this._uploadUseCustomConfig ? 'checked' : ''} style="display:none;">
                <span class="cmt-radio"></span>
                <span class="cmt-text">
                  <strong>继承知识库配置</strong>
                  <small>使用「${kb.config.parserName}」+ 「${kb.config.chunkStrategyName || '自动分段'}」(${kb.config.chunkSize}/${kb.config.overlap})</small>
                </span>
              </label>
              <label class="cmt-option ${this._uploadUseCustomConfig ? 'cmt-active' : ''}" onclick="app.toggleUploadConfigMode(true)">
                <input type="radio" name="configMode" value="custom" ${this._uploadUseCustomConfig ? 'checked' : ''} style="display:none;">
                <span class="cmt-radio"></span>
                <span class="cmt-text">
                  <strong>自定义配置</strong>
                  <small>为此文档单独指定解析器和切片策略</small>
                </span>
              </label>
            </div>

            <!-- 上传区域 -->
            <div class="upload-area" id="up-area">
              <div class="upload-icon-lg">☁️</div>
              <div class="upload-text-lg">拖拽文件到此处，或 <span class="upload-link">点击上传</span></div>
              <div class="upload-hint-lg">支持 .doc、.docx、.pdf、.md、.txt、.ppt、.pptx、.html、.wps 文件<br>单文件不超过 20MB，最多同时上传 5 个文件</div>
            </div>
            <div class="file-list-area" id="up-file-list"></div>

            <!-- 自定义配置区（默认隐藏） -->
            <div class="custom-config-area" id="up-custom-config" style="${this._uploadUseCustomConfig ? '' : 'display:none'};">
              <div class="wf-section" style="margin-bottom:12px;">
                <label class="wf-section-label" style="font-size:13px;">文档解析器</label>
                <div class="parser-cards-sm">
                  ${(window.parserOptions || []).map(p => `
                    <div class="parser-card-sm ${(!this._uploadCustomParser && kb.config.parser===p.value) || this._uploadCustomParser===p.value ? 'pcs-active' : ''}" data-parser="${p.value}">
                      <span class="pcs-icon">${p.icon}</span>${p.label}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div id="up-chunk-config-mini"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-default" onclick="app.closeUploadModal()">取消</button>
            <button class="btn btn-primary" onclick="app.submitUploadDocs()">确认上传</button>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const area = document.getElementById('up-area');
      if (area) {
        area.addEventListener('click', () => app.simulateAddFile());
        area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
        area.addEventListener('dragleave', () => area.classList.remove('dragover'));
        area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('dragover'); app.simulateAddFile(); });
      }
      // 绑定自定义解析器选择
      document.querySelectorAll('.parser-card-sm').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.parser-card-sm').forEach(c => c.classList.remove('pcs-active'));
          card.classList.add('pcs-active');
          this._uploadCustomParser = card.dataset.parser;
        });
      });
      // 初始化迷你版ChunkConfig（如果自定义模式开启）
      if (this._uploadUseCustomConfig) {
        this._uploadChunkCfgComp = new ChunkConfig('up-chunk-config-mini', {
          onChange: (cfg) => { this._uploadCustomChunkCfg = cfg; }
        });
      }
    }, 0);
  }

  toggleUploadConfigMode(useCustom) {
    this._uploadUseCustomConfig = useCustom;
    const customArea = document.getElementById('up-custom-config');
    if (customArea) customArea.style.display = useCustom ? '' : 'none';
    // 更新 radio 样式
    document.querySelectorAll('.cmt-option').forEach((opt, i) => {
      opt.classList.toggle('cmt-active', (i === 1) === useCustom);
    });
    if (useCustom && !this._uploadChunkCfgComp) {
      setTimeout(() => {
        this._uploadChunkCfgComp = new ChunkConfig('up-chunk-config-mini', {
          onChange: (cfg) => { this._uploadCustomChunkCfg = cfg; }
        });
      }, 50);
    }
  }

  simulateAddFile() {
    const pool = [
      { name: '新功能说明文档_v2.1.pdf', size: '2.34MB' },
      { name: 'API接口更新日志_202504.docx', size: '890KB' },
      { name: '系统运维手册_修订版.md', size: '156KB' },
      { name: '用户培训材料.pptx', size: '5.67MB' },
      { name: '数据字典.xlsx', size: '245KB' }
    ];
    const f = pool[Math.floor(Math.random()*pool.length)];
    if (!this._uploadFiles.find(x=>x.name===f.name)) {
      this._uploadFiles.push(f);
      const list = document.getElementById('up-file-list');
      if (list) list.innerHTML = this._uploadFiles.map(fi => `
        <div class="file-item-up">
          <div class="fi-icon">📄</div>
          <div class="fi-info"><div class="fi-name">${fi.name}</div><div class="fi-size">${fi.size}</div></div>
          <button class="btn btn-text btn-danger btn-sm" onclick="app.removeUpFile('${fi.name}')">删除</button>
        </div>
      `).join('');
    }
  }

  removeUpFile(name) {
    this._uploadFiles = this._uploadFiles.filter(f=>f.name!==name);
    const list = document.getElementById('up-file-list');
    if(list) list.innerHTML = this._uploadFiles.map(f=>`
      <div class="file-item-up"><div class="fi-icon">📄</div><div class="fi-info"><div class="fi-name">${f.name}</div><div class="fi-size">${f.size}</div></div><button class="btn btn-text btn-danger btn-sm" onclick="app.removeUpFile('${f.name}')">删除</button></div>
    `).join('');
  }

  closeUploadModal() {
    const m = document.getElementById('up-modal');
    if(m){ m.classList.remove('active'); setTimeout(()=>m.remove(),300); }
  }

  // 打开文档配置编辑弹窗
  openDocConfigModal(docId, kb) {
    const mc = document.getElementById('modal-container');
    const docs = (window.documents || {})[kb.id] || [];
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;
    
    // 判断是否自定义配置
    const isCustom = doc.chunkConfig && doc.chunkConfig.isCustom;
    const finalConfig = isCustom ? doc.chunkConfig : kb.config;
    
    mc.innerHTML = `
      <div class="modal-overlay active" id="doc-config-modal">
        <div class="modal modal-lg">
          <div class="modal-header"><h3 class="modal-title">文档解析配置</h3><button class="modal-close" onclick="app.closeDocConfigModal()">×</button></div>
          <div class="modal-body">
            <!-- 配置模式切换 -->
            <div class="config-mode-toggle">
              <span class="cmt-label">解析配置：</span>
              <label class="cmt-option ${!isCustom ? 'cmt-active' : ''}" onclick="app.toggleDocConfigMode(false, '${docId}')">
                <input type="radio" name="docConfigMode" value="inherit" ${!isCustom ? 'checked' : ''} style="display:none;">
                <span class="cmt-radio"></span>
                <span class="cmt-text">
                  <strong>继承知识库配置</strong>
                  <small>使用「${kb.config.parserName}」+ 「${kb.config.chunkStrategyName || '自动分段'}」(${kb.config.chunkSize}/${kb.config.overlap})</small>
                </span>
              </label>
              <label class="cmt-option ${isCustom ? 'cmt-active' : ''}" onclick="app.toggleDocConfigMode(true, '${docId}')">
                <input type="radio" name="docConfigMode" value="custom" ${isCustom ? 'checked' : ''} style="display:none;">
                <span class="cmt-radio"></span>
                <span class="cmt-text">
                  <strong>自定义配置</strong>
                  <small>为此文档单独指定解析器和切片策略</small>
                </span>
              </label>
            </div>

            <!-- 自定义配置区 -->
            <div class="custom-config-area" id="doc-custom-config" style="${isCustom ? '' : 'display:none'};">
              <div class="wf-section" style="margin-bottom:12px;">
                <label class="wf-section-label" style="font-size:13px;">文档解析器</label>
                <div class="parser-cards-sm">
                  ${(window.parserOptions || []).map(p => `
                    <div class="parser-card-sm ${finalConfig.parser === p.value ? 'pcs-active' : ''}" data-parser="${p.value}">
                      <span class="pcs-icon">${p.icon}</span>${p.label}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div id="doc-chunk-config"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-default" onclick="app.closeDocConfigModal()">取消</button>
            <button class="btn btn-primary" onclick="app.saveDocConfig('${docId}', ${JSON.stringify(kb).replace(/"/g,'&quot;')})">保存配置</button>
          </div>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      // 绑定自定义解析器选择
      document.querySelectorAll('.parser-card-sm').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.parser-card-sm').forEach(c => c.classList.remove('pcs-active'));
          card.classList.add('pcs-active');
        });
      });
      // 初始化ChunkConfig组件
      if (isCustom) {
        this._docChunkCfgComp = new ChunkConfig('doc-chunk-config', {
          onChange: (cfg) => { this._docCustomChunkCfg = cfg; },
          initialConfig: finalConfig
        });
      }
    }, 0);
  }

  toggleDocConfigMode(useCustom, docId) {
    const customArea = document.getElementById('doc-custom-config');
    if (customArea) customArea.style.display = useCustom ? '' : 'none';
    
    // 更新 radio 样式
    document.querySelectorAll('.cmt-option').forEach((opt, i) => {
      opt.classList.toggle('cmt-active', (i === 1) === useCustom);
    });
    
    // 初始化/销毁 ChunkConfig 组件
    if (useCustom && !this._docChunkCfgComp) {
      setTimeout(() => {
        const kb = this.currentKB;
        const docs = (window.documents || {})[kb.id] || [];
        const doc = docs.find(d => d.id === docId);
        const finalConfig = doc?.chunkConfig || kb.config;
        
        this._docChunkCfgComp = new ChunkConfig('doc-chunk-config', {
          onChange: (cfg) => { this._docCustomChunkCfg = cfg; },
          initialConfig: finalConfig
        });
      }, 50);
    }
  }

  closeDocConfigModal() {
    const m = document.getElementById('doc-config-modal');
    if(m){ m.classList.remove('active'); setTimeout(()=>m.remove(),300); }
    this._docChunkCfgComp = null;
    this._docCustomChunkCfg = null;
  }

  saveDocConfig(docId, kb) {
    const useCustom = document.querySelector('.cmt-option.cmt-active input').value === 'custom';
    const parser = document.querySelector('.parser-card-sm.pcs-active')?.dataset.parser || kb.config.parser;
    
    // 更新文档配置
    const docs = (window.documents || {})[kb.id] || [];
    const docIndex = docs.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
      if (useCustom) {
        docs[docIndex].chunkConfig = {
          ...this._docCustomChunkCfg,
          isCustom: true,
          parser: parser
        };
      } else {
        docs[docIndex].chunkConfig = null;
      }
      // 重置解析状态为解析中
      docs[docIndex].status = 'processing';
      docs[docIndex].progress = 0;
      docs[docIndex].chunkCount = 0;
      docs[docIndex].parseTime = null;
      docs[docIndex].errorMsg = null;
    }
    
    this.closeDocConfigModal();
    
    // 模拟异步解析过程
    this.simulateDocParse(docId, kb.id);
    
    alert('✅ 配置已保存，文档正在重新解析...');
  }

  simulateDocParse(docId, kbId) {
    const docs = (window.documents || {})[kbId] || [];
    const docIndex = docs.findIndex(d => d.id === docId);
    if (docIndex === -1) return;
    
    // 模拟进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        docs[docIndex].status = 'success';
        docs[docIndex].progress = 100;
        docs[docIndex].chunkCount = Math.floor(Math.random() * 30) + 10;
        docs[docIndex].parseTime = new Date().toLocaleString();
      } else {
        docs[docIndex].progress = Math.floor(progress);
      }
      
      // 刷新页面
      if (this.currentPage === 'detail' && this.currentKB.id === kbId) {
        this.navigateTo('detail', { kb: this.currentKB });
      }
    }, 500);
  }

  // 重试解析文档
  retryParseDoc(docId) {
    const kb = this.currentKB;
    const docs = (window.documents || {})[kb.id] || [];
    const docIndex = docs.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
      docs[docIndex].status = 'processing';
      docs[docIndex].progress = 0;
      docs[docIndex].chunkCount = 0;
      docs[docIndex].parseTime = null;
      docs[docIndex].errorMsg = null;
      
      // 刷新页面
      this.navigateTo('detail', { kb: kb });
      
      // 模拟异步解析过程
      this.simulateDocParse(docId, kb.id);
    }
  }

  submitUploadDocs() {
    this.closeUploadModal();
    alert(`✅ 已成功上传 ${this._uploadFiles.length} 个文件，正在进行解析和向量化处理...\n\n您可以在文档列表中查看处理进度`);
    this.navigateTo('detail', { kb: this.currentKB });
  }

  // ========== 知识库编辑页面 ==========
  renderKnowledgeEdit(container, kb) {
    this._editWizStep = 1;
    this._editKB = { ...kb, config: { ...kb.config } };

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-overlay active" id="edit-wiz-modal">
        <div class="modal modal-wiz-xl">
          <div class="modal-header wiz-header">
            <div>
              <h3 class="modal-title">编辑知识库</h3>
              <p class="wiz-subtitle">修改知识库的配置信息</p>
            </div>
            <button class="modal-close" onclick="app.closeEditWiz()">×</button>
          </div>

          <div class="wiz-steps-bar">
            <div class="wiz-step active" data-s="1">
              <div class="ws-num">1</div>
              <div class="ws-label">基础信息</div>
            </div>
            <div class="wiz-line"></div>
            <div class="wiz-step" data-s="2">
              <div class="ws-num">2</div>
              <div class="ws-label">解析与切片</div>
            </div>
            <div class="wiz-line"></div>
            <div class="wiz-step" data-s="3">
              <div class="ws-num">3</div>
              <div class="ws-label">向量化配置</div>
            </div>
          </div>

          <div class="modal-body wiz-body" id="edit-wiz-body"></div>

          <div class="modal-footer wiz-footer">
            <button class="btn btn-default" id="edit-wiz-prev" style="display:none" onclick="app.editWizPrev()">上一步</button>
            <button class="btn btn-default" onclick="app.closeEditWiz()">取消</button>
            <button class="btn btn-primary" id="edit-wiz-next" onclick="app.editWizNext()">下一步 →</button>
          </div>
        </div>
      </div>
    `;

    this._renderEditWizStep();
  }

  _renderEditWizStep() {
    const body = document.getElementById('edit-wiz-body');
    switch (this._editWizStep) {
      case 1: body.innerHTML = this._renderEditStep1(); break;
      case 2: body.innerHTML = this._renderEditStep2(); break;
      case 3: body.innerHTML = this._renderEditStep3(); break;
    }
    this._updateEditWizStepsUI();
    this._bindEditWizEvents();
  }

  _renderEditStep1() {
    const kb = this._editKB;
    const cats = window.categories || [];
    return `
      <div class="wiz-step-title">基础信息</div>
      <div class="wiz-form-grid">
        <div class="wf-group full">
          <label class="wf-label required">知识库名称</label>
          <input type="text" class="form-input wf-input" id="ek-name" value="${kb.name}">
        </div>
        <div class="wf-group half">
          <label class="wf-label required">领域分类</label>
          <select class="form-select wf-select" id="ek-category">
            ${cats.map(c => `<option value="${c.id}" ${kb.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="wf-group half">
          <label class="wf-label">描述</label>
          <textarea class="form-textarea wf-textarea" id="ek-desc" rows="2">${kb.description || ''}</textarea>
        </div>
      </div>
    `;
  }

  _renderEditStep2() {
    const kb = this._editKB;
    const parsers = window.parserOptions || [];
    return `
      <div class="wiz-step-title">解析与切分配置</div>
      <div class="config-level-tag-bar global">
        <div class="clt-content">
          <span class="clt-badge global">🔒 全局默认值</span>
          <span class="clt-desc">以下配置将作为所有新上传文档的默认解析方案</span>
        </div>
      </div>

      <div class="wf-section">
        <label class="wf-section-label">文档解析器（默认）</label>
        <div class="parser-cards">
          ${parsers.map(p => `
            <div class="parser-card ${kb.config.parser === p.value ? 'pc-active' : ''}" data-parser="${p.value}">
              <span class="pc-icon">${p.icon}</span>
              <span class="pc-name">${p.label}</span>
              <span class="pc-desc">${p.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="wf-section">
        <label class="wf-section-label">切片策略配置（默认）</label>
        <div id="ek-chunk-config"></div>
      </div>
    `;
  }

  _renderEditStep3() {
    const kb = this._editKB;
    const embModels = window.embeddingModels || [];
    const vdbOpts = window.vectorDBOptions || [];
    return `
      <div class="wiz-step-title">向量化配置</div>
      <div class="config-level-tag-bar mandatory">
        <div class="clt-content">
          <span class="clt-badge mandatory">🔒 强制统一</span>
          <span class="clt-desc">Embedding 模型和向量数据库为知识库级配置，所有文档必须使用相同的向量化方案</span>
        </div>
      </div>

      <div class="wf-section">
        <label class="wf-section-label">Embedding 模型</label>
        <div class="emb-model-grid">
          ${embModels.map(m => `
            <div class="emb-model-card ${kb.config.embeddingModel === m.value ? 'em-active' : ''}" data-model="${m.value}">
              <div class="em-provider">${m.provider}</div>
              <div class="em-name">${m.label}</div>
              <div class="em-dim">${m.dim} 维</div>
              <div class="em-desc">${m.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="wf-section">
        <label class="wf-section-label">向量数据库</label>
        <div class="vdb-cards">
          ${vdbOpts.map(v => `
            <div class="vdb-card ${kb.config.vectorDB === v.value ? 'vc-active' : ''}" data-vdb="${v.value}">
              <span class="vc-icon">${v.icon}</span>
              <span class="vc-name">${v.label}</span>
              <span class="vc-desc">${v.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _bindEditWizEvents() {
    if (this._editWizStep === 2) {
      setTimeout(() => {
        if (this.chunkConfigComponent) this.chunkConfigComponent = null;
        this.chunkConfigComponent = new ChunkConfig('ek-chunk-config', {
          onChange: cfg => { this._editKB.config = { ...this._editKB.config, ...cfg }; }
        });
        this.chunkConfigComponent.setConfig(this._editKB.config);

        document.querySelectorAll('.parser-card').forEach(card => {
          card.addEventListener('click', () => {
            document.querySelectorAll('.parser-card').forEach(c => c.classList.remove('pc-active'));
            card.classList.add('pc-active');
            this._editKB.config.parser = card.dataset.parser;
          });
        });
      }, 0);
    }

    if (this._editWizStep === 3) {
      setTimeout(() => {
        document.querySelectorAll('.emb-model-card').forEach(card => {
          card.addEventListener('click', () => {
            document.querySelectorAll('.emb-model-card').forEach(c => c.classList.remove('em-active'));
            card.classList.add('em-active');
            this._editKB.config.embeddingModel = card.dataset.model;
          });
        });
        document.querySelectorAll('.vdb-card').forEach(card => {
          card.addEventListener('click', () => {
            document.querySelectorAll('.vdb-card').forEach(c => c.classList.remove('vc-active'));
            card.classList.add('vc-active');
            this._editKB.config.vectorDB = card.dataset.vdb;
          });
        });
      }, 0);
    }
  }

  _updateEditWizStepsUI() {
    document.querySelectorAll('.wiz-step').forEach(s => {
      const n = parseInt(s.dataset.s);
      s.classList.toggle('active', n === this._editWizStep);
      s.classList.toggle('done', n < this._editWizStep);
      const numEl = s.querySelector('.ws-num');
      if (numEl) numEl.textContent = n < this._editWizStep ? '✓' : n;
    });
    const prevBtn = document.getElementById('edit-wiz-prev');
    const nextBtn = document.getElementById('edit-wiz-next');
    if (prevBtn) prevBtn.style.display = this._editWizStep === 1 ? 'none' : '';
    if (nextBtn) nextBtn.textContent = this._editWizStep === 3 ? '保存修改 ✓' : '下一步 →';
  }

  editWizPrev() {
    if (this._editWizStep > 1) {
      this._saveEditStep();
      this._editWizStep--;
      this._renderEditWizStep();
    }
  }

  editWizNext() {
    if (this._editWizStep < 3) {
      this._saveEditStep();
      this._editWizStep++;
      this._renderEditWizStep();
    } else {
      this._submitEditKB();
    }
  }

  _saveEditStep() {
    if (this._editWizStep === 1) {
      this._editKB.name = document.getElementById('ek-name')?.value || '';
      this._editKB.category = document.getElementById('ek-category')?.value || '';
      this._editKB.description = document.getElementById('ek-desc')?.value || '';
    }
    if (this._editWizStep === 2 && this.chunkConfigComponent) {
      this._editKB.config = { ...this._editKB.config, ...this.chunkConfigComponent.getConfig() };
    }
  }

  _submitEditKB() {
    this._saveEditStep();
    const kb = this._editKB;
    if (!kb.name) { alert('请输入知识库名称'); return; }
    const idx = (window.knowledgeBases || []).findIndex(k => k.id === kb.id);
    if (idx > -1) window.knowledgeBases[idx] = kb;
    this.currentKB = kb;
    document.getElementById('modal-container').innerHTML = '';
    alert('✅ 知识库修改成功！');
    this.navigateTo('detail', { kb });
  }

  closeEditWiz() {
    document.getElementById('modal-container').innerHTML = '';
  }

  saveKnowledgeEdit() {
    const name = document.getElementById('edit-name').value;
    const category = document.getElementById('edit-category').value;
    const desc = document.getElementById('edit-desc').value;

    if (!name) {
      alert('请输入知识库名称');
      return;
    }

    this.currentKB.name = name;
    this.currentKB.category = category;
    this.currentKB.description = desc;

    alert('✅ 知识库修改成功！');
    this.navigateTo('detail', { kb: this.currentKB });
  }

  deleteKnowledgeBase(id, name) {
    if (confirm(`确定要删除知识库「${name}」吗？\n\n删除后将无法恢复，所有相关的文档和切片也将被删除。`)) {
      // 模拟删除操作
      alert(`✅ 知识库「${name}」已成功删除！`);
      // 重新渲染知识库列表
      this.navigateTo('list');
    }
  }

  editKnowledgeBase(id) {
    console.log('Edit button clicked with id:', id);
    console.log('Available knowledge bases:', window.knowledgeBases || []);
    const kb = (window.knowledgeBases || []).find(k => k.id === id);
    console.log('Found knowledge base:', kb);
    if (kb) {
      console.log('Navigating to edit page with kb:', kb);
      this.navigateTo('edit', { kb });
    } else {
      console.log('Knowledge base not found for id:', id);
    }
  }

  viewKnowledgeBase(id) {
    const kb = (window.knowledgeBases || []).find(k => k.id === id);
    if (kb) {
      this.navigateTo('detail', { kb });
    }
  }

  // ========== 切片编辑 + 召回测试 页（左右分栏）==========
  renderChunkEditorPage(container, kb, doc) {
    const docChunks = (window.chunks || {})[doc.id] || [];
    container.innerHTML = `
      <div class="ce-page-header">
        <div class="ceph-left">
          <button class="btn btn-default" onclick="app.navigateTo('detail',{kb:app.currentKB})">← 返回详情</button>
          <div class="ceph-doc-info">
            <span class="ceph-doc-icon">${this.getFormatIcon(doc.format)}</span>
            <div>
              <div class="ceph-doc-name">${doc.name}</div>
              <div class="ceph-doc-meta">${doc.format.toUpperCase()} · ${doc.size} · ${doc.chunkCount||docChunks.length} 个切片</div>
            </div>
          </div>
        </div>
        <div class="ceph-right">
        </div>
      </div>

      <div class="ce-split-layout">
        <!-- 左侧：切片CRUD -->
        <div class="ce-left-panel" style="flex:1;">
          <div class="clp-header">
            <span class="clp-title">切片列表 (${docChunks.length})</span>
            <div class="search-box" style="width:200px;">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="搜索切片内容..." id="chunk-search-input">
            </div>
          </div>
          <div class="clp-body" id="chunk-list-body">
            ${docChunks.length > 0 ? docChunks.map((ch, i) => this.renderChunkCard(ch, i)).join('') : `
              <div class="empty-state-ce">
                <div class="empty-icon-big">📭</div>
                <div class="empty-title">暂无切片数据</div>
                <div class="empty-desc">该文档尚未完成解析或没有产生切片</div>
              </div>
            `}
          </div>
        </div>

        <!-- 右侧：召回测试 -->
        <div class="ce-mid-panel" id="ce-retrieval-panel">
          <div class="ce-mid-header">
            <span class="ce-mid-title">召回测试</span>
            <button class="btn btn-default btn-sm" onclick="app.openRetrievalLab()">
              🔬 检索召回实验室
            </button>
          </div>
          <div id="ce-retrieval-test" style="display:flex;flex-direction:column;height:100%;overflow:hidden;"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
    }, 0);

    this.retrievalTestComponent = new RetrievalTest('ce-retrieval-test', {
      chunks: docChunks,
      kbName: doc.name,
      mode: 'single',
      onTest: (results) => {
        this._refreshRetrievalHistory();
      }
    });
    this._refreshRetrievalHistory();
  }

  _refreshRetrievalHistory() {
    const history = this.retrievalTestComponent?.getHistory() || [];
    const list = document.getElementById('ce-history-list');
    if (!list) return;
    if (history.length === 0) {
      list.innerHTML = '<div class="chp-empty">暂无历史记录</div>';
      return;
    }
    list.innerHTML = history.map(h => `
      <div class="chp-item" onclick="app.replayRetrieval('${h.query.replace(/'/g, "\\'")}')">
        <div class="chi-query">${h.query}</div>
        <div class="chi-meta">
          <span>TopK: ${h.topK}</span>
          <span>相似度: ${h.threshold}</span>
          <span>${h.count}条</span>
        </div>
        <div class="chi-time">${h.time}</div>
      </div>
    `).join('');
  }

  clearRetrievalHistory() {
    if (this.retrievalTestComponent) {
      this.retrievalTestComponent.clearHistory();
      this._refreshRetrievalHistory();
    }
  }

  replayRetrieval(query) {
    if (this.retrievalTestComponent) {
      this.retrievalTestComponent.setQuery(query);
      this.retrievalTestComponent.runTest();
    }
  }

  runQuickRetrieval() {
    const query = document.getElementById('chp-query-input')?.value.trim();
    if (!query) {
      const input = document.getElementById('chp-query-input');
      if (input) { input.style.borderColor = '#ff4d4f'; setTimeout(() => { input.style.borderColor = ''; }, 800); }
      return;
    }
    const topK = parseInt(document.getElementById('chp-topk')?.value || '5');
    const threshold = parseFloat(document.getElementById('chp-threshold')?.value || '0.6');
    const btn = document.getElementById('btn-chp-test');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ 检索中...';
    }
    setTimeout(() => {
      const results = this._generateMockRetrievalResults(query, topK);
      this._showQuickRetrievalResults(results, query, topK, threshold);
      if (btn) {
        btn.disabled = false;
        btn.textContent = '⚡ 立即测试';
      }
    }, 800 + Math.random() * 600);
  }

  _generateMockRetrievalResults(query, topK) {
    const allChunks = [];
    const chunksMap = window.chunks || {};
    Object.values(chunksMap).forEach(arr => arr.forEach(c => allChunks.push(c)));
    if (allChunks.length === 0) {
      return Array.from({ length: Math.min(topK, 5) }, (_, i) => ({
        chunkId: `chunk-mock-${i}`,
        content: `这是关于「${query}」的检索结果片段 ${i + 1}。在实际系统中，这里会显示从向量数据库中检索到的最相似切片内容。`,
        score: (0.95 - i * 0.03).toFixed(3),
        docName: '示例文档.pdf',
        matchType: i === 0 ? 'exact' : i === 1 ? 'high' : 'medium'
      }));
    }
    const docChunks = allChunks;
    const scores = docChunks.map((c, i) => ({
      chunk: c,
      score: Math.max(0.3, parseFloat((0.96 - i * 0.018 + Math.random() * 0.04).toFixed(3)))
    }));
    return scores.slice(0, topK).map(s => ({
      chunkId: s.chunk.id,
      content: s.chunk.content,
      score: s.score,
      docName: '相关文档.pdf',
      matchType: s.score >= 0.85 ? 'high' : s.score >= 0.7 ? 'medium' : 'low'
    }));
  }

  _showQuickRetrievalResults(results, query, topK, threshold) {
    this.retrievalTestComponent.results = results;
    this.retrievalTestComponent.testHistory.unshift({
      query,
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      count: results.length,
      topK,
      threshold
    });
    if (this.retrievalTestComponent.testHistory.length > 10) this.retrievalTestComponent.testHistory.pop();
    this.retrievalTestComponent.render();
    this.retrievalTestComponent.bindEvents();
    this._refreshRetrievalHistory();
  }

  openRetrievalLab(initialMode) {
    const modal = document.getElementById('modal-container');
    const doc = this.currentDoc;
    const kb = this.currentKB;
    const docChunks = (window.chunks || {})[doc?.id] || [];
    const allChunks = Object.values(window.chunks || {}).flat();

    modal.innerHTML = `
      <div class="modal-overlay active" id="lab-modal">
        <div class="modal" style="width:96vw;height:92vh;max-width:1600px;display:flex;flex-direction:column;padding:0;">
          <div id="rlab-container" style="flex:1;display:flex;flex-direction:column;"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.retrievalLabComponent = new RetrievalLab('rlab-container', {
        kb: kb,
        doc: doc,
        allChunks: allChunks
      });
      if (initialMode === 'compare') {
        this.retrievalLabComponent.switchMode('compare');
      }
    }, 0);
  }

  closeRetrievalLab() {
    const modal = document.getElementById('lab-modal');
    if (modal) modal.remove();
    document.getElementById('modal-container').innerHTML = '';
  }

  _renderLabTestSet() {
    const content = document.getElementById('rlab-content');
    if (!content) return;
    const savedSets = this._labTestSets || [];
    const totalItems = savedSets.reduce((sum, s) => sum + (s.items?.length || 0), 0);
    content.innerHTML = `
      <div class="rlab-testset">
        <div class="rts-header">
          <div class="rts-title-section">
            <span class="rts-icon">📋</span>
            <div>
              <div class="rts-title">测试集管理</div>
              <div class="rts-desc">管理问答测试集，勾选后批量运行验证召回效果</div>
            </div>
          </div>
          <button class="btn btn-primary" onclick="app.addNewTestSet()">+ 新建测试集</button>
        </div>
        ${savedSets.length === 0 ? `
          <div class="rts-empty">
            <div class="rts-empty-icon">📋</div>
            <div class="rts-empty-title">暂无测试集</div>
            <div class="rts-empty-desc">创建问答测试集，系统性验证不同切片策略的召回效果</div>
            <button class="btn btn-primary" onclick="app.addNewTestSet()">创建第一个测试集</button>
          </div>
        ` : `
          <div class="rts-summary-bar">
            <span>共 <strong>${savedSets.length}</strong> 个测试集</span>
            <span>·</span>
            <span>共 <strong>${totalItems}</strong> 条问答</span>
          </div>
          <div class="rts-list" id="rts-list">
            ${savedSets.map((s, i) => `
              <div class="rts-card" onclick="app.openTestSet(${i})">
                <div class="rts-card-header">
                  <span class="rts-card-name">${s.name}</span>
                  <span class="rts-card-count">${s.items?.length || 0} 条问答</span>
                </div>
                <div class="rts-card-meta">创建于 ${s.createdAt || '最近'}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  addNewTestSet() {
    const name = prompt('输入测试集名称：', `测试集 ${(this._labTestSets?.length || 0) + 1}`);
    if (!name) return;
    if (!this._labTestSets) this._labTestSets = [];
    this._labTestSets.push({
      name,
      items: [],
      createdAt: new Date().toLocaleDateString('zh-CN')
    });
    this._renderLabTestSet();
  }

  openTestSet(index) {
    const s = this._labTestSets[index];
    if (!s) return;
    this._activeTestSetIndex = index;
    const items = s.items || [];
    const content = document.getElementById('rlab-content');
    content.innerHTML = `
      <div class="rts-detail">
        <div class="rts-detail-header">
          <div>
            <div class="rts-detail-name">${s.name}</div>
            <div class="rts-detail-meta">${items.length} 条问答</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-default" onclick="app.switchLabTab('testset')">← 返回</button>
            <button class="btn btn-default" onclick="app.addQAToTestSet()">+ 添加问答</button>
            <button class="btn btn-primary" id="btn-run-selected" onclick="app.runSelectedQAs()">⚡ 运行选中 (<span id="rts-sel-count">0</span>)</button>
          </div>
        </div>
        <div class="rts-qa-toolbar">
          <label class="rts-sel-all">
            <input type="checkbox" id="rts-sel-all" onchange="app.toggleSelectAll()">
            全选
          </label>
          <span class="rts-sel-tip">勾选要运行的问答，点击「运行选中」批量执行</span>
        </div>
        <div class="rts-query-list" id="rts-query-list">
          ${items.length === 0 ? `
            <div class="rts-empty-hint">暂无问答，请点击「添加问答」按钮添加</div>
          ` : items.map((item, i) => `
            <div class="rts-qa-item" data-index="${i}">
              <label class="rts-qa-checkbox">
                <input type="checkbox" data-idx="${i}" onchange="app.updateSelectedCount()">
              </label>
              <div class="rts-qa-content">
                <div class="rts-qa-q"><span class="rts-q-label">Q</span><span>${item.question}</span></div>
                <div class="rts-qa-a"><span class="rts-a-label">A</span><span>${item.expected || '<未填写期望答案>'}</span></div>
              </div>
              <button class="btn btn-text btn-xs" onclick="app.removeQAFromSet(${i})">删除</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this._updateSelectedCount();
  }

  toggleSelectAll() {
    const checked = document.getElementById('rts-sel-all')?.checked;
    document.querySelectorAll('#rts-query-list input[type=checkbox]').forEach(cb => { cb.checked = checked; });
    this._updateSelectedCount();
  }

  updateSelectedCount() {
    this._updateSelectedCount();
  }

  _updateSelectedCount() {
    const checked = document.querySelectorAll('#rts-query-list input[type=checkbox]:checked').length;
    const span = document.getElementById('rts-sel-count');
    if (span) span.textContent = checked;
    const btn = document.getElementById('btn-run-selected');
    if (btn) btn.disabled = checked === 0;
  }

  addQAToTestSet() {
    const idx = this._activeTestSetIndex;
    if (idx === undefined || !this._labTestSets[idx]) return;
    const question = prompt('输入问题（Query）：');
    if (!question || !question.trim()) return;
    const expected = prompt('输入期望答案（可选）：');
    this._labTestSets[idx].items.push({
      id: 'qa-' + Date.now(),
      question: question.trim(),
      expected: expected?.trim() || ''
    });
    this.openTestSet(idx);
  }

  removeQAFromSet(qaIndex) {
    const idx = this._activeTestSetIndex;
    if (idx === undefined || !this._labTestSets[idx]) return;
    this._labTestSets[idx].items.splice(qaIndex, 1);
    this.openTestSet(idx);
  }

  runSelectedQAs() {
    const idx = this._activeTestSetIndex;
    const s = this._labTestSets[idx];
    if (!s) return;
    const checked = Array.from(document.querySelectorAll('#rts-query-list input[type=checkbox]:checked')).map(cb => parseInt(cb.dataset.idx));
    if (checked.length === 0) { alert('请先勾选要运行的问答'); return; }
    const selectedItems = checked.map(i => s.items[i]).filter(Boolean);
    const results = [];
    selectedItems.forEach(item => {
      const r = this._generateMockRetrievalResults(item.question, 5);
      results.push({ question: item.question, expected: item.expected, results: r });
    });
    const content = document.getElementById('rlab-content');
    content.innerHTML = `
      <div class="rts-detail">
        <div class="rts-detail-header">
          <div>
            <div class="rts-detail-name">${s.name} - 批量测试结果</div>
            <div class="rts-detail-meta">${results.length} 条问答测试完成</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-default" onclick="app.openTestSet(${idx})">← 返回测试集</button>
          </div>
        </div>
        <div class="rts-results-list">
          ${results.map((r, i) => `
            <div class="rts-result-item">
              <div class="rts-result-query">
                <span class="rts-query-num">${i + 1}</span>
                <div class="rts-result-q">
                  <div class="rrq-text"><strong>Q:</strong> ${r.question}</div>
                  ${r.expected ? `<div class="rrq-expected"><strong>期望:</strong> ${r.expected}</div>` : ''}
                </div>
                <span class="rts-result-count">${r.results.length} 条召回</span>
              </div>
              <div class="rts-result-chunks">
                ${r.results.map((c, j) => `
                  <div class="rts-chunk-card">
                    <div class="rts-chunk-score" style="background:${c.score >= 0.85 ? '#f6ffed' : c.score >= 0.7 ? '#fffbe6' : '#fff1f0'};color:${c.score >= 0.85 ? '#52c41a' : c.score >= 0.7 ? '#faad14' : '#ff4d4f'};">
                      ${c.score.toFixed(2)}
                    </div>
                    <div class="rts-chunk-content">${c.content.substring(0, 150)}${c.content.length > 150 ? '...' : ''}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  closeRetrievalLab() {
    document.getElementById('modal-container').innerHTML = '';
  }

  openComparePage() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-overlay active" id="compare-modal">
        <div class="modal modal-wiz-xl" style="max-width:95vw;height:90vh;">
          <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-color);">
            <h3 style="margin:0;font-size:15px;">⚖️ 召回对比测试</h3>
            <button class="modal-close" onclick="app.closeComparePage()">×</button>
          </div>
          <div style="flex:1;overflow:hidden;">
            <div id="compare-retrieval" style="height:100%;"></div>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      new RetrievalTest('compare-retrieval', {
        kbName: this.currentDoc?.name || '',
        mode: 'compare'
      });
    }, 0);
  }

  closeComparePage() {
    document.getElementById('compare-modal')?.remove();
  }

  renderChunkCard(chunk, index) {
    return `
      <div class="chunk-edit-card" data-id="${chunk.id}">
        <div class="cec-header">
          <div class="cec-left">
            <span class="cec-index">#${index+1}</span>
            <span class="cec-id-tag">${chunk.id}</span>
          </div>
          <div class="cec-actions cec-icon-actions">
            <button class="cec-icon-btn" onclick="app.editChunkText('${chunk.id}')" title="编辑切片">✏️</button>
            <button class="cec-icon-btn" onclick="app.addChunkAbove('${chunk.id}')" title="在上方添加切片">⊕</button>
            <button class="cec-icon-btn" onclick="app.addChunkBelow('${chunk.id}')" title="在下方添加切片">⊕</button>
            <button class="cec-icon-btn cec-danger" onclick="app.deleteChunkItem('${chunk.id}')" title="删除切片">🗑</button>
          </div>
        </div>
        <div class="cec-content" id="cc-content-${chunk.id}">${chunk.content}</div>
        <div class="cec-footer">
          <span class="cec-meta">${chunk.charCount} 字符 · ${Math.ceil(chunk.charCount/1.8)} tokens</span>
          <button class="cec-toggle" onclick="app.toggleChunkExpand('${chunk.id}',this)">展开 ▾</button>
        </div>
      </div>
    `;
  }

  getFormatIcon(fmt) {
    const m={pdf:'📕',doc:'📘',docx:'📘',excel:'📗',xlsx:'📗',txt:'📄',md:'📝',pptx:'📊'};return m[fmt]||'📄';
  }

  // ========== 个性化设置页面 ==========
  renderSettings(container) {
    // 初始化设置状态
    this.settingsState = {
      hasChanges: false
    };

    container.innerHTML = `
      <div class="settings-page">
        <div class="settings-header">
          <h2 class="page-title-lg">个性化设置</h2>
          <p class="page-subtitle">配置平台全局设置和RAG引擎参数</p>
        </div>

        <!-- 首页配置 -->
        <div class="settings-content">
          <div class="settings-section">
            <h3 class="section-title">品牌设置</h3>
            <div class="divider"></div>
            <div class="settings-form">
              <div class="form-group">
                <label class="form-label">品牌名称</label>
                <input type="text" class="form-input" value="数字孪生" placeholder="输入品牌名称">
                <span class="form-hint">4/20</span>
              </div>
              <div class="form-group">
                <label class="form-label">品牌Logo</label>
                <div class="logo-upload-area">
                  <div class="logo-preview">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%231890ff'/%3E%3Ctext x='50' y='55' font-size='40' text-anchor='middle' fill='white'%3EQ%3C/text%3E%3C/svg%3E" alt="Logo">
                  </div>
                  <div class="logo-upload-text">
                    <span>图片格式支持 jpg/png，大小不超过2M</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">品牌标语</label>
                <input type="text" class="form-input" value="智力打造的云计算产品，以卓越科技能力助力各行业数字化转型" placeholder="输入品牌标语">
                <span class="form-hint">29/30</span>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3 class="section-title">首页智能体推荐</h3>
            <div class="divider"></div>
            <div class="agent-selector">
              <div class="agent-select-left">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="输入关键字搜索">
                </div>
                <div class="agent-list">
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox">
                    <span class="agent-name">测试111</span>
                  </div>
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox">
                    <span class="agent-name">接入新物种智能体</span>
                  </div>
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox">
                    <span class="agent-name">构文智能体</span>
                  </div>
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox" checked>
                    <span class="agent-name">2号</span>
                  </div>
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox" checked>
                    <span class="agent-name">千里眼接入</span>
                  </div>
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox" checked>
                    <span class="agent-name">智能体4.9-心理大师</span>
                  </div>
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox" checked>
                    <span class="agent-name">默认智能体</span>
                  </div>
                  <div class="agent-item">
                    <input type="checkbox" class="agent-checkbox" checked>
                    <span class="agent-name">产品智能体4-战略咨询</span>
                  </div>
                </div>
              </div>
              <div class="agent-select-right">
                <div class="selected-agents-header">
                  <span>已选 6</span>
                </div>
                <div class="selected-agents-list">
                  <div class="selected-agent-item">
                    <span>纯文本智能体</span>
                    <button class="remove-agent-btn">×</button>
                  </div>
                  <div class="selected-agent-item">
                    <span>2号</span>
                    <button class="remove-agent-btn">×</button>
                  </div>
                  <div class="selected-agent-item">
                    <span>千里眼接入</span>
                    <button class="remove-agent-btn">×</button>
                  </div>
                  <div class="selected-agent-item">
                    <span>智能体4.9-心理大师</span>
                    <button class="remove-agent-btn">×</button>
                  </div>
                  <div class="selected-agent-item">
                    <span>默认智能体</span>
                    <button class="remove-agent-btn">×</button>
                  </div>
                  <div class="selected-agent-item">
                    <span>产品智能体4-战略咨询</span>
                    <button class="remove-agent-btn">×</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-footer">
            <button class="btn btn-default">预览效果</button>
            <button class="btn btn-primary">保存设置</button>
          </div>
        </div>
      </div>
    `;


  }

  // 测试向量数据库连接
  testVectorDBConnection() {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ 测试中...';
    setTimeout(() => {
      const status = document.getElementById('connection-status');
      const isSuccess = Math.random() > 0.3; // 模拟70%成功率
      if (isSuccess) {
        status.textContent = '连接成功';
        status.className = 'connection-status success';
        this.settingsState.vectorDB.connectionStatus = 'success';
      } else {
        status.textContent = '连接异常';
        status.className = 'connection-status error';
        this.settingsState.vectorDB.connectionStatus = 'error';
      }
      btn.disabled = false;
      btn.textContent = originalText;
    }, 1000);
  }

  // 切换模型选择状态
  toggleModelSelection(modelId, checked) {
    const model = this.settingsState.embeddingModels.available.find(m => m.id === modelId);
    if (model) {
      model.selected = checked;
      this.settingsState.hasChanges = true;
      // 重新渲染设置页面以更新UI
      this.renderSettings(document.getElementById('page-content'));
    }
  }

  // 移除模型
  removeModel(modelId) {
    const model = this.settingsState.embeddingModels.available.find(m => m.id === modelId);
    if (model) {
      model.selected = false;
      // 如果移除的是默认模型，选择第一个可用模型作为默认
      if (modelId === this.settingsState.embeddingModels.default) {
        const firstSelected = this.settingsState.embeddingModels.available.find(m => m.selected);
        if (firstSelected) {
          this.settingsState.embeddingModels.default = firstSelected.id;
        }
      }
      this.settingsState.hasChanges = true;
      // 重新渲染设置页面以更新UI
      this.renderSettings(document.getElementById('page-content'));
    }
  }

  // 更新默认模型
  updateDefaultModel(modelId) {
    this.settingsState.embeddingModels.default = modelId;
    this.settingsState.hasChanges = true;
    // 重新渲染设置页面以更新UI
    this.renderSettings(document.getElementById('page-content'));
  }

  // 保存RAG设置
  saveRAGSettings() {
    // 检查是否有维度缺失的模型
    const selectedModels = this.settingsState.embeddingModels.available.filter(m => m.selected);
    const modelsWithNoDim = selectedModels.filter(m => !m.dim || m.dim === 0);
    if (modelsWithNoDim.length > 0) {
      alert('错误：所选模型中存在维度信息缺失的模型，请确保所有模型都有维度信息。');
      return;
    }

    // 检查是否修改了Endpoint或删除了已使用的模型
    const endpointChanged = this.settingsState.vectorDB.endpoint !== this.settingsState.originalConfig.vectorDB.endpoint;
    const modelsRemoved = this.settingsState.originalConfig.embeddingModels.available
      .filter(m => m.selected)
      .some(m => !this.settingsState.embeddingModels.available.find(mm => mm.id === m.id && mm.selected));

    if (endpointChanged || modelsRemoved) {
      if (!confirm('检测到配置变更。修改底层向量库或模型维度可能导致存量知识库失效，是否确认应用？')) {
        return;
      }
    }

    // 模拟保存操作
    setTimeout(() => {
      alert('✅ RAG引擎配置保存成功！');
      this.settingsState.hasChanges = false;
      // 更新原始配置
      this.settingsState.originalConfig = {
        vectorDB: { ...this.settingsState.vectorDB },
        embeddingModels: { ...this.settingsState.embeddingModels }
      };
    }, 500);
  }

  // ========== 算力与存储主页面 ==========
  renderComputeStorage(container) {
    container.innerHTML = `
      <div class="page-header-row">
        <div class="ph-left">
          <h2 class="page-title-lg">算力与存储</h2>
          <p class="page-subtitle">统一管理计算资源和存储服务</p>
        </div>
      </div>

      <div class="resource-center-grid">
        <div class="resource-card" onclick="app.navigateTo('model-management')">
          <div class="rc-icon">🧠</div>
          <div class="rc-content">
            <h3 class="rc-title">模型管理</h3>
            <p class="rc-desc">管理和配置大模型，支持高可用分发与自动故障切换</p>
            <div class="rc-stats">
              <span class="rc-stat-item">
                <span class="rc-stat-value">${(window.llmModels || []).length}</span>
                <span class="rc-stat-label">已注册模型</span>
              </span>
              <span class="rc-stat-item">
                <span class="rc-stat-value">${(window.llmModels || []).filter(m => m.status === 'active').length}</span>
                <span class="rc-stat-label">运行中</span>
              </span>
            </div>
          </div>
          <div class="rc-arrow">→</div>
        </div>

        <div class="resource-card" onclick="app.navigateTo('storage')">
          <div class="rc-icon">🗄️</div>
          <div class="rc-content">
            <h3 class="rc-title">存储服务</h3>
            <p class="rc-desc">配置向量数据库连接，管理存储资源</p>
            <div class="rc-stats">
              <span class="rc-stat-item">
                <span class="rc-stat-value">4</span>
                <span class="rc-stat-label">支持的数据库</span>
              </span>
              <span class="rc-stat-item">
                <span class="rc-stat-value">${window.knowledgeBases ? window.knowledgeBases.length : 0}</span>
                <span class="rc-stat-label">关联知识库</span>
              </span>
            </div>
          </div>
          <div class="rc-arrow">→</div>
        </div>
      </div>
    `;
  }

  // ========== 存储服务页面 ==========
  renderStorageService(container) {
    // 初始化设置状态
    this.settingsState = {
      vectorDB: {
        type: 'milvus',
        endpoint: 'http://localhost:19530',
        apiKey: '******',
        connectionStatus: 'pending' // pending, success, error
      },
      hasChanges: false
    };

    // 初始化原始配置
    this.settingsState.originalConfig = {
      vectorDB: { ...this.settingsState.vectorDB }
    };

    container.innerHTML = `
      <div class="settings-page">
        <div class="settings-header">
          <h2 class="page-title-lg">存储服务</h2>
          <p class="page-subtitle">配置向量数据库连接和存储资源</p>
        </div>

        <div class="settings-section">
          <h3 class="section-title">向量底座模块</h3>
          <div class="divider"></div>
          <div class="settings-form">
            <div class="form-group">
              <label class="form-label">数据库类型</label>
              <select class="form-select" id="vdb-type" onchange="app.settingsState.hasChanges = true;">
                <option value="milvus" ${this.settingsState.vectorDB.type === 'milvus' ? 'selected' : ''}>Milvus</option>
                <option value="pgvector" ${this.settingsState.vectorDB.type === 'pgvector' ? 'selected' : ''}>PGVector</option>
                <option value="qdrant" ${this.settingsState.vectorDB.type === 'qdrant' ? 'selected' : ''}>Qdrant</option>
                <option value="weaviate" ${this.settingsState.vectorDB.type === 'weaviate' ? 'selected' : ''}>Weaviate</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">连接 Endpoint</label>
              <input type="text" class="form-input" id="vdb-endpoint" value="${this.settingsState.vectorDB.endpoint}" placeholder="Milvus 默认 http://localhost:19530" onchange="app.settingsState.hasChanges = true;">
            </div>
            <div class="form-group">
              <label class="form-label">API Key/Token</label>
              <input type="password" class="form-input" id="vdb-api-key" value="${this.settingsState.vectorDB.apiKey}" placeholder="输入API Key或Token" onchange="app.settingsState.hasChanges = true;">
            </div>
            <div class="form-group flex-align-center">
              <button class="btn btn-primary" onclick="app.testVectorDBConnection()">测试连接</button>
              <span class="connection-status ${this.settingsState.vectorDB.connectionStatus}" id="connection-status">
                ${this.settingsState.vectorDB.connectionStatus === 'pending' ? '待测试' : 
                  this.settingsState.vectorDB.connectionStatus === 'success' ? '连接成功' : '连接异常'}
              </span>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="info-box">
            <div class="info-icon">💡</div>
            <div class="info-content">
              <p>提示：系统将自动关联[模型管理]中已启用的向量模型，并根据优先级自动调度。</p>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="btn btn-primary" onclick="app.saveStorageSettings()">保存设置</button>
        </div>
      </div>
    `;
  }

  // 保存存储设置
  saveStorageSettings() {
    // 检查是否修改了Endpoint
    const endpointChanged = this.settingsState.vectorDB.endpoint !== this.settingsState.originalConfig.vectorDB.endpoint;

    if (endpointChanged) {
      if (!confirm('检测到配置变更。修改底层向量库可能导致存量知识库失效，是否确认应用？')) {
        return;
      }
    }

    // 模拟保存操作
    setTimeout(() => {
      alert('✅ 存储服务配置保存成功！');
      this.settingsState.hasChanges = false;
      // 更新原始配置
      this.settingsState.originalConfig = {
        vectorDB: { ...this.settingsState.vectorDB }
      };
    }, 500);
  }

  // ========== RAG 环境初始化引导页面 ==========
  // 检查 RAG 环境状态
  handleCheck() {
    // 模拟后端返回的存储信息
    const storageInfo = {
      engine: '内置 Milvus 集群',
      status: '连接正常'
    };
    
    // 模拟检测到的模型列表
    const vectorModels = window.llmModels ? window.llmModels.filter(model => model.type === '向量模型' && model.status === 'active') : [];
    
    // 更新状态
    this.ragOnboardingState = {
      storageConnected: true, // 模拟后端返回已连接
      modelsReady: vectorModels.length > 0,
      storageInfo: storageInfo,
      vectorModels: vectorModels
    };
  }

  renderRAGOnboardingGuide(container) {
    // 初始化状态并自动检查
    if (!this.ragOnboardingState) {
      this.handleCheck();
    }

    // 生成模型列表，包含维度信息
    const modelList = this.ragOnboardingState.vectorModels ? this.ragOnboardingState.vectorModels.map(m => {
      // 模拟获取模型维度
      const dimension = m.name.includes('text-embedding-3') ? '1536维' : m.name.includes('bge') ? '1024维' : '768维';
      return `${m.name} (${dimension})`;
    }).join(', ') : '无';

    container.innerHTML = `
      <div class="onboarding-container">
        <div class="onboarding-header">
          <div class="onboarding-title">
            <div class="title-icon">⚙️</div>
            <h2 class="title-text">初始化您的 RAG 检索环境</h2>
            <p class="title-desc">完成以下配置，开启智能检索能力</p>
          </div>
        </div>

        <div class="onboarding-content">
          <div class="onboarding-cards">
            <!-- 存储底座卡片 -->
            <div class="onboarding-card ${this.ragOnboardingState.storageConnected ? 'card-success' : 'card-error'}">
              <div class="card-header">
                <div class="card-icon">🗄️</div>
                <h3 class="card-title">存储底座 (向量数据库)</h3>
              </div>
              <div class="card-body">
                <div class="card-status">
                  <span class="status-icon ${this.ragOnboardingState.storageConnected ? 'status-success' : 'status-error'}">
                    ${this.ragOnboardingState.storageConnected ? '✅' : '❌'}
                  </span>
                  <span class="status-text">
                    ${this.ragOnboardingState.storageConnected ? this.ragOnboardingState.storageInfo.status : '未连接'}
                  </span>
                </div>
                <div class="card-info">
                  <p>存储引擎：${this.ragOnboardingState.storageInfo ? this.ragOnboardingState.storageInfo.engine : '未知'}</p>
                  <p>集群地址：localhost:19530</p>
                </div>
                <div class="card-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.ragOnboardingState.storageConnected ? '100%' : '0%'}"></div>
                  </div>
                </div>
                ${this.ragOnboardingState.storageConnected ? `
                  <button class="btn btn-default card-button" onclick="app.handleCheck()">
                    刷新状态
                  </button>
                ` : `
                  <button class="btn btn-default card-button">
                    联系系统管理员
                  </button>
                `}
              </div>
            </div>

            <!-- 算力资源卡片 -->
            <div class="onboarding-card ${this.ragOnboardingState.modelsReady ? 'card-success' : 'card-error'}">
              <div class="card-header">
                <div class="card-icon">🧠</div>
                <h3 class="card-title">算力资源 (向量模型)</h3>
              </div>
              <div class="card-body">
                <div class="card-status">
                  <span class="status-icon ${this.ragOnboardingState.modelsReady ? 'status-success' : 'status-error'}">
                    ${this.ragOnboardingState.modelsReady ? '✅' : '❌'}
                  </span>
                  <span class="status-text">
                    ${this.ragOnboardingState.modelsReady ? '已就绪' : '未启用向量模型'}
                  </span>
                </div>
                <div class="card-info">
                  <p>已就绪向量模型：${modelList}</p>
                  <p class="card-info-small">当前检索空间维度已由模型自动定义，请确保底座支持该维度规格。</p>
                </div>
                <div class="card-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.ragOnboardingState.modelsReady ? '100%' : '0%'}"></div>
                  </div>
                </div>
                <button class="btn btn-primary card-button" onclick="app.navigateTo('model-management')">
                  去管理模型
                </button>
              </div>
            </div>
          </div>

          <!-- 完成态跳转按钮 -->
          ${this.ragOnboardingState.storageConnected && this.ragOnboardingState.modelsReady ? `
            <div class="onboarding-complete">
              <button class="btn btn-primary btn-lg complete-button" onclick="app.navigateTo('list')">
                进入知识库管理 →
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 切换 RAG 环境初始化状态
  toggleOnboardingState(checked) {
    // 重新检查状态
    if (checked) {
      this.handleCheck();
    } else {
      this.ragOnboardingState = {
        storageConnected: false,
        modelsReady: false,
        storageInfo: {
          engine: '内置 Milvus 集群',
          status: '未连接'
        },
        vectorModels: []
      };
    }
    this.renderRAGOnboardingGuide(document.getElementById('page-content'));
  }

  // ========== 大模型管理页面 ==========
  renderModelManagement(container) {
    // 初始化大模型数据
    if (!window.llmModels) {
      window.llmModels = [
        {
          id: 'llm-001',
          name: 'Qwen2.5-14B-Instruct',
          series: '通义千问',
          type: '纯文本模型',
          endpoint: 'http://192.168.246.105:10152',
          status: 'active',
          healthStatus: 'healthy',
          priority: 1,
          timeout: 30,
          max_retries: 3,
          temperature: 0.5,
          max_tokens: 4096,
          createdBy: 'chenpi',
          createdAt: '2026-04-14 17:30:00'
        },
        {
          id: 'llm-002',
          name: 'DeepSeek-R1-DS3.1',
          series: 'DeepSeek',
          type: '纯文本模型',
          endpoint: 'http://192.168.246.105:10152',
          status: 'active',
          healthStatus: 'healthy',
          priority: 2,
          timeout: 30,
          max_retries: 3,
          temperature: 0.5,
          max_tokens: 4096,
          createdBy: 'chenpi',
          createdAt: '2026-04-14 17:30:07'
        },
        {
          id: 'llm-003',
          name: 'text-embedding-3',
          series: 'OpenAI',
          type: '向量模型',
          endpoint: 'http://10.0.1.22:12349/v1/embeddings',
          status: 'active',
          healthStatus: 'healthy',
          priority: 1,
          timeout: 30,
          max_retries: 3,
          temperature: 0,
          max_tokens: 8192,
          createdBy: 'zhufy',
          createdAt: '2026-03-31 12:15:38'
        },
        {
          id: 'llm-004',
          name: '1',
          series: 'OpenAI',
          type: '纯文本模型',
          endpoint: 'http://a.a.a',
          status: 'inactive',
          healthStatus: 'banned',
          priority: 3,
          timeout: 30,
          max_retries: 3,
          temperature: 0.5,
          max_tokens: 4096,
          createdBy: 'gangping',
          createdAt: '2026-03-17 16:35:36'
        },
        {
          id: 'llm-007',
          name: 'gpt-3.5-turbo',
          series: 'OpenAI',
          type: '纯文本模型',
          endpoint: 'http://invalid-endpoint:8080/v1/chat/completions',
          status: 'active',
          healthStatus: 'unhealthy',
          priority: 2,
          timeout: 30,
          retry_interval: 5,
          max_retries: 3,
          temperature: 0.7,
          context_rounds: 3,
          max_tokens: 2048,
          errorMsg: 'Connect Timeout',
          lastErrorTime: '2026-04-15 15:30:45',
          createdBy: 'admin',
          createdAt: '2026-04-15 10:00:00',
          updatedAt: '2026-04-15 15:30:45'
        }
      ];
    }

    container.innerHTML = `
      <div class="page-header-row">
        <div class="ph-left">
          <h2 class="page-title-lg">模型管理</h2>
          <p class="page-subtitle">管理和配置大模型，支持高可用分发与自动故障切换</p>
        </div>
        <button class="btn btn-primary btn-lg" onclick="app.openModelRegisterModal()">
          <span class="btn-plus">+</span> 模型注册
        </button>
      </div>

      <div class="model-filter-bar" style="margin-bottom: 20px; display: flex; gap: 12px; align-items: center;">
        <input type="text" placeholder="请输入模型名称" class="form-input" style="width: 200px;">
        <select class="form-select" style="width: 150px;">
          <option value="">请选择模型系列</option>
          <option value="openai">OpenAI</option>
          <option value="qwen">通义千问</option>
          <option value="deepseek">DeepSeek</option>
        </select>
        <select class="form-select" style="width: 150px;">
          <option value="">请选择模型类型</option>
          <option value="text">纯文本模型</option>
          <option value="multimodal">多模态模型</option>
          <option value="vector">向量模型</option>
          <option value="rerank">重排模型</option>
        </select>
        <button class="btn btn-default">查询</button>
        <button class="btn btn-text">重置</button>
      </div>

      <div class="model-list-table" style="overflow-x: auto;">
        <table class="table">
          <thead>
            <tr>
              <th width="45">#</th>
              <th>模型名称</th>
              <th>模型类型</th>
              <th>状态</th>
              <th onclick="app.sortModels('priority')" style="cursor: pointer;">调度优先级 <span class="sort-icon">↕</span></th>
              <th>调度策略</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderModelListRows(window.llmModels || [])}
          </tbody>
        </table>
      </div>
    `;
  }

  renderModelListRows(models) {
    // 按模型类型排序，同类型内按优先级排序
    const sortedModels = this.sortModelsByTypeAndPriority(models);
    let index = 1;
    let rows = '';
    
    // 直接遍历排序后的模型列表
    sortedModels.forEach(model => {
      const statusMap = {
        healthy: { text: '运行中', cls: 'healthy', tooltip: '模型运行正常' },
        unhealthy: { text: '熔断隔离', cls: 'unhealthy', tooltip: model.errorMsg || '模型调用失败' },
        banned: { text: '禁用', cls: 'banned', tooltip: '模型已禁用' }
      };
      const healthStatus = statusMap[model.healthStatus] || statusMap.healthy;
      
      // 为模型类型添加颜色Tag
      const typeTag = this.getModelTypeTag(model.type);
      
      // 状态列增强，红色状态显示报错信息
      let statusHtml = `
        <span class="health-status status-${healthStatus.cls}" title="${healthStatus.tooltip}">
          <span class="status-dot"></span>${healthStatus.text}
        </span>
      `;
      
      // 如果是熔断隔离状态，添加报错信息提示
      if (healthStatus.cls === 'unhealthy') {
        const errorTime = model.lastErrorTime || '未知时间';
        const errorMsg = model.errorMsg || '未知错误';
        statusHtml = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="health-status status-${healthStatus.cls}" title="${healthStatus.tooltip}">
              <span class="status-dot"></span>${healthStatus.text}
            </span>
            <span class="error-tooltip" title="最后报错时间：${errorTime}\n报错原因：${errorMsg}" style="cursor: help; color: #ff4d4f;">
              ⓘ
            </span>
          </div>
        `;
      }
      
      rows += `
        <tr>
          <td>${index++}</td>
          <td>${model.name}</td>
          <td>${typeTag}</td>
          <td>${statusHtml}</td>
          <td>${model.priority || 1}</td>
          <td title="超时 / 失败阈值 / 重试间隔">${model.timeout || 30}s | ${model.max_retries || 3}次 | 间隔${model.retry_interval || 5}s</td>
          <td>${model.updatedAt || model.createdAt || 'N/A'}</td>
          <td>
            <div class="model-actions" style="display: flex; gap: 8px;">
              ${model.status === 'inactive' ? 
                `<button class="btn btn-text btn-sm" onclick="app.activateModel('${model.id}')">启用</button>` : 
                `<button class="btn btn-text btn-sm" onclick="app.deactivateModel('${model.id}')">禁用</button>`
              }
              <button class="btn btn-text btn-sm" onclick="app.editModel('${model.id}')">编辑</button>
              <button class="btn btn-text btn-sm" onclick="app.testModelConnection('${model.id}')">连接测试</button>
            </div>
          </td>
        </tr>
      `;
    });
    
    return rows;
  }
  
  // 按模型类型和优先级排序
  sortModelsByTypeAndPriority(models) {
    return models.sort((a, b) => {
      // 首先按模型类型排序
      const typeOrder = {
        text: 1,
        multimodal: 2,
        vector: 3,
        rerank: 4
      };
      
      // 统一类型值为英文
      let typeA = a.type || 'text';
      let typeB = b.type || 'text';
      if (typeA === '纯文本模型') typeA = 'text';
      if (typeA === '多模态模型') typeA = 'multimodal';
      if (typeA === '向量模型') typeA = 'vector';
      if (typeA === '重排模型') typeA = 'rerank';
      if (typeB === '纯文本模型') typeB = 'text';
      if (typeB === '多模态模型') typeB = 'multimodal';
      if (typeB === '向量模型') typeB = 'vector';
      if (typeB === '重排模型') typeB = 'rerank';
      
      const typeDiff = (typeOrder[typeA] || 999) - (typeOrder[typeB] || 999);
      if (typeDiff !== 0) {
        return typeDiff;
      }
      
      // 同类型内按优先级排序
      return (a.priority || 1) - (b.priority || 1);
    });
  }
  
  // 获取模型类型的颜色Tag
  getModelTypeTag(type) {
    // 统一类型值
    let normalizedType = type || 'text';
    if (normalizedType === '纯文本模型') normalizedType = 'text';
    if (normalizedType === '多模态模型') normalizedType = 'multimodal';
    if (normalizedType === '向量模型') normalizedType = 'vector';
    if (normalizedType === '重排模型') normalizedType = 'rerank';
    
    const typeMap = {
      text: { label: '纯文本模型', color: 'blue' },
      multimodal: { label: '多模态模型', color: 'green' },
      vector: { label: '向量模型', color: 'purple' },
      rerank: { label: '重排模型', color: 'orange' }
    };
    
    const typeInfo = typeMap[normalizedType] || { label: type, color: 'default' };
    
    // 定义不同颜色的Tag样式
    const colorStyles = {
      blue: 'background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff;',
      green: 'background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f;',
      purple: 'background: #f9f0ff; color: #722ed1; border: 1px solid #d3adf7;',
      orange: 'background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591;',
      default: 'background: #f0f0f0; color: #666; border: 1px solid #d9d9d9;'
    };
    
    return `<span style="${colorStyles[typeInfo.color]} padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${typeInfo.label}</span>`;
  }
  
  // 按模型类型分组
  groupModelsByType(models) {
    const groups = {};
    models.forEach(model => {
      let type = model.type || 'text';
      // 统一类型值为英文，便于分组
      if (type === '纯文本模型') type = 'text';
      if (type === '多模态模型') type = 'multimodal';
      if (type === '向量模型') type = 'vector';
      if (type === '重排模型') type = 'rerank';
      
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(model);
    });
    
    // 对每个组内的模型按优先级排序
    for (const type in groups) {
      groups[type].sort((a, b) => (a.priority || 1) - (b.priority || 1));
    }
    
    return groups;
  }
  
  // 获取模型类型的中文标签
  getModelTypeLabel(type) {
    // 处理中文类型值
    if (type === '纯文本模型') return '纯文本模型';
    if (type === '多模态模型') return '多模态模型';
    if (type === '向量模型') return '向量模型';
    if (type === '重排模型') return '重排模型';
    
    // 处理英文类型值
    const typeMap = {
      text: '纯文本模型',
      multimodal: '多模态模型',
      vector: '向量模型',
      rerank: '重排模型'
    };
    return typeMap[type] || type;
  }

  // 模型管理相关方法
  activateModel(modelId) {
    const model = (window.llmModels || []).find(m => m.id === modelId);
    if (model) {
      model.status = 'active';
      model.healthStatus = 'healthy';
      alert('模型已启用');
      this.renderPage('model');
    }
  }

  deactivateModel(modelId) {
    const model = (window.llmModels || []).find(m => m.id === modelId);
    if (model) {
      model.status = 'inactive';
      model.healthStatus = 'banned';
      alert('模型已禁用');
      this.renderPage('model');
    }
  }

  editModel(modelId) {
    alert('编辑模型功能开发中');
  }

  // 连接测试方法
  async testModelConnection(modelId) {
    const model = (window.llmModels || []).find(m => m.id === modelId);
    if (model) {
      // 显示测试中状态
      model.healthStatus = 'testing';
      this.renderPage('model');
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟测试结果（70%成功率）
        if (Math.random() > 0.3) {
          model.healthStatus = 'healthy';
          model.errorMsg = '';
          model.lastErrorTime = '';
          alert(`✅ 模型 ${model.name} 连接测试成功！`);
        } else {
          model.healthStatus = 'unhealthy';
          model.errorMsg = '连接超时或API调用失败';
          model.lastErrorTime = new Date().toLocaleString('zh-CN');
          alert(`❌ 模型 ${model.name} 连接测试失败：${model.errorMsg}`);
        }
      } catch (error) {
        model.healthStatus = 'unhealthy';
        model.errorMsg = error.message || '连接测试异常';
        model.lastErrorTime = new Date().toLocaleString('zh-CN');
        alert(`❌ 模型 ${model.name} 连接测试异常：${model.errorMsg}`);
      } finally {
        this.renderPage('model');
      }
    }
  }

  // 排序方法
  sortModels(field) {
    if (window.llmModels) {
      window.llmModels.sort((a, b) => {
        if (field === 'priority') {
          return (a.priority || 1) - (b.priority || 1);
        }
        return 0;
      });
      this.renderPage('model');
    }
  }

  // 模型注册模态框
  openModelRegisterModal() {
    const mc = document.getElementById('modal-container');
    this._modelRegisterStep = 1;
    this._modelRegisterData = {};
    
    mc.innerHTML = `
      <div class="modal-overlay active" id="model-register-modal">
        <div class="modal modal-wiz-xl">
          <div class="modal-header wiz-header">
            <div>
              <h3 class="modal-title">模型注册</h3>
              <p class="wiz-subtitle">完成以下步骤注册大模型，支持高可用配置</p>
            </div>
            <button class="modal-close" onclick="app.closeModelRegisterModal()">×</button>
          </div>

          <div class="wiz-steps-bar">
            <div class="wiz-step active" data-s="1">
              <div class="ws-num">1</div>
              <div class="ws-label">基础配置</div>
            </div>
            <div class="wiz-line"></div>
            <div class="wiz-step" data-s="2">
              <div class="ws-num">2</div>
              <div class="ws-label">属性配置</div>
            </div>
          </div>

          <div class="modal-body wiz-body" id="model-register-body"></div>

          <div class="modal-footer wiz-footer">
            <button class="btn btn-default" id="model-register-prev" style="display:none" onclick="app.modelRegisterPrev()">上一步</button>
            <button class="btn btn-default" onclick="app.closeModelRegisterModal()">取消</button>
            <button class="btn btn-primary" id="model-register-next" onclick="app.modelRegisterNext()">下一步 →</button>
          </div>
        </div>
      </div>
    `;
    
    this._renderModelRegisterStep();
  }

  _renderModelRegisterStep() {
    const body = document.getElementById('model-register-body');
    switch (this._modelRegisterStep) {
      case 1:
        body.innerHTML = this._renderModelRegisterStep1();
        break;
      case 2:
        body.innerHTML = this._renderModelRegisterStep2();
        break;
    }
    this._updateModelRegisterStepsUI();
  }

  _renderModelRegisterStep1() {
    return `
      <div class="wiz-step-title">基础配置</div>
      <div class="wiz-form-grid">
        <div class="wf-group half">
          <label class="wf-label required">模型系列</label>
          <select class="form-select wf-select" id="model-series">
            <option value="">请选择</option>
            <option value="openai">OpenAI</option>
            <option value="qwen">通义千问</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        <div class="wf-group half">
          <label class="wf-label required">模型名称</label>
          <input type="text" class="form-input wf-input" id="model-name" placeholder="支持中文名称，最多64个字符">
        </div>
        <div class="wf-group half">
          <label class="wf-label required">模型类型</label>
          <select class="form-select wf-select" id="model-type">
            <option value="">请选择</option>
            <option value="text">纯文本模型</option>
            <option value="multimodal">多模态模型</option>
            <option value="vector">向量模型</option>
            <option value="rerank">重排模型</option>
          </select>
        </div>
        <div class="wf-group half">
          <label class="wf-label required">模型API地址</label>
          <input type="text" class="form-input wf-input" id="model-endpoint" placeholder="请填写完整地址，例如：http://IP:PORT/v1/chat/completions">
        </div>
        <div class="wf-group half">
          <label class="wf-label required">授权密钥</label>
          <input type="text" class="form-input wf-input" id="model-api-key" placeholder="授权密钥">
        </div>
        <div class="wf-group half">
          <label class="wf-label required">用途</label>
          <input type="text" class="form-input wf-input" id="model-purpose" placeholder="简短描述，最大50个字符">
        </div>
        <div class="wf-group full">
          <label class="wf-checkbox">
            <input type="checkbox" id="model-enabled">
            <span class="checkbox-label">启用此模型</span>
          </label>
        </div>
      </div>
    `;
  }

  _renderModelRegisterStep2() {
    const modelType = this._modelRegisterData.type || 'text';
    
    let formContent = `
      <div class="wiz-step-title">属性配置</div>
      
      <!-- 模型业务设置区块 -->
      <div class="config-section">
        <div class="section-header">
          <h4 class="section-title">模型业务设置</h4>
          <p class="section-desc">根据模型类型的差异化配置</p>
        </div>
        <div class="section-content">
          <div class="wiz-form-grid">
    `;
    
    // 根据模型类型添加不同的配置项
    if (modelType === 'text' || modelType === 'multimodal') {
      formContent += `
        <div class="wf-group half">
          <label class="wf-label required">Temperature</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-default btn-sm" onclick="document.getElementById('model-temperature').stepDown()">-</button>
            <input type="number" class="form-input wf-input" id="model-temperature" value="0.5" step="0.1" min="0" max="1" style="width: 100px;">
            <button class="btn btn-default btn-sm" onclick="document.getElementById('model-temperature').stepUp()">+</button>
          </div>
        </div>
        <div class="wf-group half">
          <label class="wf-label required">携带上下文轮数</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-default btn-sm" onclick="document.getElementById('model-context-rounds').stepDown()">-</button>
            <input type="number" class="form-input wf-input" id="model-context-rounds" value="3" min="1" style="width: 100px;">
            <button class="btn btn-default btn-sm" onclick="document.getElementById('model-context-rounds').stepUp()">+</button>
          </div>
        </div>
        <div class="wf-group full">
          <label class="wf-label required">max_tokens</label>
          <input type="range" class="form-range" id="model-max-tokens" min="0" max="20000" value="4096">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999;">
            <span>0</span>
            <span id="model-max-tokens-value">4096</span>
            <span>20000</span>
          </div>
        </div>
      `;
      
      // 多模态模型额外增加支持媒体类型
      if (modelType === 'multimodal') {
        formContent += `
        <div class="wf-group full">
          <label class="wf-label required">支持媒体类型</label>
          <div style="display: flex; gap: 20px;">
            <label class="wf-checkbox">
              <input type="checkbox" id="model-media-image" checked>
              <span class="checkbox-label">图片</span>
            </label>
            <label class="wf-checkbox">
              <input type="checkbox" id="model-media-video">
              <span class="checkbox-label">视频</span>
            </label>
            <label class="wf-checkbox">
              <input type="checkbox" id="model-media-audio">
              <span class="checkbox-label">音频</span>
            </label>
          </div>
        </div>
        `;
      }
    } else if (modelType === 'vector') {
      formContent += `
        <div class="wf-group half">
          <label class="wf-label required">向量维度</label>
          <input type="number" class="form-input wf-input" id="model-embedding-dim" value="1536" min="1">
          <small class="form-hint">Embedding Dimension</small>
        </div>
        <div class="wf-group half">
          <label class="wf-label required">模型最大支持长度</label>
          <input type="number" class="form-input wf-input" id="model-max-length" value="8192" min="1">
          <small class="form-hint">全局约束，切分策略的 Max Chunk Size 不能超过此值</small>
        </div>
      `;
    } else if (modelType === 'rerank') {
      formContent += `
        <div class="wf-group half">
          <label class="wf-label required">TopK默认值</label>
          <input type="number" class="form-input wf-input" id="model-topk" value="5" min="1">
          <small class="form-hint">默认返回切片数</small>
        </div>
        <div class="wf-group half">
          <label class="wf-label required">相似度阈值</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-default btn-sm" onclick="document.getElementById('model-similarity-threshold').stepDown(0.1)">-</button>
            <input type="number" class="form-input wf-input" id="model-similarity-threshold" value="0.7" step="0.1" min="0" max="1" style="width: 100px;">
            <button class="btn btn-default btn-sm" onclick="document.getElementById('model-similarity-threshold').stepUp(0.1)">+</button>
          </div>
          <small class="form-hint">范围 0-1</small>
        </div>
      `;
    }
    
    formContent += `
          </div>
        </div>
      </div>
      
      <!-- 调度设置区块 -->
      <div class="config-section">
        <div class="section-header">
          <h4 class="section-title">调度设置</h4>
          <p class="section-desc">所有模型类型通用的调度配置</p>
        </div>
        <div class="section-content">
          <div class="wiz-form-grid">
            <div class="wf-group half">
              <label class="wf-label required">调度优先级</label>
              <input type="number" class="form-input wf-input" id="model-priority" value="1" min="1">
              <small class="form-hint">数字越小越优先调用</small>
            </div>
            <div class="wf-group half">
              <label class="wf-label required">请求超时时间</label>
              <div style="position: relative; display: inline-block; width: 100%;">
                <input type="number" class="form-input wf-input" id="model-timeout" value="30" min="1" style="padding-right: 30px;">
                <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #999; pointer-events: none;">s</span>
              </div>
            </div>
            <div class="wf-group half">
              <label class="wf-label required">重试间隔</label>
              <div style="position: relative; display: inline-block; width: 100%;">
                <input type="number" class="form-input wf-input" id="model-retry-interval" value="5" min="1" style="padding-right: 30px;">
                <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #999; pointer-events: none;">s</span>
              </div>
              <small class="form-hint">失败后多久重试，避免瞬时并发高导致的连续失败</small>
            </div>
            <div class="wf-group full">
              <label class="wf-label required">连续失败阈值</label>
              <input type="number" class="form-input wf-input" id="model-max-retries" value="3" min="1">
              <small class="form-hint">连续失败 N 次后自动切换到备份模型</small>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return formContent;
  }

  _updateModelRegisterStepsUI() {
    document.querySelectorAll('.wiz-step').forEach(step => {
      const stepNum = parseInt(step.dataset.s);
      step.classList.toggle('active', stepNum <= this._modelRegisterStep);
      const numEl = step.querySelector('.ws-num');
      if (numEl) {
        numEl.textContent = stepNum < this._modelRegisterStep ? '✓' : stepNum;
      }
    });
    document.querySelectorAll('.wiz-line').forEach((line, index) => {
      line.classList.toggle('active', index + 1 < this._modelRegisterStep);
    });
    const prevBtn = document.getElementById('model-register-prev');
    const nextBtn = document.getElementById('model-register-next');
    if (prevBtn) {
      prevBtn.style.display = this._modelRegisterStep === 1 ? 'none' : '';
    }
    if (nextBtn) {
      nextBtn.textContent = this._modelRegisterStep === 2 ? '确认注册' : '下一步 →';
    }
  }

  modelRegisterNext() {
    if (this._modelRegisterStep === 1) {
      this._saveModelRegisterStep1();
      this._modelRegisterStep = 2;
    } else {
      this._saveModelRegisterStep2();
      this._submitModelRegister();
    }
    this._renderModelRegisterStep();
  }

  modelRegisterPrev() {
    if (this._modelRegisterStep === 2) {
      this._modelRegisterStep = 1;
      this._renderModelRegisterStep();
    }
  }

  _saveModelRegisterStep1() {
    this._modelRegisterData = {
      series: document.getElementById('model-series')?.value || '',
      name: document.getElementById('model-name')?.value || '',
      type: document.getElementById('model-type')?.value || '',
      endpoint: document.getElementById('model-endpoint')?.value || '',
      apiKey: document.getElementById('model-api-key')?.value || '',
      purpose: document.getElementById('model-purpose')?.value || '',
      enabled: document.getElementById('model-enabled')?.checked || false
    };
  }

  _saveModelRegisterStep2() {
    this._modelRegisterData.priority = parseInt(document.getElementById('model-priority')?.value || '1');
    this._modelRegisterData.timeout = parseInt(document.getElementById('model-timeout')?.value || '30');
    this._modelRegisterData.retry_interval = parseInt(document.getElementById('model-retry-interval')?.value || '5');
    this._modelRegisterData.max_retries = parseInt(document.getElementById('model-max-retries')?.value || '3');
    
    const modelType = this._modelRegisterData.type || 'text';
    
    if (modelType === 'text' || modelType === 'multimodal') {
      this._modelRegisterData.temperature = parseFloat(document.getElementById('model-temperature')?.value || '0.5');
      this._modelRegisterData.context_rounds = parseInt(document.getElementById('model-context-rounds')?.value || '3');
      this._modelRegisterData.max_tokens = parseInt(document.getElementById('model-max-tokens')?.value || '4096');
      
      if (modelType === 'multimodal') {
        this._modelRegisterData.media_types = {
          image: document.getElementById('model-media-image')?.checked || false,
          video: document.getElementById('model-media-video')?.checked || false,
          audio: document.getElementById('model-media-audio')?.checked || false
        };
      }
    } else if (modelType === 'vector') {
      this._modelRegisterData.embedding_dim = parseInt(document.getElementById('model-embedding-dim')?.value || '1536');
      this._modelRegisterData.max_length = parseInt(document.getElementById('model-max-length')?.value || '8192');
    } else if (modelType === 'rerank') {
      this._modelRegisterData.topk = parseInt(document.getElementById('model-topk')?.value || '5');
      this._modelRegisterData.similarity_threshold = parseFloat(document.getElementById('model-similarity-threshold')?.value || '0.7');
    }
  }

  _submitModelRegister() {
    // 表单验证
    if (!this._modelRegisterData.series || !this._modelRegisterData.name || !this._modelRegisterData.type || !this._modelRegisterData.endpoint) {
      alert('错误：请填写所有必填字段');
      return;
    }
    
    // 向量模型验证
    if (this._modelRegisterData.type === 'vector') {
      const embeddingDim = parseInt(this._modelRegisterData.embedding_dim);
      if (isNaN(embeddingDim) || embeddingDim <= 0) {
        alert('错误：向量维度必须为正整数');
        return;
      }
    }
    
    console.log('注册模型:', this._modelRegisterData);
    // 模拟添加到模型列表
    const newModel = {
      id: 'llm-' + Date.now(),
      ...this._modelRegisterData,
      status: this._modelRegisterData.enabled ? 'active' : 'inactive',
      healthStatus: 'healthy',
      createdBy: '当前用户',
      createdAt: new Date().toLocaleString('zh-CN')
    };
    
    if (!window.llmModels) window.llmModels = [];
    window.llmModels.push(newModel);
    
    this.closeModelRegisterModal();
    alert('✅ 模型注册成功！');
    this.renderPage('model');
  }

  closeModelRegisterModal() {
    const m = document.getElementById('model-register-modal');
    if (m) {
      m.classList.remove('active');
      setTimeout(() => m.remove(), 300);
    }
  }

  // 模型服务
  async callLLM(modelType, payload) {
    // 简单的模型调用模拟
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          success: true,
          model: '模拟模型',
          data: {
            response: '这是模型的响应内容'
          }
        });
      }, 500);
    });
  }

  toggleChunkExpand(cid, btn) {
    const el = document.getElementById(`cc-content-${cid}`);
    if(el){ el.classList.toggle('expanded'); btn.textContent=el.classList.contains('expanded')?'收起 ▴':'展开 ▾';}
  }

  editChunkText(cid) {
    const chunks = (window.chunks || {})[this.currentDoc.id];
    if(!chunks)return;
    const ch = chunks.find(c=>c.id===cid); if(!ch)return;
    const nv=prompt('编辑切片内容:',ch.content);
    if(nv!==null&&nv!==ch.content){
      ch.content=nv; ch.charCount=nv.length; ch.tokenCount=Math.ceil(nv.length/1.8);
      this.navigateTo('chunks',{kb:this.currentKB,doc:this.currentDoc});
    }
  }

  deleteChunkItem(cid) {
    if(!confirm('确定删除此切片？'))return;
    const arr=(window.chunks||{})[this.currentDoc.id]; if(!arr)return;
    const idx=arr.findIndex(c=>c.id===cid); if(idx>-1){ arr.splice(idx,1); this.navigateTo('chunks',{kb:this.currentKB,doc:this.currentDoc}); }
  }

  copyChunkText(cid) {
    const ch=((window.chunks||{})[this.currentDoc.id]||[]).find(c=>c.id===cid);
    if(ch){ navigator.clipboard.writeText(ch.content).then(()=>alert('已复制到剪贴板')); }
  }

  addNewChunk() {
    const txt=prompt('输入新切片内容:');
    if(!txt)return;
    const arr=(window.chunks||{})[this.currentDoc.id];
    if(arr){
      arr.push({id:'chunk-new-'+Date.now(),index:arr.length+1,content:txt,charCount:txt.length,tokenCount:Math.ceil(txt.length/1.8)});
      this.navigateTo('chunks',{kb:this.currentKB,doc:this.currentDoc});
    }else{ alert('当前文档无切片数据'); }
  }

  addChunkAbove(cid) {
    const arr=(window.chunks||{})[this.currentDoc.id];
    if(arr){
      const idx=arr.findIndex(c=>c.id===cid);
      if(idx>-1){
        const txt=prompt('输入新切片内容:');
        if(!txt)return;
        arr.splice(idx, 0, {id:'chunk-new-'+Date.now(),index:idx+1,content:txt,charCount:txt.length,tokenCount:Math.ceil(txt.length/1.8)});
        this.navigateTo('chunks',{kb:this.currentKB,doc:this.currentDoc});
      }
    }
  }

  addChunkBelow(cid) {
    const arr=(window.chunks||{})[this.currentDoc.id];
    if(arr){
      const idx=arr.findIndex(c=>c.id===cid);
      if(idx>-1){
        const txt=prompt('输入新切片内容:');
        if(!txt)return;
        arr.splice(idx + 1, 0, {id:'chunk-new-'+Date.now(),index:idx+2,content:txt,charCount:txt.length,tokenCount:Math.ceil(txt.length/1.8)});
        this.navigateTo('chunks',{kb:this.currentKB,doc:this.currentDoc});
      }
    }
  }

  copyRetrievalChunk(btn, cid) {
    const r=this.retrievalTestComponent?.getResults()?.find(x=>x.chunkId===cid);
    if(r){ navigator.clipboard.writeText(r.content).then(()=>{ btn.textContent='已复制';setTimeout(()=>btn.textContent='📋 复制',1500); }); }
  }
  toggleRetrievalChunk(cid, el) { el.classList.toggle('expanded'); }
  viewChunkSource(cid){ alert('跳转到原文切片位置: '+cid); }
  exportRetrievalResults(){ alert('导出召回结果为 JSON 格式'); }
  clearRetrievalHistory(){ if(this.retrievalTestComponent){ this.retrievalTestComponent.testHistory=[]; this.retrievalTestComponent.render(); this.retrievalTestComponent.bindEvents(); } }
  replayRetrieval(q){ if(this.retrievalTestComponent){ this.retrievalTestComponent.config.query=q; this.retrievalTestComponent.runTest(); } }
  
  // 应用自定义分隔符
  applyCustomDelimiter() {
    const input = document.getElementById('cc-custom-del-input');
    const hiddenInput = document.getElementById('cc-primary-del');
    const modal = document.getElementById('cc-del-modal');
    if (input && hiddenInput) {
      hiddenInput.value = input.value;
      // 触发 input 事件以更新配置
      const event = new Event('input', { bubbles: true });
      hiddenInput.dispatchEvent(event);
    }
    if (modal) modal.style.display = 'none';
  }
}

let app = null;
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',()=>{ app=new KnowledgeBaseApp(); }); }
else{ app=new KnowledgeBaseApp(); }
