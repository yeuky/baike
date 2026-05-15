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
    // 直接请求百度百科词条页面
    const baikeUrl = `https://baike.baidu.com/item/${encodeURIComponent(keyword)}`;
    const res = await fetch(baikeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await res.text();

    // 提取meta description作为摘要
    let abstract = null;
    const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (metaMatch) {
      abstract = metaMatch[1].trim();
    }

    // 提取标题
    let title = null;
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/_百度百科$/, '').replace(/（.*?）/, '').trim();
    }

    return new Response(JSON.stringify({
      title,
      abstract,
      url: baikeUrl
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
