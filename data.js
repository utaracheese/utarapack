// ========================================================
// NỘI DUNG HỘP THƯ
// ========================================================
const letterData = {
  title: "Lời nhắn từ utara🧀",
  content: `Chào mọi người! Nếu mà mọi người muốn thêm pack vô danh sách random(nếu chưa có) mọi người hãy nhắn qua gmail cho mình nha

Khi bạn muốn góp ý tưởng hãy nhắn như sau pack(type), có thể nhập nhiều pack nha.
Pack : mọi người nhập tên nhân vật waifu của mình.
Type : mọi người nhập thể loại hent hoặc ani.
(Về phần pack hent mình sẽ chỉ dùng những bộ/game nổi tiếng nhiều nhân vật vì ảnh hent rất ít ảnh)`
};

// NỘI DUNG LƯU Ý CHO TỪNG PHIÊN BẢN
const notes = {
  java: "Lưu ý : tui tìm ra cách để ae không cần giải nén pack rồi nên từ pack hutao reup trở đi ae cứ cho vô pack dùng thôi",
  bedrock: "Mình không đủ khả năng để làm các gui nhe mọi người, mọi người nếu tải chơi có thể chơi chỉ có sky thui nhe ❤",
  single: "Kho Pack Lẻ (Item, Sky, Textures, ...) được tách rời để mọi người dễ phối hợp sử dụng ❤"
};

// ========================================================
// 1. DANH SÁCH PACK JAVA CHÍNH
// ========================================================
const javaPackList = [
  {
    title: "Pack Hutao Re",
    images: [
      "assets/hutao1.png",
      "assets/hutao2.png",
      "assets/hutao3.png",
      "assets/hutao4.png",
      "assets/hutao5.png",
      "assets/hutao6.png",
      "assets/hutao7.png",
      "assets/hutao8.png",
    ],
    desc: "Tải pack Hutao ở link dưới nha (đây là bản làm lại để tránh lag, dù chỉ là 1 tí :Đ)",
    link: "https://link4m.org/ytOENB34"
  },
  {
    title: "Pack genshin",
    images: [
      "assets/gen2101.png",
    ],
    desc: "Pack genshin download bằng link dưới đây.",
    link: "https://link4m.org/8mzEed"
  },
  {
    title: "Pack Blue Archiver",
    images: [
      "assets/blu1.png",
    ],
    desc: "Pack hentai Blue Archiver, download bằng link dưới nhe",
    link: "https://link4m.org/DocKrNd"
  },
  {
    title: "Pack Honkai Star Rail",
    images: [
      "assets/hon1.png",
    ],
    desc: "Pack Honkai Star Rail, download bằng link dưới nhe",
    link: "https://link4m.net/4VhcfzFr"
  },
  
  {
    title: "Pack Waguri",
    images: [
      "assets/wag1.png",
      "assets/wag2.png",
      "assets/wag3.png",
      "assets/wag4.png",
      "assets/wag5.png",
      "assets/wag6.png",
      "assets/wag7.png",
      "assets/wag9.png",
      "assets/wag10.png",
      "assets/wag11.png",
    ],
    desc: "Pack Waguri, download bằng link dưới nhe",
    link: "https://link4m.org/0p421"
  },
  {
    title: "Pack Mahiru",
    images: [
      "assets/mah1.png",
      "assets/mah2.png",
      "assets/mah3.png",
      "assets/mah4.png",
      "assets/mah5.png",
      "assets/mah6.png",
      "assets/mah7.png",
      "assets/mah9.png",
      "assets/mah10.png",
      "assets/mah11.png",
      "assets/mah12.png",
      "assets/mah13.png",
      "assets/mah14.png",
    ],
    desc: "Pack Mahiru, download bằng link dưới nhe",
    link: "https://link4m.org/Pv3qtb"
  },
  {
    title: "Pack alya",
    images: [
      "assets/alya1.png",
      "assets/alya2.png",
      "assets/alya3.png",
      "assets/alya4.png",
      "assets/alya5.png",
      "assets/alya6.png",
      "assets/alya7.png",
    ],
    desc: "Pack đầu tay của tui nhe 💖",
    link: "https://link4m.org/aaNlL"
  },
  {
    title: "Pack Roxy Migurdia",
    images: [
      "assets/roxy9.png",
      "assets/roxy1.png",
      "assets/roxy2.png",
      "assets/roxy3.png",
      "assets/roxy4.png",
      "assets/roxy5.png",
      "assets/roxy6.png",
      "assets/roxy7.png",
      "assets/roxy8.png",
    ],
    desc: "Download pack tại link dưới đây <3",
    link: "https://link4m.org/of6KTBPw"
  },
  {
    title: "Pack Siesta",
    images: [
      "assets/sis1.png",
      "assets/sis2.png",
      "assets/sis3.png"
    ],
    desc: "Download pack tại link dưới đây",
    link: "https://link4m.org/A6KZtDEn"
  },
  {
    title: "Pack Nakano Miku",
    images: [
      "assets/miku1.png",
      "assets/miku2.png",
      "assets/miku3.png"
    ],
    desc: "Download pack tại link dưới đây",
    link: "https://link4m.net/mda4EQ"
  },
  {
    title: "Pack Arisu Tendou",
    images: [
      "assets/aris1.png",
      "assets/aris2.png",
      "assets/aris3.png",
      "assets/aris4.png",
      "assets/aris5.png",
      "assets/aris6.png",
      "assets/aris7.png",
      "assets/aris8.png",
      "assets/aris9.png",
      "assets/aris10.png",
      "assets/aris11.png",
    ],
    desc: "Tải pack Aris Tendou tại link bên dưới này.",
    link: "https://link4m.net/TbMqts"
  },
  {
    title: "Pack Hutao",
    images: [
      "assets/hutao1.png",
      "assets/hutao2.png",
      "assets/hutao3.png",
      "assets/hutao4.png",
      "assets/hutao5.png",
      "assets/hutao6.png",
      "assets/hutao7.png",
      "assets/hutao8.png",
    ],
    desc: "Tải pack Hutao. Pack hutao mình khuyên mọi người không nên tải hoặc chỉ nên tải cho đẹp. lý do vì khi làm pack mình chưa tối ưu nên nó sẽ khiến game của mọi người rất lag",
    link: "https://link4m.org/LSMiM"
  },
  {
    title: "Pack Gaur gura",
    images: [
      "assets/gg0.png",
      "assets/gg1.png",
      "assets/gg2.png",
      "assets/gg3.png",
      "assets/gg4.png",
      "assets/gg5.png",
      "assets/gg6.png",
      "assets/gg7.png",
      "assets/gg9.png",
      "assets/gg10.png",
      "assets/gg11.png",
      "assets/gg12.png",
      "assets/gg13.png",
    ],
    desc: "Pack gawr gura, tải bằng link dưới nhe",
    link: "https://link4m.org/SHOJKW"
  },
  {
    title: "Pack Hoshino",
    images: [
      "assets/hoshino2.png",
      "assets/hoshino3.png",
      "assets/hoshino4.png",
      "assets/hoshino5.png",
      "assets/hoshino6.png",
      "assets/hoshino7.png",
      "assets/hoshino8.png",
      "assets/hoshino9.png",
    ],
    desc: "Pack hoshino, download bằng link dưới nhe",
    link: "https://link4m.net/Rh74Q"
  }
];

