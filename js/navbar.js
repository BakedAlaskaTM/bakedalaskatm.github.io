// navbar.js
$('#nav-home').on('click', () => {
    document.dispatchEvent(new CustomEvent('showHomePage'));
});

$('#nav-stats').on('click', () => {
    document.dispatchEvent(new CustomEvent('showStatsPage'));
});