function escapeForInlineScript(value: string): string {
  return value
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function serializeConfigForScript(config: unknown): string {
  return escapeForInlineScript(JSON.stringify(config));
}

export function injectConfigIntoHtml(html: string, config: unknown): string {
  const script = `<script>window.__WEDGEN_CONFIG__=${serializeConfigForScript(config)};</script>`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${script}</head>`);
  }

  if (html.includes("<body")) {
    return html.replace(/<body([^>]*)>/, `<body$1>${script}`);
  }

  return `${script}${html}`;
}
