/**
 * Request snippets for the /developers page, one generator per language.
 * Each takes { method, url, body } and returns ready-to-paste source.
 */

export const LANGUAGES = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'php', label: 'PHP' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'csharp', label: 'C#' },
]

const KEY = 'YOUR_API_KEY'

const json = (body) => JSON.stringify(body, null, 2)

/** Indent every line after the first, for values nested inside other code. */
const nest = (text, pad) => text.replace(/\n/g, '\n' + pad)

/** Literal in a language whose maps/lists look like JSON with other keywords. */
function literal(value, depth, { open, close, listOpen, listClose, pair, str, t, f, n }) {
  const pad = '    '.repeat(depth + 1)
  const end = '    '.repeat(depth)

  if (value === null) return n
  if (value === true) return t
  if (value === false) return f
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return str(value)

  const opts = { open, close, listOpen, listClose, pair, str, t, f, n }

  if (Array.isArray(value)) {
    const items = value.map((v) => pad + literal(v, depth + 1, opts))
    return `${listOpen}\n${items.join(',\n')},\n${end}${listClose}`
  }

  const items = Object.entries(value).map(([k, v]) => pad + pair(str(k), literal(v, depth + 1, opts)))
  return `${open}\n${items.join(',\n')},\n${end}${close}`
}

const phpArray = (body) =>
  literal(body, 1, {
    open: '[', close: ']', listOpen: '[', listClose: ']',
    pair: (k, v) => `${k} => ${v}`,
    str: (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`,
    t: 'true', f: 'false', n: 'null',
  })

const pythonDict = (body) =>
  literal(body, 1, {
    open: '{', close: '}', listOpen: '[', listClose: ']',
    pair: (k, v) => `${k}: ${v}`,
    str: (s) => JSON.stringify(s),
    t: 'True', f: 'False', n: 'None',
  })

const GENERATORS = {
  curl: ({ method, url, body }) => {
    const lines = [
      method === 'GET' ? `curl "${url}"` : `curl -X ${method} "${url}"`,
      `  -H "Authorization: Bearer ${KEY}"`,
      `  -H "Accept: application/json"`,
    ]
    if (body) {
      lines.push(`  -H "Content-Type: application/json"`)
      lines.push(`  -d '${json(body).replace(/'/g, "'\\''")}'`)
    }
    return lines.join(' \\\n')
  },

  javascript: ({ method, url, body }) => {
    const opts = [
      `  method: "${method}",`,
      `  headers: {`,
      `    Authorization: "Bearer ${KEY}",`,
      `    Accept: "application/json",`,
      ...(body ? [`    "Content-Type": "application/json",`] : []),
      `  },`,
      ...(body ? [`  body: JSON.stringify(${nest(json(body), '  ')}),`] : []),
    ]
    return [
      `const response = await fetch("${url}", {`,
      ...opts,
      `});`,
      ``,
      `const result = await response.json();`,
      `console.log(response.status, result);`,
    ].join('\n')
  },

  php: ({ method, url, body }) => {
    const lines = [
      `<?php`,
      ``,
      `$ch = curl_init('${url}');`,
      ``,
      `curl_setopt_array($ch, [`,
      `    CURLOPT_RETURNTRANSFER => true,`,
      `    CURLOPT_CUSTOMREQUEST => '${method}',`,
      `    CURLOPT_HTTPHEADER => [`,
      `        'Authorization: Bearer ${KEY}',`,
      `        'Accept: application/json',`,
      ...(body ? [`        'Content-Type: application/json',`] : []),
      `    ],`,
      ...(body ? [`    CURLOPT_POSTFIELDS => json_encode(${phpArray(body)}),`] : []),
      `]);`,
      ``,
      `$response = json_decode(curl_exec($ch), true);`,
      `$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);`,
      `curl_close($ch);`,
      ``,
      `print_r([$status, $response]);`,
    ]
    return lines.join('\n')
  },

  python: ({ method, url, body }) =>
    [
      `import requests`,
      ``,
      `response = requests.${method.toLowerCase()}(`,
      `    "${url}",`,
      `    headers={`,
      `        "Authorization": "Bearer ${KEY}",`,
      `        "Accept": "application/json",`,
      `    },`,
      ...(body ? [`    json=${pythonDict(body)},`] : []),
      `    timeout=60,`,
      `)`,
      ``,
      `print(response.status_code, response.json())`,
    ].join('\n'),

  java: ({ method, url, body }) =>
    [
      `import java.net.URI;`,
      `import java.net.http.*;`,
      ``,
      `HttpClient client = HttpClient.newHttpClient();`,
      ``,
      ...(body ? [`String json = """`, `    ${nest(json(body), '    ')}`, `    """;`, ``] : []),
      `HttpRequest request = HttpRequest.newBuilder()`,
      `    .uri(URI.create("${url}"))`,
      `    .header("Authorization", "Bearer ${KEY}")`,
      `    .header("Accept", "application/json")`,
      ...(body
        ? [`    .header("Content-Type", "application/json")`, `    .POST(HttpRequest.BodyPublishers.ofString(json))`]
        : [`    .GET()`]),
      `    .build();`,
      ``,
      `HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());`,
      `System.out.println(response.statusCode() + " " + response.body());`,
    ].join('\n'),

  csharp: ({ method, url, body }) =>
    [
      `using System.Net.Http.Headers;`,
      `using System.Text;`,
      ``,
      `using var client = new HttpClient();`,
      `client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "${KEY}");`,
      `client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));`,
      ``,
      ...(body
        ? [
            `var json = """`,
            `    ${nest(json(body), '    ')}`,
            `    """;`,
            ``,
            `var response = await client.PostAsync(`,
            `    "${url}",`,
            `    new StringContent(json, Encoding.UTF8, "application/json"));`,
          ]
        : [`var response = await client.GetAsync("${url}");`]),
      ``,
      `Console.WriteLine($"{(int)response.StatusCode} {await response.Content.ReadAsStringAsync()}");`,
    ].join('\n'),
}

