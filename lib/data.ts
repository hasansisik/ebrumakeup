export interface HeroColumn {
  id: string;
  step: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

export const initialHeroColumns: HeroColumn[] = [
  {
    id: "bridal",
    step: "01",
    tag: "İmza Hizmet",
    title: "Gelin Makyajı",
    subtitle: "Zamansız Zarafet & 16 Saat Kalıcı Işıltı",
    description: "Özel gününüzde cildinizi maskelemeden, doğal güzelliğinizi ve yüz hatlarınızı ön plana çıkaran profesyonel gelin tasarımı ve prova seansı.",
    image: "/images/catalog/gelin/gelin-1.png",
    ctaText: "Randevu Al",
    ctaLink: "#contact",
  },
  {
    id: "editorial",
    step: "02",
    tag: "Moda & Çekim",
    title: "Editoryal & Podyum",
    subtitle: "Kamera Işıklarına Özel HD Formüller",
    description: "Dergi kapakları, katalog çekimleri ve moda defilelerinde stilinizi sanata dönüştüren yüksek çözünürlüklü profesyonel makyaj uygulaması.",
    image: "/images/catalog/editorial/editorial-6.jpeg",
    ctaText: "Portfolyoyu Gör",
    ctaLink: "#portfolio",
  },
  {
    id: "evening",
    step: "03",
    tag: "Gece & Davet",
    title: "Davet & Gece Makyajı",
    subtitle: "Büyüleyici Bakışlar & Porselen Ten",
    description: "Nişan, gala ve tüm özel kutlamalarınızda yüz anatominize özel tonlarla gecenin yıldızı olacağınız sofistike ve kalıcı görünüm.",
    image: "/images/catalog/ozel-gun/ozel-gun-1.png",
    ctaText: "Hizmetleri İncele",
    ctaLink: "#services",
  },
];

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  subtitle: string;
  longDescription: string;
  details: {
    duration: string;
    products: string;
    finish: string;
    photography: string;
  };
  gallery: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  tag: string;
  readTime: string;
  author: string;
  authorTitle: string;
  authorAvatar: string;
  views?: number;
  uniqueViews?: number;
}

export interface Service {
  iconType: "ring" | "sparkles" | "camera" | "brush";
  title: string;
  description: string;
  price: string;
  image?: string;
  tag?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  initials: string;
  stars: number;
}

