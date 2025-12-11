// client/functions/phim/[slug].js

export async function onRequestGet(context) {
  const { request, params, env } = context;
  const { slug } = params;

  // 1. Lấy nội dung gốc của file index.html (SPA Shell)
  // env.ASSETS là biến môi trường đặc biệt của Cloudflare trỏ tới file tĩnh
  const response = await env.ASSETS.fetch(request);
  const html = await response.text();

  // 2. Gọi API lấy thông tin phim (Server-to-Server)
  // Tạm thời gọi trực tiếp Ophim, sau này Giai đoạn 2 sẽ gọi Backend của mình
  try {
    const apiRes = await fetch(`https://ophim1.com/phim/${slug}`);
    
    if (!apiRes.ok) {
      // Nếu lỗi API, trả về HTML gốc để React tự xử lý (Client-side)
      return new Response(html, {
        headers: response.headers,
      });
    }

    const data = await apiRes.json();
    const movie = data.movie;

    if (!movie) {
      return new Response(html, { headers: response.headers });
    }

    // 3. Chuẩn bị Meta Data
    // Lưu ý: poster_url của Ophim đôi khi cần domain ảnh
    const title = `Xem phim ${movie.name} (${movie.year}) - HD Vietsub`;
    const description = stripHtml(movie.content).substring(0, 160) + "...";
    const image = movie.poster_url; // Hoặc movie.thumb_url tùy dữ liệu

    // 4. Inject (Tiêm) Meta Tags vào HTML
    // Chúng ta thay thế các thẻ placeholder hoặc chèn thẳng vào <head>
    const modifiedHtml = html
      .replace(
        '<title>PhimVietHay</title>', 
        `<title>${title}</title>`
      )
      .replace(
        '</head>',
        `
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:type" content="video.movie" />
        <meta property="og:url" content="${request.url}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
        </head>`
      );

    // 5. Trả về HTML đã được "độ" lại
    return new Response(modifiedHtml, {
      headers: response.headers,
    });

  } catch (error) {
    // Fallback an toàn: Nếu có lỗi gì trong quá trình này, cứ trả về trang web bình thường
    console.error("SEO Injection Error:", error);
    return new Response(html, {
      headers: response.headers,
    });
  }
}

// Helper nhỏ để lọc thẻ HTML trong description
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '');
}