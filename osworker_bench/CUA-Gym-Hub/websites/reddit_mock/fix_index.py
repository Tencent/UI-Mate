
import os

content = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reddit Clone</title>
  </head>
  <body class="bg-[#DAE0E6]">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>"""

with open("index.html", "w") as f:
    f.write(content)

print("index.html fixed successfully")
