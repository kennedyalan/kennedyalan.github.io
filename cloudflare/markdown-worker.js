// Cloudflare Worker: serves a Markdown version of the page when the request
// sends `Accept: text/markdown`; everything else passes through to GitHub Pages.
// Deploy in the Cloudflare dashboard with route alankennedy.dev/* (proxy must be on).

export async function htmlToMarkdown(res, baseUrl) {
  let md = '';
  let skip = 0;
  let inLink = 0;
  const block = (prefix) => ({
    element(el) {
      if (inLink) return; // keep link text on one line
      md += '\n\n' + prefix;
      el.onEndTag(() => { md += '\n\n'; });
    },
  });

  await new HTMLRewriter()
    .on('head, script, style, svg, noscript, template', {
      element(el) { skip++; el.onEndTag(() => { skip--; }); },
    })
    .on('h1', block('# '))
    .on('h2', block('## '))
    .on('h3', block('### '))
    .on('h4, h5, h6', block('#### '))
    .on('p, blockquote, section, article, header, footer, div', block(''))
    .on('li', block('- '))
    .on('br', { element() { md += '\n'; } })
    .on('a[href]', {
      element(el) {
        if (skip) return;
        const href = new URL(el.getAttribute('href'), baseUrl).href;
        md += '[';
        inLink++;
        el.onEndTag(() => { inLink--; md += `](${href})`; });
      },
    })
    .on('img[alt]', {
      element(el) {
        if (skip || !el.getAttribute('alt')) return;
        md += `![${el.getAttribute('alt')}](${new URL(el.getAttribute('src') || '', baseUrl).href})`;
      },
    })
    .onDocument({ text(t) { if (!skip) md += t.text.replace(/\s+/g, ' '); } })
    .transform(res)
    .arrayBuffer();

  return md
    .replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos|nbsp));/gi, (_, dec, hex, name) =>
      dec ? String.fromCodePoint(+dec)
        : hex ? String.fromCodePoint(parseInt(hex, 16))
        : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[name.toLowerCase()])
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\[\s*\]\([^)]*\)/g, '') // links with no text (icon-only)
    .replace(/\[\s*(.*?)\s*\]\(/g, '[$1](')
    .replace(/^(#+|-) +/gm, '$1 ')
    .replace(/^#+ *$/gm, '')          // empty headings
    .replace(/^- *\n+(?=#)/gm, '')    // bullet wrapping a heading block
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

// Agent discovery links for the homepage (RFC 8288 / RFC 9727 section 3)
const LINKS = '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc", </llms.txt>; rel="service-doc", </auth.md>; rel="describedby"';
const HOMEPAGES = ['/', '/en/'];

export default {
  async fetch(request) {
    const res = await fetch(request);
    const { pathname } = new URL(request.url);
    const wantsMd = (request.headers.get('Accept') || '').includes('text/markdown');
    let out;
    if (!wantsMd || !(res.headers.get('Content-Type') || '').includes('text/html')) {
      out = new Response(res.body, res);
      out.headers.append('Vary', 'Accept');
    } else {
      const md = await htmlToMarkdown(res, request.url);
      out = new Response(md, {
        status: res.status,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'x-markdown-tokens': String(Math.ceil(md.length / 4)), // ponytail: rough estimate, ~4 chars/token
        },
      });
    }
    if (HOMEPAGES.includes(pathname)) out.headers.set('Link', LINKS);
    // GitHub Pages serves extensionless files as application/octet-stream
    if (pathname === '/.well-known/api-catalog') out.headers.set('Content-Type', 'application/linkset+json');
    return out;
  },
};
