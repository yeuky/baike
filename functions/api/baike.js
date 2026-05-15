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
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept-Encoding': 'identity'
      },
      redirect: 'follow'
    });

    const buffer = await res.arrayBuffer();

    // 尝试多种解码
    const utf8 = new TextDecoder('utf-8').decode(buffer);
    let html = utf8;

    // 检测是否乱码（中文UTF-8正常不会出现连续高位乱码）
    if (utf8.includes('鍥介檯') || utf8.includes('锛')) {
      // 实际是GBK
      try {
        html = new TextDecoder('gbk').decode(buffer);
      } catch(e) {
        // Workers可能不支持gbk，返回诊断信息
        return new Response(JSON.stringify({
          error: 'gbk decode failed: ' + e.message,
          supportedTest: typeof TextDecoder !== 'undefined'
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    let abstract = null;
    const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (metaMatch) {
      abstract = metaMatch[1].trim();
    }

    let title = null;
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/_百度百科$/, '').replace(/[（(].*?[）)]/, '').trim();
    }

    return new Response(JSON.stringify({ title, abstract, url: baikeUrl }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
