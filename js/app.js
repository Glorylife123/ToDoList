// ===== 待办事项应用 =====

// ===== 多语言字典 =====
const i18n = {
    zh: {
        title: '待办事项列表',
        inputPlaceholder: '输入新任务...',
        total: '总任务',
        completed: '已完成',
        pending: '待完成',
        filterAll: '全部',
        filterPending: '待完成',
        filterCompleted: '已完成',
        delete: '删除',
        emptyAll: '还没有任务，添加一个吧！',
        emptyCompleted: '还没有已完成的任务',
        emptyPending: '太棒了！没有待完成的任务',
        ariaMarkComplete: '标记任务完成',
        ariaDeleteTask: '删除任务',
        ariaToggleLang: '切换语言'
    },
    en: {
        title: 'Todo List',
        inputPlaceholder: 'Enter new task...',
        total: 'Total',
        completed: 'Done',
        pending: 'Pending',
        filterAll: 'All',
        filterPending: 'Pending',
        filterCompleted: 'Done',
        delete: 'Delete',
        emptyAll: 'No tasks yet, add one!',
        emptyCompleted: 'No completed tasks yet',
        emptyPending: 'Great! No pending tasks',
        ariaMarkComplete: 'Mark task as complete',
        ariaDeleteTask: 'Delete task',
        ariaToggleLang: 'Toggle language'
    }
};

// 状态管理
const state = {
    tasks: [],
    currentFilter: 'all',
    lang: 'zh'
};

// DOM 元素
const elements = {
    langToggle: document.getElementById('langToggle'),
    taskInput: document.getElementById('taskInput'),
    addBtn: document.getElementById('addBtn'),
    taskList: document.getElementById('taskList'),
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// ===== 多语言管理 =====
const I18n = {
    t(key) {
        return i18n[state.lang][key] || key;
    },

    toggle() {
        state.lang = state.lang === 'zh' ? 'en' : 'zh';
        this.save();
        this.updateUI();
        UI.render();
    },

    updateUI() {
        // 更新 body 的 data-lang 属性
        document.body.dataset.lang = state.lang;

        // 更新 HTML lang 属性
        document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';

        // 更新所有带有 data-i18n 的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = this.t(key);
        });

        // 更新 placeholder
        document.querySelectorAll('[data-placeholder-i18n]').forEach(el => {
            const key = el.dataset.placeholderI18n;
            el.placeholder = this.t(key);
        });

        // 更新 aria-label
        const langToggleLabel = this.t('ariaToggleLang');
        elements.langToggle.setAttribute('aria-label', langToggleLabel);
    },

    save() {
        localStorage.setItem('todoLang', state.lang);
    },

    load() {
        const saved = localStorage.getItem('todoLang');
        if (saved && (saved === 'zh' || saved === 'en')) {
            state.lang = saved;
        }
    }
};

// ===== 数据持久化 =====
const Storage = {
    save() {
        localStorage.setItem('todoTasks', JSON.stringify(state.tasks));
    },

    load() {
        const saved = localStorage.getItem('todoTasks');
        if (saved) {
            state.tasks = JSON.parse(saved);
        }
    }
};

// ===== 任务操作 =====
const TaskActions = {
    add(text) {
        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        state.tasks.unshift(task);
        Storage.save();
        return task;
    },

    delete(id) {
        state.tasks = state.tasks.filter(task => task.id !== id);
        Storage.save();
    },

    toggle(id) {
        const task = state.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            Storage.save();
        }
    },

    getFilteredTasks() {
        switch (state.currentFilter) {
            case 'completed':
                return state.tasks.filter(t => t.completed);
            case 'pending':
                return state.tasks.filter(t => !t.completed);
            default:
                return state.tasks;
        }
    },

    getStats() {
        return {
            total: state.tasks.length,
            completed: state.tasks.filter(t => t.completed).length,
            pending: state.tasks.filter(t => !t.completed).length
        };
    }
};

// ===== UI 渲染 =====
const UI = {
    render() {
        this.renderTasks();
        this.renderStats();
        this.renderFilter();
    },

    renderTasks() {
        const tasks = TaskActions.getFilteredTasks();

        if (tasks.length === 0) {
            this.renderEmptyState();
            return;
        }

        const deleteText = I18n.t('delete');
        const ariaMarkComplete = I18n.t('ariaMarkComplete');
        const ariaDeleteTask = I18n.t('ariaDeleteTask');

        elements.taskList.innerHTML = tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="App.toggleTask(${task.id})"
                    aria-label="${ariaMarkComplete}">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="App.deleteTask(${task.id})" aria-label="${ariaDeleteTask}">
                    ${deleteText}
                </button>
            </li>
        `).join('');
    },

    renderEmptyState() {
        const messages = {
            all: 'emptyAll',
            completed: 'emptyCompleted',
            pending: 'emptyPending'
        };

        elements.taskList.innerHTML = `
            <li class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                <p>${I18n.t(messages[state.currentFilter])}</p>
            </li>
        `;
    },

    renderStats() {
        const stats = TaskActions.getStats();
        elements.totalTasks.textContent = stats.total;
        elements.completedTasks.textContent = stats.completed;
        elements.pendingTasks.textContent = stats.pending;
    },

    renderFilter() {
        elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === state.currentFilter);
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ===== 事件处理 =====
const Handlers = {
    onAddTask() {
        const text = elements.taskInput.value.trim();
        if (!text) {
            elements.taskInput.focus();
            return;
        }
        TaskActions.add(text);
        UI.render();
        elements.taskInput.value = '';
        elements.taskInput.focus();
    },

    onFilterChange(filter) {
        state.currentFilter = filter;
        UI.render();
    },

    onLangToggle() {
        I18n.toggle();
    }
};

// ===== 应用接口 =====
const App = {
    init() {
        Storage.load();
        I18n.load();
        this.bindEvents();
        I18n.updateUI();
        UI.render();
    },

    bindEvents() {
        // 语言切换
        elements.langToggle.addEventListener('click', () => Handlers.onLangToggle());

        // 添加任务
        elements.addBtn.addEventListener('click', () => Handlers.onAddTask());
        elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') Handlers.onAddTask();
        });

        // 筛选切换
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                Handlers.onFilterChange(btn.dataset.filter);
            });
        });
    },

    // 公开的方法（供HTML调用）
    addTask() {
        Handlers.onAddTask();
    },

    deleteTask(id) {
        TaskActions.delete(id);
        UI.render();
    },

    toggleTask(id) {
        TaskActions.toggle(id);
        UI.render();
    }
};

// 启动应用
App.init();