export const portfolioItems: PortfolioItem[] = [
  {
    "id": "gelin-makyaji",
    "title": "Gelin Makyajı Koleksiyonu",
    "category": "Gelin",
    "subtitle": "Zamansız Zarafet & 16 Saat Kalıcı Romantik Glow",
    "image": "/images/catalog/gelin/gelin-1.png",
    "description": "Düğün gününüzde cildinizi maskelemeden, doğal güzelliğinizi ve yüz hatlarınızı ön plana çıkaran profesyonel gelin tasarımları.",
    "longDescription": "Gelin makyajında hedefimiz, yüzün en duru ve zarif güzelliğini ortaya çıkarmak. 16 saat kalıcı lüks formüller, ter ve gözyaşına dayanıklı sabitleyiciler ve flaş ışığında parlamayan ipeksi ten dokusu ile düğün gününüzde rüya gibi bir görünüm sunuyoruz. Prova seansından düğün anına kadar her detay özenle planlanır.",
    "details": {
      "duration": "120 - 150 dk",
      "products": "Dior Backstage, Charlotte Tilbury, Tom Ford",
      "finish": "Soft Matte & Dewy Glow",
      "photography": "Stüdyo ve Açık Hava Işığına Tam Uyumlu"
    },
    "gallery": [
      "/images/catalog/gelin/gelin-1.png",
      "/images/catalog/gelin/gelin-2.jpeg",
      "/images/catalog/gelin/gelin-3.jpeg",
      "/images/catalog/gelin/gelin-4.png",
      "/images/catalog/gelin/gelin-5.png",
      "/images/catalog/gelin/gelin-6.jpeg",
      "/images/catalog/gelin/gelin-7.jpeg",
      "/images/catalog/gelin/gelin-8.jpeg",
      "/images/catalog/gelin/gelin-9.jpeg",
      "/images/catalog/gelin/gelin-10.png",
      "/images/catalog/gelin/gelin-11.png",
      "/images/catalog/gelin/gelin-12.jpeg",
      "/images/catalog/gelin/gelin-13.jpeg",
      "/images/catalog/gelin/gelin-14.jpeg",
      "/images/catalog/gelin/gelin-15.jpeg",
      "/images/catalog/gelin/gelin-16.png",
      "/images/catalog/gelin/gelin-17.png",
      "/images/catalog/gelin/gelin-18.png",
      "/images/catalog/gelin/gelin-19.jpeg",
      "/images/catalog/gelin/gelin-20.jpeg",
      "/images/catalog/gelin/gelin-21.jpeg",
      "/images/catalog/gelin/gelin-22.jpeg",
      "/images/catalog/gelin/gelin-23.jpeg",
      "/images/catalog/gelin/gelin-24.jpeg",
      "/images/catalog/gelin/gelin-25.jpeg",
      "/images/catalog/gelin/gelin-26.png"
    ]
  },
  {
    "id": "editorial-moda",
    "title": "Editorial & Moda Koleksiyonu",
    "category": "Editoryal",
    "subtitle": "Yüksek Moda, Podyum & Dergi Çekimleri",
    "image": "/images/catalog/editorial/editorial-6.jpeg",
    "description": "Cesur ve dramatik editoryal makyaj. Dergi kapakları, kataloglar ve moda defileleri için kamera vizörüne özel tasarlanan profesyonel görünüm.",
    "longDescription": "Editorial ve podyum makyajı cesur bir vizyon gerektirir. Yüksek pigmentli bronz ve metalik yansımalar, heykelsi elmacık kemikleri ve kamera vizörüne özel tasarlanan ışık oyunlarıyla uluslararası moda standartlarında editoryal tasarımlar hazırlıyoruz.",
    "details": {
      "duration": "90 - 120 dk",
      "products": "Pat McGrath Labs, MAC Pro, NARS Pro",
      "finish": "High Glam & Metallic Sculpt",
      "photography": "4K / 8K Yüksek Çözünürlüklü Moda Çekimleri"
    },
    "gallery": [
      "/images/catalog/editorial/editorial-1.jpeg",
      "/images/catalog/editorial/editorial-2.jpeg",
      "/images/catalog/editorial/editorial-3.jpeg",
      "/images/catalog/editorial/editorial-4.jpeg",
      "/images/catalog/editorial/editorial-5.jpeg",
      "/images/catalog/editorial/editorial-6.jpeg",
      "/images/catalog/editorial/editorial-7.jpeg",
      "/images/catalog/editorial/editorial-8.jpeg",
      "/images/catalog/editorial/editorial-9.jpeg",
      "/images/catalog/editorial/editorial-10.jpeg",
      "/images/catalog/editorial/editorial-11.jpeg",
      "/images/catalog/editorial/editorial-12.jpeg",
      "/images/catalog/editorial/editorial-13.jpeg",
      "/images/catalog/editorial/editorial-14.jpeg",
      "/images/catalog/editorial/editorial-15.jpeg",
      "/images/catalog/editorial/editorial-16.jpeg",
      "/images/catalog/editorial/editorial-17.jpeg",
      "/images/catalog/editorial/editorial-18.jpeg",
      "/images/catalog/editorial/editorial-19.jpeg",
      "/images/catalog/editorial/editorial-20.jpeg",
      "/images/catalog/editorial/editorial-21.jpeg",
      "/images/catalog/editorial/editorial-22.jpeg",
      "/images/catalog/editorial/editorial-23.jpeg",
      "/images/catalog/editorial/editorial-24.jpeg",
      "/images/catalog/editorial/editorial-25.jpeg"
    ]
  },
  {
    "id": "beauty-glow",
    "title": "Beauty & Doğal Işıltı",
    "category": "Beauty",
    "subtitle": "No-Makeup Makeup & Cam Ten (Glass Skin) Işıltısı",
    "image": "/images/catalog/beauty/beauty-1.jpeg",
    "description": "Cildin doğal nefesini koruyan, hafif dokunuşlarla taze ve aydınlık bir güzellik sunan modern beauty makyajı.",
    "longDescription": "Cildi ağır katmanlarla kapatmadan, nefes alan ve içeriden aydınlanan bir cam ten (glass skin) etkisi. Gündüz etkinlikleri, nişan kutlamaları ve taze bir görünüm arayan kadınlar için en çok tercih edilen stil.",
    "details": {
      "duration": "60 - 75 dk",
      "products": "Armani Luminous Silk, Rare Beauty, Chanel Les Beiges",
      "finish": "Luminous Glass Skin",
      "photography": "Doğal Gün Işığı & HD Stüdyo"
    },
    "gallery": [
      "/images/catalog/beauty/beauty-1.jpeg",
      "/images/catalog/beauty/beauty-2.jpeg",
      "/images/catalog/beauty/beauty-3.jpeg",
      "/images/catalog/beauty/beauty-4.jpeg",
      "/images/catalog/beauty/beauty-5.jpeg",
      "/images/catalog/beauty/beauty-6.jpeg",
      "/images/catalog/beauty/beauty-7.jpeg",
      "/images/catalog/beauty/beauty-8.jpeg",
      "/images/catalog/beauty/beauty-9.jpeg",
      "/images/catalog/beauty/beauty-10.jpeg",
      "/images/catalog/beauty/beauty-11.jpeg",
      "/images/catalog/beauty/beauty-12.jpeg",
      "/images/catalog/beauty/beauty-13.jpeg",
      "/images/catalog/beauty/beauty-14.jpeg",
      "/images/catalog/beauty/beauty-15.jpeg"
    ]
  },
  {
    "id": "ozel-gun-davet",
    "title": "Özel Gün & Gece Daveti",
    "category": "Özel Gün",
    "subtitle": "Gala, Kırmızı Halı & Büyüleyici Akşam Davetleri",
    "image": "/images/catalog/ozel-gun/ozel-gun-1.png",
    "description": "Göz alıcı akşam makyajı. Işıltılı dumanlı gözler ve sofistike dudak renkleriyle tüm bakışları üzerinize çeken büyüleyici bir cazibe.",
    "longDescription": "Akşam ışıklarında büyüleyici duran sofistike gölgelendirmeler, dumanlı gözler ve kadife dudaklar. Özel gala ve akşam davetlerinizde tüm bakışları üzerinize çeken zamansız bir cazibe.",
    "details": {
      "duration": "75 - 90 dk",
      "products": "Fenty Beauty, Hourglass, Huda Beauty",
      "finish": "Velvet Matte & Smokey Shimmer",
      "photography": "Gece Işıklandırması ve Flaş Uyumlu"
    },
    "gallery": [
      "/images/catalog/ozel-gun/ozel-gun-1.png",
      "/images/catalog/ozel-gun/ozel-gun-2.jpeg",
      "/images/catalog/ozel-gun/ozel-gun-3.jpeg",
      "/images/catalog/ozel-gun/ozel-gun-4.jpeg",
      "/images/catalog/ozel-gun/ozel-gun-5.png",
      "/images/catalog/ozel-gun/ozel-gun-6.png",
      "/images/catalog/ozel-gun/ozel-gun-7.png",
      "/images/catalog/ozel-gun/ozel-gun-8.png"
    ]
  },
  {
    "id": "tv-sahne-reklam",
    "title": "TV, Sahne & Reklam Çekimleri",
    "category": "TV & Reklam",
    "subtitle": "Dizi Setleri, Canlı Yayın & Reklam Prodüksiyonları",
    "image": "/images/catalog/tv-reklam/tv-reklam-1.jpeg",
    "description": "Yüksek güçlü stüdyo ışıkları ve hareketli kameralar altında parlamayan, gün boyu sabit kalan profesyonel set makyajı.",
    "longDescription": "Televizyon ve video prodüksiyonlarında kullanılan yoğun ışıklandırma altında parlamayan, HD ekranlarda gözenek ve çizgi oluşturmayan profesyonel kamera önü makyaj protokolü.",
    "details": {
      "duration": "60 - 90 dk",
      "products": "Kryolan HD, Make Up For Ever, MAC Studio Fix",
      "finish": "HD Camera Proof & Anti-Shine",
      "photography": "Stüdyo Projektörleri & 4K Yayın"
    },
    "gallery": [
      "/images/catalog/tv-reklam/tv-reklam-1.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-2.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-3.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-4.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-5.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-6.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-7.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-8.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-9.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-10.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-11.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-12.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-13.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-14.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-15.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-16.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-17.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-18.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-19.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-20.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-21.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-22.jpeg",
      "/images/catalog/tv-reklam/tv-reklam-23.jpeg"
    ]
  },
  {
    "id": "mezuniyet-glow",
    "title": "Mezuniyet & Genç Glow",
    "category": "Mezuniyet",
    "subtitle": "Dinamik, Taze & Işıltılı Genç Kutlama Stili",
    "image": "/images/catalog/mezuniyet/mezuniyet-1.png",
    "description": "Kep törenleri ve mezuniyet baloları için gençliği ve tazeliği öne çıkaran, enerjik ve kalıcı parti görünümleri.",
    "longDescription": "Mezuniyet balolarında sabahın ilk ışıklarına kadar dans ederken akmayan, fotoğraflarda taze ve canlı görünen genç mezuniyet makyaj paketleri.",
    "details": {
      "duration": "60 - 75 dk",
      "products": "Benefit, Too Faced, Charlotte Tilbury",
      "finish": "Fresh Dewy & Sparkle",
      "photography": "Flaşlı Gece Çekimleri"
    },
    "gallery": [
      "/images/catalog/mezuniyet/mezuniyet-1.png",
      "/images/catalog/mezuniyet/mezuniyet-2.jpeg",
      "/images/catalog/mezuniyet/mezuniyet-3.jpeg",
      "/images/catalog/mezuniyet/mezuniyet-4.png",
      "/images/catalog/mezuniyet/mezuniyet-5.png",
      "/images/catalog/mezuniyet/mezuniyet-6.png",
      "/images/catalog/mezuniyet/mezuniyet-7.png",
      "/images/catalog/mezuniyet/mezuniyet-8.png"
    ]
  }
];

