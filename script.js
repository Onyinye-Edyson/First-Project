document.addEventListener('DOMContentLoaded', () => {
    // State
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // DOM Elements
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');

    // Initialize App
    function init() {
        renderTodos();
        updateStats();
        setupEventListeners();
    }

    // Save to Local Storage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        updateStats();
    }

    // Event Listeners
    function setupEventListeners() {
        // Add Todo
        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = todoInput.value.trim();
            if (text) {
                addTodo(text);
                todoInput.value = '';
            }
        });

        // Filter functionality
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active class
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update filter and render
                currentFilter = btn.dataset.filter;
                renderTodos();
            });
        });

        // Clear completed
        clearCompletedBtn.addEventListener('click', () => {
            const completedTodos = todos.filter(t => t.completed);
            if (completedTodos.length === 0) return;
            
            // Find elements to animate out
            const items = todoList.querySelectorAll('.todo-item.completed');
            items.forEach(item => item.classList.add('removing'));
            
            setTimeout(() => {
                todos = todos.filter(t => !t.completed);
                saveTodos();
                renderTodos();
            }, 300);
        });
    }

    function addTodo(text) {
        const newTodo = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        todos.unshift(newTodo);
        saveTodos();
        
        // If filtering by completed, switch to all to see the new item
        if (currentFilter === 'completed') {
            document.querySelector('[data-filter="all"]').click();
        } else {
            renderTodos();
        }
    }

    function toggleTodo(id) {
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos();
        renderTodos();
    }

    function deleteTodo(id, element) {
        element.classList.add('removing');
        
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }, 300);
    }

    // Render logic
    function getFilteredTodos() {
        switch (currentFilter) {
            case 'active': return todos.filter(t => !t.completed);
            case 'completed': return todos.filter(t => t.completed);
            default: return todos;
        }
    }

    function renderTodos() {
        const filteredTodos = getFilteredTodos();
        todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            renderEmptyState();
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            
            li.innerHTML = `
                <div class="todo-content">
                    <div class="checkbox ${todo.completed ? 'checked' : ''}">
                        <i data-lucide="check"></i>
                    </div>
                    <span class="todo-text">${escapeHTML(todo.text)}</span>
                </div>
                <button class="delete-btn" aria-label="Delete task">
                    <i data-lucide="trash-2"></i>
                </button>
            `;

            // Event listener for toggle (clicking anywhere on content)
            const content = li.querySelector('.todo-content');
            content.addEventListener('click', () => toggleTodo(todo.id));

            // Event listener for delete
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTodo(todo.id, li);
            });

            todoList.appendChild(li);
        });

        // Re-initialize Lucide icons for new elements
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function renderEmptyState() {
        let message = "No tasks found";
        let icon = "inbox";
        
        if (todos.length === 0) {
            message = "You're all caught up!";
            icon = "check-circle-2";
        } else if (currentFilter === 'active') {
            message = "No active tasks";
            icon = "moon";
        } else if (currentFilter === 'completed') {
            message = "No completed tasks yet";
            icon = "target";
        }

        todoList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="${icon}"></i>
                <p>${message}</p>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function updateStats() {
        const activeCount = todos.filter(t => !t.completed).length;
        itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
        
        // Show/hide clear completed button
        const hasCompleted = todos.some(t => t.completed);
        clearCompletedBtn.style.opacity = hasCompleted ? '1' : '0';
        clearCompletedBtn.style.pointerEvents = hasCompleted ? 'auto' : 'none';
        clearCompletedBtn.style.transition = 'opacity 0.2s ease';
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Start App
    init();
});
