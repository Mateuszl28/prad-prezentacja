#!/bin/sh
# Składa prezentację w jeden plik index.html
cd "$(dirname "$0")"
{ cat src/head.html; echo '<script>'; cat src/core.js src/rest.js; echo '</script>'; echo '</body>'; echo '</html>'; } > index.html
