(function () {
  const SMC_FAV_KEY = 'smc_favorites';

  function normalizeFavUrl(url) {
    return String(url || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '');
  }

  function smcGetFavorites() {
    try {
      const raw = localStorage.getItem(SMC_FAV_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function smcSaveFavorites(favorites) {
    localStorage.setItem(SMC_FAV_KEY, JSON.stringify(favorites));
  }

  function smcRemoveFavoriteByUrl(url) {
    const target = normalizeFavUrl(url);
    const nextFavorites = smcGetFavorites().filter((item) => normalizeFavUrl(item && item.url) !== target);
    smcSaveFavorites(nextFavorites);

    if (typeof window.renderFavDropdown === 'function') {
      window.renderFavDropdown();
    }

    if (typeof window.renderFavModal === 'function') {
      const overlay = document.getElementById('favOverlay');
      if (overlay && overlay.classList.contains('open')) {
        window.renderFavModal();
      }
    }

    if (document.querySelectorAll) {
      document.querySelectorAll('.fav-btn').forEach((button) => {
        const btnUrl = normalizeFavUrl(button.dataset.url || button.getAttribute('data-url'));
        const isMatch = btnUrl === target;
        if (isMatch) {
          button.classList.remove('active');
          button.setAttribute('aria-label', 'Add to favorites');
        }
      });
    }
  }

  function smcToggleFavorite(button) {
    if (!button) return false;

    const name = button.dataset.name || button.getAttribute('data-name') || 'Calculator';
    const url = normalizeFavUrl(button.dataset.url || button.getAttribute('data-url'));
    const category = button.dataset.category || button.getAttribute('data-category') || '';
    const color = button.dataset.color || button.getAttribute('data-color') || 'var(--primary)';

    const favorites = smcGetFavorites();
    const exists = favorites.some((item) => normalizeFavUrl(item && item.url) === url);

    const nextFavorites = exists
      ? favorites.filter((item) => normalizeFavUrl(item && item.url) !== url)
      : [...favorites, { name, url, category, color }];

    smcSaveFavorites(nextFavorites);

    const isNowFavorite = nextFavorites.some((item) => normalizeFavUrl(item && item.url) === url);
    button.classList.toggle('active', isNowFavorite);
    button.setAttribute('aria-label', isNowFavorite ? 'Remove from favorites' : 'Add to favorites');

    if (typeof window.renderFavDropdown === 'function') {
      window.renderFavDropdown();
    }

    if (typeof window.renderFavModal === 'function') {
      const overlay = document.getElementById('favOverlay');
      if (overlay && overlay.classList.contains('open')) {
        window.renderFavModal();
      }
    }

    return isNowFavorite;
  }

  function initFavoriteButtons() {
    const buttons = document.querySelectorAll('.fav-btn');

    buttons.forEach((button) => {
      const url = normalizeFavUrl(button.dataset.url || button.getAttribute('data-url'));
      const isFavorite = smcGetFavorites().some((item) => normalizeFavUrl(item && item.url) === url);

      button.classList.toggle('active', isFavorite);
      button.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');

      button.removeEventListener('click', button.__smcFavoriteClickHandler);
      button.__smcFavoriteClickHandler = function (event) {
        event.preventDefault();
        event.stopPropagation();
        smcToggleFavorite(button);
      };
      button.addEventListener('click', button.__smcFavoriteClickHandler);
    });
  }

  window.smcGetFavorites = smcGetFavorites;
  window.smcSaveFavorites = smcSaveFavorites;
  window.smcRemoveFavoriteByUrl = smcRemoveFavoriteByUrl;
  window.smcToggleFavorite = smcToggleFavorite;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFavoriteButtons);
  } else {
    initFavoriteButtons();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      normalizeFavUrl,
      smcGetFavorites,
      smcSaveFavorites,
      smcRemoveFavoriteByUrl,
      smcToggleFavorite,
      initFavoriteButtons
    };
  }
})();
