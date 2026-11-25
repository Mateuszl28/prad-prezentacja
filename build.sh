#!/bin/sh
# Składa prezentację w jeden plik index.html
cd "$(dirname "$0")"
{ cat src/head.html; echo '<script>'; cat src/core.js src/rest.js; echo '</script>'; echo '<script>window.FIZYKA_DECK='prad';</script><script type="module" src="https://mateuszl28.github.io/fizyka/konto.js?v=3"></script>'; echo '</body>'; echo '</html>'; } > index.html
