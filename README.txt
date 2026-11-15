SHOP WEBSITE WITH SVELTIA CMS
=============================

WHAT CHANGED
  You no longer edit script.js. All the shop details, categories, products
  and photos are edited in the CMS at  yoursite.com/admin
  Add a product = click "Add product", fill the form, upload the photo, Save.

FOLDER
  index.html, style.css, script.js   the website (leave alone)
  content/                           the shop data the CMS edits (JSON files)
  images/uploads/                    photos uploaded from the CMS land here
  admin/index.html                   the CMS page
  admin/config.yml                   tells the CMS what fields to show

SET UP (one time)
  1. Create a GitHub repository (example: my-shop) and upload this whole folder to it.
  2. Open admin/config.yml and change the repo line to YOUR-USERNAME/my-shop
  3. Host the repo, so the site updates every time the CMS saves:
       Netlify, Cloudflare Pages or GitHub Pages. Connect the repo and deploy.
       (Netlify Drop will not work, because the CMS saves into GitHub.)
  4. Go to yoursite.com/admin and sign in with GitHub, the same way as on your
     portfolio site (personal access token with Contents: read and write on this repo).
  5. In the CMS: fill "Shop details", check "Categories", then add products.

DAILY USE
  Add product    Shop > Products > Add product (new ones appear first)
  Sold out       tick "Sold out" on the product, the button turns grey
  New category   Shop > Categories > add one, then pick it when adding products
  Change info    Shop > Shop details (name, story, WhatsApp, links, selling points)
  After Save, the live site updates in about a minute.

PHOTO TIPS
  Square or 4:5 photos look best. Resize big phone photos to about 1200 px wide
  before uploading so the site loads fast.

PREVIEW ON YOUR COMPUTER
  Opening index.html by double-click will not load the content (browsers block it).
  Use VS Code "Live Server", or run:  python -m http.server  in this folder,
  then open http://localhost:8000

COLOURS
  Open style.css, the first lines have the colours.

IF SOMETHING BREAKS
  Admin page blank: check admin/index.html loads, and repo/branch in config.yml.
  "Category" box empty when adding a product: add categories first and Save.
  Photos not showing: check the photo was saved in images/uploads on GitHub.
