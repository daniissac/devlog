class DevLog {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('devlog-entries')) || [];
        this.setupEventListeners();
        this.renderEntries();
        this.addToolbar();
    }

    setupEventListeners() {
        document.getElementById('newEntry').addEventListener('click', () => {
            document.getElementById('editor').classList.remove('hidden');
        });

        document.getElementById('saveEntry').addEventListener('click', () => {
            this.saveEntry();
        });
    }

    saveEntry() {
        const text = document.getElementById('entryText').value;
        const tags = document.getElementById('tagInput').value
            .split(' ')
            .filter(tag => tag.startsWith('#'));

        if (!text) return;

        const entry = {
            id: Date.now(),
            text,
            tags,
            date: new Date().toISOString()
        };

        this.entries.unshift(entry);
        localStorage.setItem('devlog-entries', JSON.stringify(this.entries));
        
        this.renderEntries();
        document.getElementById('editor').classList.add('hidden');
        document.getElementById('entryText').value = '';
        document.getElementById('tagInput').value = '';
    }

    addToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        toolbar.innerHTML = `
            <button class="export-btn">Export</button>
            <button class="import-btn">Import</button>
            <input type="file" id="importFile" hidden>
        `;
        document.querySelector('header').appendChild(toolbar);

        toolbar.querySelector('.export-btn').addEventListener('click', () => this.exportEntries());
        toolbar.querySelector('.import-btn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importEntries(e));
    }

    exportEntries() {
        const dataStr = JSON.stringify(this.entries, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportName = `devlog-export-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    }

    importEntries(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedEntries = JSON.parse(e.target.result);
                this.entries = [...importedEntries, ...this.entries];
                localStorage.setItem('devlog-entries', JSON.stringify(this.entries));
                this.renderEntries();
            } catch (error) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    }

    renderEntries() {
        const entriesDiv = document.getElementById('entries');
        entriesDiv.innerHTML = this.entries.map(entry => `
            <div class="entry">
                <div class="entry-text">${this.formatText(entry.text)}</div>
                <div class="tags">
                    ${entry.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <small>${new Date(entry.date).toLocaleString()}</small>
            </div>
        `).join('');

        // Highlight all code blocks
        Prism.highlightAll();
    }

    formatText(text) {
        // Show copy button only for code blocks
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'javascript';
            return `<div class="code-snippet">
                        <pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>
                        <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${code.trim()}\`)">Copy</button>
                    </div>`;
        });

        // Inline code without copy button
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        text = text.replace(/\n/g, '<br>');
        return text;
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
// Initialize the app
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

const app = new DevLog();
