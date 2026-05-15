export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const keyword = url.searchParams.get('q');

  if (!keyword) {
    return new Response(JSON.stringify({ error: '缺少参数q' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const baikeUrl = `https://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=${encodeURIComponent(keyword)}&bk_length=300`;

  try {
    const res = await fetch(baikeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const data = await res.json();

    return new Response(JSON.stringify({
      title: data.title || null,
      abstract: data.abstract || null,
      url: data.url || null
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
