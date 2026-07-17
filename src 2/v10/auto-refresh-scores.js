// ══════════════════════════════════════════════════════════════════════
// QualifGaïndé Worldwide — Auto-Refresh Scores V11.5.13
// ──────────────────────────────────────────────────────────────────────
// OBJECTIF : mécanique "sans intervention". Dès qu'un résultat est ajouté
// dans live.json ou data/knockout-locks.json, il s'affiche automatiquement
// dans le tableau de simulation SANS déploiement et SANS recharger la page.
//
// POURQUOI CE PATCH EXISTE :
// - loadFallbackScoresOnce() ne lit live.json qu'UNE fois (flag fallbackLoaded)
//   → on rappelle applyScoresData sur live.json en continu.
// - loadR32LocksFileOnce() lit knockout-locks.json en no-store mais n'est
//   appelé qu'une fois au démarrage → on le rappelle en continu.
//
// Le fichier ne modifie AUCUNE fonction existante : il réutilise les
// fonctions globales déjà exposées par l'app (applyScoresData,
// loadR32LocksFileOnce, recalculateAll, renderRound32Grid, etc.).
// ══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var REFRESH_MS = 60000; // 60s — même rythme que le poll existant
  var LIVE_URL = '/live.json';
  var started = false;

  function cacheBust(url) {
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + '_ar=' + Date.now();
  }

  // Recharge live.json et réapplique via la fonction native applyScoresData.
  function refreshLiveJson() {
    if (typeof applyScoresData !== 'function') return Promise.resolve(false);
    return fetch(cacheBust(LIVE_URL), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.matches) return false;
        // 'live-json' = même source que le chargement natif → priorité correcte,
        // ne casse jamais un score API plus frais (la fonction native arbitre).
        var changed = applyScoresData(data, 'live-json');
        return changed;
      })
      .catch(function () { return false; });
  }

  // Rappelle le chargeur natif de knockout-locks.json (toujours no-store).
  function refreshKnockoutLocks() {
    if (typeof loadR32LocksFileOnce !== 'function') return Promise.resolve(false);
    try {
      var res = loadR32LocksFileOnce();
      return (res && typeof res.then === 'function') ? res : Promise.resolve(!!res);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  // Après un refresh, redessine le tableau + recalcule le bracket.
  function repaint(changedLive, changedLocks) {
    if (!changedLive && !changedLocks) return;
    try { if (typeof recalculateAll === 'function') recalculateAll(); } catch (e) {}
    try { if (typeof renderRound32Grid === 'function') renderRound32Grid(); } catch (e) {}
    try { if (typeof renderKnockoutTree === 'function') renderKnockoutTree(); } catch (e) {}
    try { if (typeof renderTopLiveMatches === 'function') renderTopLiveMatches(); } catch (e) {}
    try { if (typeof updateMatchCards === 'function') updateMatchCards(); } catch (e) {}
    try { if (typeof buildTicker === 'function') buildTicker(); } catch (e) {}
  }

  function tick() {
    Promise.all([refreshLiveJson(), refreshKnockoutLocks()])
      .then(function (results) {
        repaint(results[0], results[1]);
      })
      .catch(function () {});
  }

  function start() {
    if (started) return;
    started = true;
    // Premier passage rapide (2s après le boot pour laisser l'app s'initialiser),
    // puis rythme régulier.
    setTimeout(tick, 2000);
    setInterval(tick, REFRESH_MS);
    // Refresh immédiat quand l'onglet redevient visible (retour d'arrière-plan).
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') tick();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Exposition pour debug manuel : window.QG_AUTO_REFRESH.tick()
  window.QG_AUTO_REFRESH = { tick: tick, refreshLiveJson: refreshLiveJson, refreshKnockoutLocks: refreshKnockoutLocks };
})();
