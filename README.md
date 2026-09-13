# Barniz?

Live: <https://chrom5000.github.io/barniz/>

Ein Winter an der Schlei. Und eine Frage. Eine Scroll-Seite ohne Abhängigkeiten und ohne Build.

Lokal ansehen: `python3 -m http.server 8080` im Projektroot, dann <http://localhost:8080/>, oder `npx serve`.
Tests: `node --test` (Node ≥ 20).
Schriften neu laden (nur nötig, wenn `assets/fonts/` fehlt): `node tools/fetch-fonts.mjs`.
`tools/` enthält Entwicklungshilfen (Schriften laden, Screenshot-Seiten); sie werden mit veröffentlicht, sind aber nicht verlinkt.

Die Landschaften basieren auf Fotos von Wikimedia Commons (CC BY / CC BY-SA), als Nachtplatten bearbeitet; die Känguru-Silhouette ist aus einem Foto freigestellt. Nachweise und Lizenzen: `bildnachweis.html`. Neue Platten entstehen mit `tools/nachtplatte.html` und `tools/freistellen.html` (Headless-Chrome, siehe Kommentare in den Dateien).
