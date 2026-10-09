# Front-end Build Tooling: Webpack, ESLint, npm (and Vite)

> Group 2 · Priority MEDIUM · Prep guide Q11 · Status: new file

## Say it in 30 seconds
"Webpack builds a dependency graph from an entry point. Loaders transform files (TS, Sass, images) and plugins work on the whole bundle (HTML, CSS extraction, minification). I keep bundles small with route-level code splitting via dynamic `import()`, tree shaking of ES modules, content-hashed filenames for long-term caching, and a bundle analyzer to find heavy dependencies. Cutting first-load JS was part of the ~40% speed-up on OneHome. ESLint plus Prettier and TypeScript run in pre-commit and in the Jenkins pipeline, so style and bug-prone patterns never reach review. Vite is the modern default for new apps, but the concepts are the same."

---

## 1. Webpack core concepts

| Concept | What it is |
|---|---|
| **Entry** | Where the graph starts (`src/index.tsx`) |
| **Output** | Where bundles go, filename patterns (`[name].[contenthash].js`) |
| **Loaders** | Per-file transforms: `babel-loader`/`ts-loader`/`swc-loader`, `css-loader`, `sass-loader`, `style-loader`/`MiniCssExtractPlugin.loader`. Asset modules (`type: 'asset'`) replace file-loader/url-loader in Webpack 5 |
| **Plugins** | Whole-compilation hooks: `HtmlWebpackPlugin`, `MiniCssExtractPlugin`, `DefinePlugin`, `ModuleFederationPlugin`, bundle analyzer |
| **Mode** | `development` (fast, readable, source maps) vs `production` (minify with Terser, tree shaking, scope hoisting) |
| **Dev server** | HMR (hot module replacement), proxying `/api` to the Spring backend |

```js
// webpack.config.js (simplified)
module.exports = (env, argv) => ({
  entry: './src/index.tsx',
  output: { path: path.resolve(__dirname, 'dist'), filename: '[name].[contenthash].js', clean: true },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'swc-loader', exclude: /node_modules/ },
      { test: /\.module\.scss$/, use: [MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { modules: true } }, 'sass-loader'] },
      { test: /\.(png|jpe?g|svg|webp|avif)$/, type: 'asset' },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' }), new MiniCssExtractPlugin()],
  optimization: { splitChunks: { chunks: 'all' }, runtimeChunk: 'single' },
  devtool: argv.mode === 'production' ? 'source-map' : 'eval-cheap-module-source-map',
  devServer: { proxy: [{ context: ['/api'], target: 'http://localhost:8080' }], historyApiFallback: true },
});
```
- Loaders in `use` arrays run **right to left** (sass → css → extract).

### Keeping bundles small
- **Code splitting**: `React.lazy(() => import('./ListingDetails'))` + `<Suspense>`, per route. `splitChunks` separates vendor code.
- **Tree shaking**: needs **ES modules** (`import`/`export`, not CommonJS), production mode, and `"sideEffects": false` (or a list) in `package.json`. Import specific functions (`import debounce from 'lodash-es/debounce'`) rather than whole libraries.
- **Analyse**: `webpack-bundle-analyzer`, `source-map-explorer`. Look for moment.js locales, duplicate React copies, giant icon packs, polyfills you don't need.
- **Caching**: `[contenthash]` filenames + `Cache-Control: max-age=31536000, immutable` on assets, and `no-cache` on `index.html`. CloudFront serves the assets.
- **Modern targets**: Browserslist (`> 0.5%, not dead`) avoids shipping unnecessary transpilation and polyfills.
- **Performance budgets**: `performance.maxEntrypointSize`, or size-limit in CI.

### Module Federation (micro-frontends)
Webpack 5 `ModuleFederationPlugin` lets separately deployed apps share components at runtime (`remotes`/`exposes`/`shared` singletons like React). Trade-offs: version coupling and runtime failures.

### Webpack vs Vite (and others)
- **Vite**: dev server serves native ESM, with esbuild for dependency pre-bundling, so startup and HMR are near instant. The production build uses Rollup (and Vite is moving to Rolldown, a Rust Rollup-compatible bundler). It's the default for new React apps, since Create React App was deprecated in Feb 2025.
- **Webpack**: mature and extremely configurable, huge in existing enterprise apps. Rspack is a Rust Webpack-compatible alternative.
- **Transpilers**: Babel (most flexible), SWC and esbuild (Rust/Go, much faster). TS type-checking runs separately (`tsc --noEmit`) because these only strip types.

