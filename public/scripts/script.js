document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.querySelector('#gridContainer');
  const sentinel = document.querySelector('#scrollSentinel');
  let page = 0;
  const limit = 20;
  let isLoading = false;

  const fetchData = (page) => {
    isLoading = true;
    return new Promise((resolve, reject) => {
      fetch(`/api/data?page=${page}&limit=${limit}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          renderItems(data);
          isLoading = false;
          if (data.length < limit) {
            // Geen data meer om te laden
            observer.unobserve(sentinel);
          }
          resolve();
        })
        .catch(error => {
          console.error('Fout bij ophalen van data:', error);
          isLoading = false;
          reject(error);
        });
    });
  };

  const renderItems = (items) => {
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'grid__item';
      div.innerHTML = `<img loading="lazy" src="https://fdnd-agency.directus.app/assets/${item.image}" alt="${item.title}" class="lazyload" tabindex="0">`;
      gridContainer.appendChild(div);
    });
  };

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !isLoading) {
      page += 1;
      fetchData(page);
    }
  }, {
    root: null,
    rootMargin: '0px 0px 100px 0px',
    threshold: 0.1
  });

  observer.observe(sentinel);

  fetchData(page)
    .then(() => {
      const loadMoreForm = document.querySelector('#loadmore');
      if (loadMoreForm) {
        loadMoreForm.classList.add('hidden');
      }
    })
    .catch(error => {
      console.error('Fout bij initiële data ophaling:', error);
    });
});