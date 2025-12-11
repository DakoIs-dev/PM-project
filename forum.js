const FORUM_KEY = 'jiger_forum_topics_v1';


function loadTopicsFromStorage() {
  try {
    const raw = localStorage.getItem(FORUM_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed parse forum storage', e);
    return [];
  }
}

function saveTopicsToStorage(list) {
  localStorage.setItem(FORUM_KEY, JSON.stringify(list));
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

(function seedIfEmpty(){
  const list = loadTopicsFromStorage();
  if (list.length === 0) {
    const now = Date.now();
    const seed = [
      {
        id: generateId(),
        title: 'Как начать тренироваться с нуля?',
        category: 'Тренировки',
        body: 'Поделитесь советами: с чего начинать и как не навредить себе?',
        createdAt: now - 1000 * 60 * 60 * 24 * 7,
        replies: [
          { id: generateId(), author: 'coach', text: 'Начните с лёгкой разминки и 3 занятий в неделю по 20 минут.', createdAt: now - 1000 * 60 * 60 * 24 * 6 },
          { id: generateId(), author: 'ivan', text: 'Берите базовые упражнения: присед, планка, отжимания.', createdAt: now - 1000 * 60 * 60 * 24 * 5 }
        ]
      },
      {
        id: generateId(),
        title: 'Помогите составить питание',
        category: 'Питание',
        body: 'Хочу похудеть на 5 кг, нет времени готовить сложные блюда. Что посоветуете?',
        createdAt: now - 1000 * 60 * 60 * 24 * 4,
        replies: [
          { id: generateId(), author: 'diana', text: 'Упрощайте: контролируйте порции и добавьте белок к каждому приёму пищи.', createdAt: now - 1000 * 60 * 60 * 24 * 3 }
        ]
      },
      {
        id: generateId(),
        title: 'Как не потерять мотивацию?',
        category: 'Мотивация',
        body: 'Через 2 недели силы пропадают — как удержать привычку?',
        createdAt: now - 1000 * 60 * 60 * 24 * 2,
        replies: []
      }
    ];
    saveTopicsToStorage(seed);
  }
})();


function forumCreateTopic({ title, category = 'Общие', body }) {
  const list = loadTopicsFromStorage();
  const id = generateId();
  const topic = {
    id,
    title,
    category,
    body,
    createdAt: Date.now(),
    replies: []
  };
  list.unshift(topic); 
  saveTopicsToStorage(list);
  return id;
}

function forumAddReply(topicId, { author = 'Гость', text }) {
  const list = loadTopicsFromStorage();
  const topic = list.find(t => String(t.id) === String(topicId));
  if (!topic) return false;
  const reply = { id: generateId(), author, text, createdAt: Date.now() };
  topic.replies.push(reply);
  saveTopicsToStorage(list);
  return true;
}

function forumDeleteTopic(topicId) {
  let list = loadTopicsFromStorage();
  list = list.filter(t => String(t.id) !== String(topicId));
  saveTopicsToStorage(list);
}

function forumGetTopic(topicId) {
  const list = loadTopicsFromStorage();
  return list.find(t => String(t.id) === String(topicId)) || null;
}

function renderForumList({ search = '', sort = 'recent' } = {}) {
  const container = document.getElementById('forum-list');
  if (!container) return;
  let list = loadTopicsFromStorage();

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(t => (t.title + ' ' + t.body + ' ' + t.category).toLowerCase().includes(q));
  }

  if (sort === 'popular') {
    list.sort((a,b) => (b.replies?.length || 0) - (a.replies?.length || 0));
  } else { 
    list.sort((a,b) => b.createdAt - a.createdAt);
  }

  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p style="color:#666">Тем пока нет. Будь первым — <strong>Создать тему</strong>.</p>';
    return;
  }

  list.forEach(t => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image" style="height:220px;background:#eee;display:flex;align-items:center;justify-content:center;">
        <img src="images/jigerlogo.png" alt="topic" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(t.title)}</h3>
        <p class="product-new">${escapeHtml(t.category)} • ${t.replies.length} ответ(ов)</p>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="cta-button" onclick="location.href='forum-thread.html?id=${t.id}'">Читать →</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function onQuickReplyPrompt(id) {
  const author = prompt('Ваше имя (оставьте пустым для "Гость")') || 'Гость';
  const text = prompt('Текст ответа:');
  if (!text || !text.trim()) return;
  forumAddReply(id, { author, text: text.trim() });
  
  renderForumList({ search: document.getElementById('searchTopic')?.value || '' , sort: document.getElementById('sortBy')?.value || 'recent' });
  alert('Ответ добавлен.');
}

function renderThread(topicId) {
  const container = document.getElementById('thread-container');
  if (!container) return;
  const topic = forumGetTopic(topicId);
  if (!topic) {
    container.innerHTML = `<div class="product-card"><p>Тема не найдена.</p><p><a href="forum.html" class="cta-button">← К списку тем</a></p></div>`;
    return;
  }

  const dateStr = new Date(topic.createdAt).toLocaleString();
  let html = `
    <div class="product-card" style="padding:20px;">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <h2 style="margin-bottom:6px;">${escapeHtml(topic.title)}</h2>
          <div style="color:#666;margin-bottom:12px;">Категория: ${escapeHtml(topic.category)} • создано: ${dateStr}</div>
          <p style="margin-bottom:12px;">${nl2p(escapeHtml(topic.body))}</p>
        </div>
        <div style="min-width:200px;text-align:right;">
          <button class="cta-button" onclick="onDeleteTopicConfirm(${topic.id})">Удалить тему</button>
        </div>
      </div>
    </div>

    <div style="margin-top:20px;">
      <h3>Ответы (${topic.replies.length})</h3>
  `;

  if (topic.replies.length === 0) {
    html += `<p style="color:#666">Пока нет ответов — будь первым!</p>`;
  } else {
    html += `<div style="display:flex;flex-direction:column;gap:14px;margin-top:12px;">`;
    topic.replies.forEach(r => {
      const rdate = new Date(r.createdAt).toLocaleString();
      html += `
        <div class="product-card" style="padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
            <div>
              <strong>${escapeHtml(r.author)}</strong>
              <div style="color:#666;font-size:0.9rem;margin-bottom:8px;">${rdate}</div>
              <div>${nl2p(escapeHtml(r.text))}</div>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;

  html += `
    <div style="margin-top:24px;" class="product-card">
      <h3>Оставить ответ</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <input id="replyAuthor" placeholder="Ваше имя (по желанию)" style="padding:10px;border:1px solid var(--border-color);border-radius:6px;">
        <textarea id="replyText" rows="4" placeholder="Текст ответа" style="padding:10px;border:1px solid var(--border-color);border-radius:6px;"></textarea>
        <div style="display:flex;gap:8px;">
          <button class="cta-button" onclick="forumReplyFromForm(${topic.id})">Отправить</button>
          <button class="cta-button" onclick="location.href='forum.html'">К списку тем</button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function onPostReplyPrompt(topicId) {
  const author = prompt('Ваше имя (оставьте пустым для "Гость")') || 'Гость';
  const text = prompt('Текст ответа:');
  if (!text || !text.trim()) return;
  forumAddReply(topicId, { author, text: text.trim() });
  renderThread(topicId);
}

function forumReplyFromForm(topicId) {
  const author = document.getElementById('replyAuthor').value.trim() || 'Гость';
  const text = document.getElementById('replyText').value.trim();
  if (!text) { alert('Введите текст ответа.'); return; }
  forumAddReply(topicId, { author, text });
 
  document.getElementById('replyText').value = '';
  document.getElementById('replyAuthor').value = '';
  renderThread(topicId);
}

function onDeleteTopicConfirm(id) {
  if (!confirm('Удалить тему? Это действие необратимо.')) return;
  forumDeleteTopic(id);
  location.href = 'forum.html';
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}
function nl2p(str) {

  return str.split(/\n\s*\n/).map(s => '<p>' + s.replace(/\n/g,'<br>') + '</p>').join('');
}

document.addEventListener('DOMContentLoaded', () => {
  
  if (document.getElementById('forum-list')) {
    const searchInput = document.getElementById('searchTopic');
    const sortSelect = document.getElementById('sortBy');
    renderForumList({ search: '', sort: sortSelect?.value || 'recent' });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderForumList({ search: searchInput.value, sort: sortSelect.value });
      });
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        renderForumList({ search: searchInput.value, sort: sortSelect.value });
      });
    }
  }

  if (document.getElementById('thread-container')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      document.getElementById('thread-container').innerHTML = '<p>id темы не указан.</p>';
    } else {
      renderThread(id);
    }
  }
});