export function sample(language, request) {
  return GENERATORS[language](request)
}

/* -------------------------------------------------------------------------
 | Highlighting — a small tokenizer, enough for snippets and JSON responses.
 * ---------------------------------------------------------------------- */

const KEYWORDS = {
  curl: ['curl'],
  javascript: ['const', 'await', 'new', 'return'],
  php: ['true', 'false', 'null', 'print_r', 'json_encode', 'json_decode', 'curl_init', 'curl_setopt_array', 'curl_exec', 'curl_getinfo', 'curl_close'],
  python: ['import', 'True', 'False', 'None', 'print'],
  java: ['import', 'new', 'String', 'HttpClient', 'HttpRequest', 'HttpResponse', 'URI'],
  csharp: ['using', 'var', 'new', 'await'],
  json: ['true', 'false', 'null'],
}

const COMMENT = {
  curl: /#[^\n]*/,
  python: /#[^\n]*/,
  javascript: /\/\/[^\n]*/,
  php: /\/\/[^\n]*/,
  java: /\/\/[^\n]*/,
  csharp: /\/\/[^\n]*/,
  json: /(?!)/,
}

export function tokenize(code, language) {
  const keywords = KEYWORDS[language] ?? []
  const pattern = new RegExp(
    [
      `(?<comment>${COMMENT[language]?.source ?? '(?!)'})`,
      `(?<block>"""[\\s\\S]*?""")`,
      `(?<key>"(?:[^"\\\\\\n]|\\\\.)*"(?=\\s*:))`,
      `(?<string>"(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
      `(?<variable>\\$[A-Za-z_]\\w*)`,
      `(?<number>\\b\\d+(?:\\.\\d+)?\\b)`,
      keywords.length ? `(?<keyword>\\b(?:${keywords.join('|')})\\b)` : '(?<keyword>(?!))',
    ].join('|'),
    'g'
  )

  const tokens = []
  let last = 0

  for (const match of code.matchAll(pattern)) {
    if (match.index > last) tokens.push(['plain', code.slice(last, match.index)])
    const type = Object.keys(match.groups).find((k) => match.groups[k] !== undefined)
    // Text-block JSON reads better as JSON than as one long string.
    if (type === 'block') {
      tokens.push(['plain', '"""'])
      tokens.push(...tokenize(match[0].slice(3, -3), 'json'))
      tokens.push(['plain', '"""'])
    } else {
      tokens.push([type === 'key' && language !== 'json' ? 'string' : type, match[0]])
    }
    last = match.index + match[0].length
  }

  if (last < code.length) tokens.push(['plain', code.slice(last)])
  return tokens
}