// ========================================================
// 2. DANH SÁCH PACK BEDROCK CHÍNH
// ========================================================

const bedrockPackList = [
  {
    title: "Pack Sky Gawr Gura",
    images: [
      "assets/gg10.jpg",
      "assets/gg11.jpg",
      "assets/gg12.jpg",
      "assets/gg13.jpg",
    ],
    desc: "Pack Gawr Gura, tải xuống bằng link dưới đây nhe.",
    link: "https://link4m.org/TgAXc2ir"
  },
  {
    title: "Pack Arya",
    images: [
      "assets/arbr.jpg",
      "assets/arbr1.jpg",
      "assets/arbr2.jpg",
      "assets/arbr3.jpg",
      "assets/arbr4.jpg",
    ],
    desc: "Pack Arya, tải xuống bằng link dưới đây nhe.",
    link: "https://link4m.org/xun9wMZx"
  },
  {
    title: "Pack blue",
    images: [
      "assets/blu1.png",
    ],
    desc: "Pack Sky Blue archiver, tải xuống bằng link dưới đây nhe.",
    link: "https://link4m.net/d8Im4OhB"
  },
  {
    title: "Pack honkai",
    images: [
      "assets/honk1.jpg",
      "assets/honk2.jpg",
      "assets/honk3.jpg",
      "assets/honk4.jpg",
    ],
    desc: "Pack Honkai , tải xuống bằng link dưới đây nhe.",
    link: "https://link4m.net/3nETDYY"
  },
  {
    title: "combo Sky pack genshin",
    images: [
      "assets/gen2101.png",
      "assets/gen2102.png",
      "assets/gen2108.png",
    ],
    desc: "combo Sky pack genshin",
    link: "https://link4m.net/fl8J8"
  }
];

// ========================================================
// 3. KHO PACK LẺ (SINGLE PACKS)
// Thêm các item/pack lẻ vào đây
// ========================================================
const cosplayPackList = [
];