export const services: Service[] = [
  {
    iconType: "ring",
    title: "Gelin Makyajı",
    description: "Özel gününüzde en güzel halinizle parlamanız için deneme seansı dahil profesyonel gelin makyajı. 16 saat kalıcı formüller ve doğal ışıltı.",
    price: "Fiyat Teklifi Alın",
    image: "/images/catalog/gelin/gelin-10.png",
    tag: "İmza Hizmet",
  },
  {
    iconType: "sparkles",
    title: "Özel Gün & Davet",
    description: "Nişan, kına gecesi, mezuniyet, gala ve tüm özel kutlamalarınız için yüz hatlarınıza özel kişiselleştirilmiş makyaj tasarımı.",
    price: "Fiyat Teklifi Alın",
    image: "/images/catalog/ozel-gun/ozel-gun-1.png",
    tag: "Gece & Davet",
  },
  {
    iconType: "camera",
    title: "Profesyonel Çekim & TV",
    description: "Moda katalogları, dizi setleri, reklam çekimleri ve video prodüksiyonları için stüdyo ışığına optimize makyaj uygulaması.",
    price: "Fiyat Teklifi Alın",
    image: "/images/catalog/tv-reklam/tv-reklam-1.jpeg",
    tag: "Prodüksiyon & Set",
  },
  {
    iconType: "brush",
    title: "Editorial & Moda Çekimi",
    description: "Moda dergileri, lookbook ve podyum konseptlerine özel yüksek pigmentli, sanatsal ve modern makyaj uygulamaları.",
    price: "Fiyat Teklifi Alın",
    image: "/images/catalog/editorial/editorial-5.jpeg",
    tag: "Moda & Sanat",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Ayşe Yılmaz",
    role: "Gelin",
    text: "Düğünümde hayal ettiğimden çok daha taze ve zarif görünüyordum. Ağladığım anlarda bile makyajım kesinlikle bozulmadı. Ebru Hanım'ın sakinleştirici enerjisi ve profesyonelliği paha biçilmezdi.",
    initials: "AY",
    stars: 5,
  },
  {
    name: "Zeynep Kaya",
    role: "Moda Fotoğrafçısı & Model",
    text: "Moda çekimlerimizde ışık altında en ufak bir parlama ya da çizgilere dolma yaşanmıyor. Cilt dokusunu kaybetmeden porselen pürüzsüzlüğü yakalamadaki ustalığı olağanüstü.",
    initials: "ZK",
    stars: 5,
  },
  {
    name: "Elif Demir",
    role: "Nişan Daveti",
    text: "Nişan törenim için kendisiyle çalıştık. Abartıdan uzak ama son derece dikkat çekici bir ışıltı kazandırdı. Gece boyunca herkes fondötenimin ve göz makyajımın kime ait olduğunu sordu.",
    initials: "ED",
    stars: 5,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "cilt-bakimi-rehberi",
    title: "Makyaj Öncesi Kapsamlı Cilt Bakım Rehberi: Pürüzsüz Bir Zemin Oluşturma",
    excerpt: "En pahalı fondöten bile nemsiz veya soyulan bir ciltte pürüzsüz duramaz. Makyaj sanatçısı gözüyle profesyonel cilt hazırlığı protokolü ve en etkili adımlar.",
    content: `
## Kusursuz Makyajın Temeli: Cildin Hazırlanması

Makyaj sanatçıları olarak backstage'de ve gelin hazırlıklarında vaktimizin neredeyse üçte birini cildi hazırlamaya ayırırız. Çünkü tuval ne kadar pürüzsüz, nemli ve esnek olursa, üzerine sürülen ten ürünü de o kadar az ihtiyaç duyar ve tenle o denli bütünleşir.

Cildinizin yorgun, nemsiz ya da pul pul olduğu günlerde uygulanan makyaj kısa sürede gözeneklere dolar, çizgileri belirginleştirir ve pudralı yapay bir görüntüye yol açar. Bu rehberde, makyajınızın gün boyu ilk anki tazeliğinde kalmasını sağlayacak 5 adımlı profesyonel hazırlık sürecini inceliyoruz.

### 1. Çift Aşamalı ve Nazik Temizlik

Sabah uygulayacağınız makyaj öncesinde gece boyu cildin ürettiği fazla sebumu ve gece kremi artıklarını arındırmak şarttır. Ancak cildi kurutacak sert köpüklerden kaçınmalısınız.

- **Kuru ve nemsiz ciltler**: Süt bazlı ya da nemlendirici gliserin içeren nazik temizleme jelleri kullanmalıdır.
- **Karma ve yağlı ciltler**: Çay ağacı ya da hafif salisilik asit içeren köpürmeyen jellerle T bölgesini arındırmalıdır.
- **Hassas ciltler**: Termal su bazlı durulanmayan misel sular ile cildi ovalamadan temizlemelidir.

### 2. Mikro Eksfoliasyon ile Ölü Hücrelerden Arınma

Ten makyajında en sık karşılaşılan sorun burun kenarları ve alın bölgesindeki kabuklanmalardır. Haftada 1-2 kez uygulayacağınız hafif enzim peelingler veya laktik asitli pedler, fondötenin pul pul görünmesini tamamen engeller. Tanecikli sert peelinglerden uzak durun; tanecikler cildi çizebilir ve kızarıklık yaratabilir.

### 3. Katmanlı Nem Bombası: Tonik ve Serum Protokolü

Cildin nemi hapsedebilmesi için hafif molekülden yoğun moleküle doğru bir sıralama izlenmelidir:

- **Nemlendirici Mist / Tonik**: Alkol içermeyen, gül suyu veya centella asiatica içerikli bir sprey ile cilde ilk nem tabakasını verin.
- **Hyalüronik Asit Serumu**: Cilt hafif nemliyken uygulayın. Kendi ağırlığının 1000 katı su tutan hyalüronik asit, teni içten dolgunlaştırarak ince çizgileri kamufle eder.
- **Niacinamide (B3 Vitamini)**: Gözenek görünümünü sıkılaştırır ve gün içi yağlanmayı dengeler.

### 4. Cilt Tipine Göre Bariyer Koruyucu Nemlendirici

Nemlendiriciyi sürerken parmak uçlarınızla yukarı doğru nazik masaj hareketleri uygulayın. Kan dolaşımını hızlandırmak cilde anında doğal bir pembe ışıltı kazandırır:

- **Yağlı / Karma ciltler**: Su bazlı jel kremler (oil-free) tercih etmelidir.
- **Normal / Kuru ciltler**: Seramid ve skualen zengin hafif losyonlar kullanmalıdır.
- **Göz Çevresi Bakımı**: Göz altı kapatıcısının çizgilere dolmaması için kafein ve peptit içeren hafif bir göz kremini yüzük parmağınızla tamponlayarak uygulayın.

### 5. Görünmez Kalkan: SPF ve Makyaj Bazı Uyumu

Güneş koruyucunuzun fondöteninizle uyumu hayati önem taşır. Eğer su bazlı bir fondöten kullanacaksanız, su bazlı ve hafif yapılı kimyasal veya hibrit bir güneş koruyucu tercih edin. Nemlendirici ve güneş kremi sürüldükten sonra fondötene geçmeden önce en az 3-4 dakika beklemek ürünlerin cilde oturması için altın kuraldır.

> Profesyonel Tavsiye: Nemlendiriciyi uyguladıktan hemen sonra fondötene geçmek, ürünlerin birbiriyle karışıp kaymasına (pilling) neden olur. Cildinize her katman arasında nefes alacak birkaç dakika tanıyın.
    `,
    image: "/images/blog/skincare.jpg",
    date: "10 Ekim 2026",
    tag: "Cilt Bakımı",
    readTime: "6 dk",
    author: "Ebru Atik",
    authorTitle: "Profesyonel Makyaj Sanatçısı",
    authorAvatar: "/ebru.png",
  },
  {
    id: "2026-makyaj-trendleri",
    title: "2026 Güzellik Trendleri: Doğal Işıltı, Monokrom Tonlar ve Yumuşak Kontür",
    excerpt: "Ağır filtre etkili mat makyajların devri tamamen kapandı. Bu sezon podyumlardan sokak stiline damga vuran minimalist ve ışıltılı trendleri keşfedin.",
    content: `
## 2026 Makyajında Yeni Çağ: Çabasız Zarafet

Makyaj dünyası son yılların en ferah ve taze dönemini yaşıyor. Ağır, maske hissi veren kapatıcılar ve keskin yüz kontürleri yerini cildin kendi dokusunu kucaklayan "skin-first" (önce cilt) felsefesine bıraktı. 2026 yılında podyumlarda gördüğümüz görünümlerin ortak noktası: sağlıklı, nefes alan ve hafif ışıltılı bir duruş.

İşte bu sezon makyaj çantanıza dahil etmeniz gereken en önemli stil kodları ve uygulama ipuçları:

### 1. Cam Cilt Etkisi (Cloud Skin & Glazed Finish)

Aşırı yağlı veya yapışkan bir parlaklık yerine, saten bitişli ve içten gelen bir aydınlık trendin kalbinde yer alıyor.

- Fondöteninizi tek başına sürmek yerine içine 1 damla sıvı aydınlatıcı veya skualen yağı karıştırarak uygulayın.
- Pudrayı tüm yüze değil, sadece burun kanatları ve alın ortası gibi kontrolsüz parlayan noktalara incecik bir fırçayla kondurun.
- Yanak elmacık kemiklerinde doğal ışık yansıması bırakın.

### 2. Yumuşak Monokrom Pembe & Şeftali Harmonisi

Dudak, yanak ve göz kapaklarında aynı renk ailesinin kullanılması hem yüz bütünlüğü sağlıyor hem de genç ve dinamik bir hava katıyor.

- **Toz Pembe & Blush Tonları**: Özellikle açık ve buğday tenlerde anında dinlenmiş bir canlılık yaratıyor. Çok amaçlı krem allıkları parmak uçlarınızla hem elmacık kemiklerinize hem de göz kapaklarınıza hafifçe yayabilirsiniz.
- **Sıcak Şeftali & Terracotta**: Bronz ve esmer tenlerde güneşte hafif yanmış romantik bir sıcaklık sağlıyor.

### 3. Fırçalanmış ve Doldurulmamış Doğal Kaşlar

Kalıp gibi çizilmiş, koyu boyalarla içi doldurulmuş kaşlar artık tamamen geride kaldı. 2026 kaş trendi:

- Şeffaf veya hafif renkli sabitleyici jel ile yukarı doğru taranmış kıllar.
- Sadece varsa boşluklara mikro uçlu kalemlerle tek tek kıl çizimi yapmak.
- Kaşın başlangıç noktasını daima yumuşak ve şeffaf bırakmak.

### 4. Cam Dudaklar (Glossy & Lip Oil Dokusu)

Dudakları kurutan mat likit rujların yerini besleyici lip oil'ler ve cam gibi parlayan nemlendirici parlatıcılar aldı. Doğal dudak renginizden yarım ton koyu bir dudak kalemi ile hafif çerçeve çizip, ortasını nemlendirici bir parlatıcıyla doldurmak dudakları zahmetsizce daha dolgun gösteriyor.

> Hatırlatma: Trendler bir rehberdir, kural değil. Yüzünüzün anatomisine ve kişisel tarzınıza uyan tonları seçmek daima en iyi sonucu verir.
    `,
    image: "/images/blog/trends.jpg",
    date: "5 Ekim 2026",
    tag: "Trendler",
    readTime: "5 dk",
    author: "Ebru Atik",
    authorTitle: "Profesyonel Makyaj Sanatçısı",
    authorAvatar: "/ebru.png",
  },
  {
    id: "gelin-makyaji-ipuclari",
    title: "Kusursuz Gelin Makyajı İçin 10 Altın Kural: Düğün Günü Rehberi",
    excerpt: "Gözyaşlarına, sarılmalara ve flaş ışıklarına 16 saat boyunca meydan okuyan, fotoğraflarda zamansız duran kusursuz bir gelin makyajının tüm sırları.",
    content: `
## Hayatınızın En Özel Gününde Zamansız Bir Güzellik

Düğün gününüzde çekilen fotoğraflar ve videolar on yıllar sonra da albümlerinizde yaşayacak. Bu nedenle gelin makyajında en temel prensip "zamansızlık"tır. 20 yıl sonra fotoğraflarınıza baktığınızda 'O dönem bu modaydı ama bana hiç uymamış' demek yerine, 'Ne kadar zarif ve kendim gibi görünüyormuşum' demelisiniz.

Bir gelin makyajı hem gün ışığında doğal durmalı, hem akşam loş ışıkta belirgin olmalı, hem de flaşlı stüdyo çekimlerinde parlamamalıdır. İşte yüzlerce gelinle çalışarak edindiğim tecrübelerden derlediğim 10 altın kural:

### 1. Prova Makyajını Asla İhmal Etmeyin

Düğünden en az 4-6 hafta önce mutlaka gelin makyajı provası yapın. Provaya gelirken gelinliğinizin yakasını andıran beyaz bir üst giymek ve saç modelinizin genel silüetini bilmek, makyajın bütünlüğünü değerlendirmenizi sağlar. Prova günü makyajla birkaç saat geçirerek kalıcılığını kendi cildinizde test edin.

### 2. Düğün Öncesi Cilt Bakım Takvimi

Düğünden 1 hafta önce asla yeni bir kimyasal peeling, lazer veya daha önce denemediğiniz cilt bakım ürününü denemeyin. Beklenmedik bir alerji veya kızarıklık riski almamalısınız. Düzenli su tüketimi ve nem maskeleri son haftanın en güvenli dostudur.

### 3. Flaş Işığına Karşı HD ve Talk-Free Ürünler

Fotoğrafçıların güçlü flaşları, içinde yüksek oranda silika veya titanyum dioksit bulunan beyaz transparan pudralarda "flashback" (yüzde beyaz tebeşir lekesi) etkisi yaratır. Profesyonel HD formüllü ve mikro öğütülmüş pudralar bu riskin önüne geçer.

### 4. Katmanlı ve Suya Dayanıklı Göz Makyajı

Düğün duygusal anlarla doludur. Nikah anında dökülen mutluluk gözyaşları makyajınızı riske atmamalıdır:

- Göz kapağına mutlaka matlaştırıcı ve renk eşitleyici far bazı uygulanmalıdır.
- Kirpik dipleri suya dayanıklı jel eyeliner ile sabitlenmelidir.
- Maskara kesinlikle waterproof (su geçirmez) olmalıdır.

### 5. Doğal Demet Kirpik Tercihi

Ağır şerit kirpikler göz kapağını aşağı çekebilir ve fotoğraflarda yapay bir gölge oluşturabilir. Bunun yerine gözün dış köşelerine doğru yoğunlaşan tekli ipek demet kirpikler kullanmak, bakışlara hem derinlik kazandırır hem de ağırlık hissi yaratmaz.

### 6. Ruj Seçimi ve Dudak Kalıcılığı

Öpüşmeler, kadehler ve yemek sonrasında rujunuzun bozulmaması için:

- Dudak çerçevesi ve içi doğal nude-pembe bir dudak kalemi ile doldurulmalıdır.
- Üzerine uzun süre kalıcı saten ruj uygulanmalı, fazlalık peçeteyle alınıp hafifçe sabitlenmelidir.
- Çantanızda mutlaka aynı ruj ve dudak kalemi bulunmalıdır.

### 7. Yumuşak Boyun ve Dekolte Eşitlemesi

Yüz makyajınız kusursuz olsa bile dekolte ve boyun bölgenizle renk farkı varsa fotoğraflarda dikkat çeker. Boyun, omuz başları ve köprücük kemiklerine hafif ışıltılı ve bulaşmayan bir vücut losyonu ile ten uyumu yakalanmalıdır.

### 8. Sabitleme Spreyinin Gücü

Makyajın katmanlarını birbirine eritip doğal cilt dokusuna dönüştüren ve terlemeye karşı direnç kazandıran profesyonel sabitleme spreyi, gelin makyajının son ve vazgeçilmez mührüdür.

### 9. Gelin Çantası Acil Kurtarma Kiti

Düğün günü yanınızda bulundurmanız gereken minik makyaj çantası:
- Yağ emici matlaştırıcı mendiller (pudra sürmeden önce parlamayı almak için)
- Dudak kalemi ve nemlendirici rujunuz
- Minik bir tırnak törpüsü ve pamuk çubuklar

### 10. Düğün Sabahında Zaman Yönetimi

Gelin makyajı için en az 1 saat 45 dakika ayrılmalıdır. Aceleye gelmeyen, müzik eşliğinde keyifle yapılan bir hazırlık sabahı, günün geri kalanındaki modunuzu belirler.
    `,
    image: "/images/blog/bridal-tips.jpg",
    date: "28 Eylül 2026",
    tag: "Gelin Makyajı",
    readTime: "8 dk",
    author: "Ebru Atik",
    authorTitle: "Profesyonel Makyaj Sanatçısı",
    authorAvatar: "/ebru.png",
  },
];

export function getBlogPost(id: string): BlogPost | undefined {
  return blogPosts.find((post) => post.id === id);
}

export function getRelatedPosts(currentId: string, count: number = 2): BlogPost[] {
  return blogPosts.filter((post) => post.id !== currentId).slice(0, count);
}