---

## 2. ESLint, Prettier and code-quality tooling

```js
// eslint.config.js: flat config (default since ESLint 9; legacy .eslintrc is deprecated and slated for removal)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  { plugins: { 'react-hooks': reactHooks },
    rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' } },
  { ignores: ['dist/**'] },
);
```
- **ESLint** = correctness and bug-prone patterns (unused vars, hooks rules, a11y, no-floating-promises with type-aware rules). **Prettier** = formatting only. Use `eslint-config-prettier` so they don't fight.
- Run them in **pre-commit** (husky + lint-staged), **CI** (lint, `tsc --noEmit`, tests and coverage as a Jenkins stage), and the **editor**.
- Biome is an emerging all-in-one Rust linter and formatter.

## 3. npm essentials
- `package.json`: `dependencies` vs `devDependencies` vs `peerDependencies` (libraries declare React as a peer).
- **Semver**: `^1.4.2` allows minor and patch updates, `~1.4.2` allows patch only. A major version means breaking changes.
- **Lockfile** (`package-lock.json`) pins exact versions. Commit it. **`npm ci`** in CI does a clean, reproducible install from the lockfile and fails if `package.json` and the lockfile disagree.
- `npm audit` / Dependabot / Snyk for vulnerabilities. That's supply-chain security (OWASP 2025 **A03 Software Supply Chain Failures**). Pin versions and review new dependencies. 2025 saw major npm supply-chain worm attacks (e.g. "Shai-Hulud"), so lockfiles and `npm ci` matter.
- Scripts: `"build": "webpack --mode production"`, `"test": "jest --coverage"`, `"lint": "eslint ."`. `npx` runs package binaries.
- Monorepos: npm/pnpm/yarn workspaces, Nx/Turborepo.

---

## 4. Interview questions (spoken model answers)

**Q: How do you keep bundle size down?**
"Measure with a bundle analyzer first. Then route-level code splitting with `React.lazy`, tree-shakable ES-module imports, removing or replacing heavy libraries, lazy-loading below-the-fold features, and modern browser targets so we don't ship unneeded polyfills. Long-term caching with content hashes. On OneHome, cutting unnecessary first-load JS was one of the levers behind the ~40% faster pages."

**Q: Loaders vs plugins?**
"Loaders transform individual modules as they're imported (TypeScript to JS, Sass to CSS, images to assets). Plugins hook into the whole compilation: generating `index.html`, extracting CSS files, defining env variables, analysing bundles, federation."

**Q: What's tree shaking and why does it sometimes not work?**
"Removing unused exports at build time using static ES-module analysis. It fails with CommonJS modules, side-effectful modules not marked in `sideEffects`, barrel files that import everything, or dynamic property access."

**Q: Webpack or Vite?**
"For a new app, Vite: faster dev feedback and simpler config. For an existing Webpack app I wouldn't migrate just for fashion, only if build times hurt or a feature like Module Federation isn't needed. The concepts I care about (splitting, caching, budgets) are the same in both."

**Q: How do you enforce code quality across a team?**
"Automate it. ESLint with TypeScript, React Hooks and a11y rules, Prettier for formatting, `tsc --noEmit`, all in pre-commit and as required CI stages in Jenkins alongside tests and the 80% coverage gate. Then human review focuses on design and behaviour, not semicolons."

**Q: `npm install` vs `npm ci`?**
"`npm install` can update the lockfile within semver ranges. `npm ci` deletes `node_modules` and installs exactly what the lockfile says, failing on mismatch. So CI and Docker builds use `npm ci` for reproducibility."

---

## 5. Traps and gotchas
- `devtool: 'eval'` in production leaks source and bloats output. Use `source-map` uploaded to error tracking, or `hidden-source-map`.
- Marking `"sideEffects": false` when CSS imports exist removes your CSS. List `"*.css"`/`"*.scss"`.
- Two copies of React in a bundle cause "Invalid hook call". Dedupe, and use peerDependencies.
- `DefinePlugin` / `import.meta.env` values are **public** in the bundle. Never put secrets in front-end env vars.
- `^` ranges plus no lockfile means "works on my machine".
- `.eslintrc` is the legacy format. Flat config is the current standard.
