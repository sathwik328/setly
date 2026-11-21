# DEPLOYMENT GUIDE — SETLY

SETLY is a 100% client-side, local-first progressive web application. It requires zero backend databases and can be hosted on any free static hosting platform with HTTPS.

---

## 1. Hosting on GitHub Pages (Recommended — Automated)

Your repository already includes the CI/CD workflow: `.github/workflows/pages.yml`.

### Exact Step-by-Step Instructions:
1. Open your browser and go to your GitHub repository:
   **[https://github.com/sathwik328/setly](https://github.com/sathwik328/setly)**
2. Click the **Settings** tab (the gear icon on the top right of the repository).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - For **Source**, click the dropdown and choose **GitHub Actions**.
5. Once selected, every push to the `main` branch will automatically build and publish the app!
6. Your live web app URL will be:
   👉 **`https://sathwik328.github.io/setly/`**

---

## 2. Deploying to Netlify (Alternative One-Click Option)

1. Go to [https://app.netlify.com](https://app.netlify.com) and log in.
2. Click **Add new site** → **Import an existing project**.
3. Select **GitHub** and authorize access to `sathwik328/setly`.
4. Set the build settings:
   - **Base directory**: `prototype`
   - **Publish directory**: `prototype`
   - **Build command**: *(leave empty)*
5. Click **Deploy SETLY**. You will receive an immediate HTTPS link (e.g. `setly.netlify.app`).

---

## 3. Deploying to Vercel (Alternative)

1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **Add New** → **Project**.
3. Select your GitHub repository `setly`.
4. In the Root Directory section, click **Edit** and select `prototype`.
5. Click **Deploy**. Your site will be live on Vercel with instant HTTPS and global edge CDN caching.
