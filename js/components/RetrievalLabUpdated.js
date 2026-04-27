// Updated _renderTestSetDrawer method
  _renderTestSetDrawer(set, index) {
    if (!set) return '';
    return `
      <div class="test-set-drawer">
        <div class="test-set-drawer-content">
          <div class="test-set-drawer-header">
            <h3 class="test-set-drawer-title">${set.name}</h3>
            <div class="test-set-drawer-header-actions">
              <button class="btn btn-primary btn-sm" onclick="app.retrievalLabComponent.showAddTestCaseModal(${index})">&plus; 新增用例</button>
              <button class="btn btn-default btn-sm" onclick="app.retrievalLabComponent.runAllTestCases(${index})">批量运行全部</button>
              <button class="test-set-drawer-close" onclick="app.retrievalLabComponent.closeTestSetDrawer()">&times;</button>
            </div>
          </div>
          <div class="test-set-drawer-body">
            <div class="test-set-info">
              <div class="test-set-meta">${set.items?.length || 0} 条测试用例</div>
            </div>
            ${set.items?.length > 0 ? `
              <div class="test-set-progress" id="test-set-progress-${index}" style="display: none;">
                <div class="progress-bar-container">
                  <div class="progress-bar" id="progress-bar-${index}" style="width: 0%"></div>
                </div>
                <div class="progress-text" id="progress-text-${index}">正在执行 0/${set.items.length}...</div>
              </div>
            ` : ''}
            <div class="test-set-cases">
              ${set.items?.length > 0 ? `
                <div class="test-set-bulk-actions">
                  <div class="test-set-bulk-select">
                    <input type="checkbox" id="select-all-${index}" onclick="app.retrievalLabComponent.toggleSelectAll(${index}, this.checked)">
                    <label for="select-all-${index}">全选</label>
                  </div>
                  <div class="test-set-bulk-buttons">
                    <button class="btn btn-default btn-sm" id="batch-delete-${index}" disabled onclick="app.retrievalLabComponent.batchDelete(${index})">批量删除</button>
                    <button class="btn btn-default btn-sm" id="batch-run-${index}" disabled onclick="app.retrievalLabComponent.runSelectedTestCases(${index})">运行选中项</button>
                    <button class="btn btn-default btn-sm" id="batch-export-${index}" disabled onclick="app.retrievalLabComponent.batchExport(${index})">批量导出</button>
                  </div>
                </div>
                ${set.items.map((item, i) => `
                  <div class="test-set-case ${item.status === 'failed' ? 'test-case-failed' : ''}" id="test-case-${index}-${i}">
                    <div class="test-set-case-header">
                      <div class="test-set-case-select">
                        <input type="checkbox" class="test-case-checkbox" data-set="${index}" data-item="${i}" onchange="app.retrievalLabComponent.updateBulkButtons(${index})">
                      </div>
                      <span class="test-set-case-index">用例 ${i + 1}</span>
                      <div class="test-set-case-actions">
                        <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.editTestCase(${index}, ${i})">
                          ✏️ 编辑
                        </button>
                        <button class="btn btn-text btn-sm" onclick="app.retrievalLabComponent.removeTestCase(${index}, ${i})">
                          🗑️ 移除
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="app.retrievalLabComponent.fillQueryFromTestSet(${index}, ${i})">
                          作为 Query 填入
                        </button>
                      </div>
                    </div>
                    <div class="test-set-case-content">
                      <div class="test-set-case-query">
                        <span class="test-set-case-label">Query:</span>
                        <span class="test-set-case-text">${item.query}</span>
                      </div>
                      ${item.expected ? `
                        <div class="test-set-case-expected">
                          <span class="test-set-case-label">期望答复:</span>
                          <span class="test-set-case-text">${item.expected}</span>
                        </div>
                      ` : ''}
                      ${item.results ? `
                        <div class="test-set-case-results">
                          <span class="test-set-case-label">实际结果:</span>
                          <div class="test-set-case-result-list">
                            ${item.results.slice(0, 2).map((result, ri) => `
                              <div class="test-set-case-result-item">
                                <span class="result-score">${(result.score * 100).toFixed(0)}%</span>
                                <span class="result-content">${result.content.substring(0, 100)}...</span>
                              </div>
                            `).join('')}
                          </div>
                          ${item.semanticScore !== undefined ? `
                            <div class="test-set-case-semantic-score">
                              <span class="test-set-case-label">语义相似度:</span>
                              <span class="semantic-score ${item.semanticScore >= 0.6 ? 'score-good' : 'score-bad'}">${(item.semanticScore * 100).toFixed(0)}%</span>
                            </div>
                          ` : ''}
                        </div>
                      ` : ''}
                      ${item.status === 'running' ? `
                        <div class="test-set-case-loading">
                          <div class="loading-spinner"></div>
                          <span>运行中...</span>
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
                  <button class="btn btn-primary" onclick="app.retrievalLabComponent.showAddTestCaseModal(${index})")">
                    立即添加测试用例
                  </button>
                </div>
              `}
            </div>
          </div>
          <div class="test-set-drawer-footer">
            <button class="btn btn-default" onclick="app.retrievalLabComponent.closeTestSetDrawer()">取消</button>
            <button class="btn btn-primary" onclick="app.retrievalLabComponent.runTestSetInCurrentMode(${index})">
              在当前${this.mode === 'single' ? '单点' : '对比'}模式下运行全集
            </button>
          </div>
        </div>
      </div>
    `;
  }
