import CleanCSS from "clean-css";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJs } from "terser";

export type BuildMode = "tweak" | "optimized";

export interface AssetBundle {
  html: string;
  css: string;
  js: string;
}

export async function optimizeAssets(
  assets: AssetBundle,
  buildMode: BuildMode,
): Promise<AssetBundle> {
  if (buildMode === "tweak") {
    return assets;
  }

  const [html, js] = await Promise.all([
    minifyHtml(assets.html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
    }),
    minifyJs(assets.js, {
      compress: {
        drop_console: true,
        passes: 2,
      },
      mangle: true,
    }),
  ]);

  const css = new CleanCSS({ level: 2 }).minify(assets.css).styles;

  return {
    html,
    css,
    js: js.code ?? assets.js,
  };
}
