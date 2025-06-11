const searchInput = document.querySelector('.text-here');
const autocompleteList = document.querySelector('.list');
const base = document.querySelector('.base');

let debounceTimer;
let addedRepos = new Map();

function debounce(func, delay) {
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

async function fetchRepos(query) {
  if (!query) {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
    return;
  }

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status}`);
    }
    const data = await response.json();

    showAutocomplete(data.items || []);
  } catch (err) {
    console.error(err);
    autocompleteList.innerHTML = '<div style="padding: 8px;">Ошибка при загрузке данных</div>';
    autocompleteList.style.display = 'block';
  }
}

function showAutocomplete(repos) {
  if (repos.length === 0) {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
    return;
  }


  repos.forEach(repo => {
    const div = document.createElement('div');
    div.textContent = repo.full_name;
    div.style.padding = '8px';
    div.style.cursor = 'pointer';

    div.addEventListener('mouseenter', () => {
      div.style.backgroundColor = '#f0f0f0';
    });
    div.addEventListener('mouseleave', () => {
      div.style.backgroundColor = '';
    });

    div.addEventListener('click', () => {
      addRepo(repo);
      autocompleteList.innerHTML = '';
      autocompleteList.style.display = 'none';
      searchInput.value = '';
    });

    autocompleteList.appendChild(div);
  });

  autocompleteList.style.display = 'block';
}

function addRepo(repo) {
  if (addedRepos.has(repo.id)) {
    return;
  }

  addedRepos.set(repo.id, repo);


  const repoItem = document.createElement('div');
  repoItem.className = 'repo-item';
  
  

  const repoInfo = document.createElement('div');
  repoInfo.innerHTML = `
    <strong>${repo.full_name}</strong><br>
    Владелец: ${repo.owner.login}<br>
    Звезды: ${repo.stargazers_count}
  `;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Удалить';
  removeBtn.style.background = '#ff4d4f';
  removeBtn.style.color = 'white';
  removeBtn.style.border = 'none';
  removeBtn.style.padding = '5px 10px';
  removeBtn.style.borderRadius = '3px';
  removeBtn.style.cursor = 'pointer';

  removeBtn.addEventListener('click', () => {
    repoList.removeChild(repoItem);
    addedRepos.delete(repo.id);
  });

  repoItem.appendChild(repoInfo);
  repoItem.appendChild(removeBtn);


  let repoList = base.querySelector('.repo-list');
  if (!repoList) {
    repoList = document.createElement('div');
    repoList.className = 'repo-list';
    repoList.style.width = '70%';
    repoList.style.margin = '20px auto 0';
    repoList.style.overflowY = 'scroll';
    repoList.style.marginBottom = '50px';
    repoList.style.marginTop = '0px';
    base.appendChild(repoList);
  }

  repoList.appendChild(repoItem);
}

const debouncedFetch = debounce(() => {
  const query = searchInput.value.trim();
  if (query === '') {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
    return;
  }
  fetchRepos(query);
}, 500);

searchInput.addEventListener('input', debouncedFetch);


document.addEventListener('click', (e) => {
  if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
  }
});