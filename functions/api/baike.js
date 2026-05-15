export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const keyword = url.searchParams.get('q');

  if (!keyword) {
    return new Response(JSON.stringify({ error: '缺少参数q' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const baikeUrl = `https://baike.baidu.com/item/${encodeURIComponent(keyword)}`;
    const res = await fetch(baikeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      redirect: 'follow'
    });

    const html = await res.text();

    return new Response(JSON.stringify({
      status: res.status,
      length: html.length,
      preview: html.substring(0, 1000)
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
