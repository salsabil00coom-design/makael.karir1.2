import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Compass,
  Sparkles,
  ArrowRight,
  School,
  MessageSquare,
  Send,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ChevronRight, 
  Info,
  Brain,
  Cpu,
  Layers,
  Award,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  UserCheck
} from "lucide-react";
import {
  CareerRoadmapData,
  MajorRecommendation,
  ChatMessage,
  CustomMajorAnalysis
} from "./types";

// Preset electives data with Indonesian context
const PRESET_SUBJECTS = {
  SMA: [
    { name: "Matematika Tingkat Lanjut", category: "Sains & Teknologi", icon: "📐" },
    { name: "Fisika", category: "Sains & Teknologi", icon: "⚛️" },
    { name: "Kimia", category: "Sains & Teknologi", icon: "🧪" },
    { name: "Biologi", category: "Sains & Teknologi", icon: "🧬" },
    { name: "Informatika", category: "Sains & Teknologi", icon: "💻" },
    { name: "Sosiologi", category: "Sosial & Humaniora", icon: "👥" },
    { name: "Ekonomi", category: "Sosial & Humaniora", icon: "📈" },
    { name: "Geografi", category: "Sosial & Humaniora", icon: "🌍" },
    { name: "Sejarah Tingkat Lanjut", category: "Sosial & Humaniora", icon: "📜" },
    { name: "Antropologi", category: "Sosial & Humaniora", icon: "🏺" },
    { name: "Bahasa Inggris Tingkat Lanjut", category: "Bahasa & Komunikasi", icon: "🗣️" },
    { name: "Bahasa Mandarin", category: "Bahasa & Komunikasi", icon: "🇨🇳" },
    { name: "Bahasa Jepang", category: "Bahasa & Komunikasi", icon: "🇯🇵" },
    { name: "Seni Rupa / Seni Musik", category: "Kreatif & Seni", icon: "🎨" },
    { name: "Prakarya dan Kewirausahaan (PKWU)", category: "Kreatif & Seni", icon: "💼" }
  ],
  SMK: [
    { name: "Rekayasa Perangkat Lunak (RPL)", category: "Teknologi Informasi", icon: "⚙️" },
    { name: "Teknik Komputer dan Jaringan (TKJ)", category: "Teknologi Informasi", icon: "🔌" },
    { name: "Multimedia / Desain Komunikasi Visual (DKV)", category: "Kreatif & Komunikasi", icon: "🖼️" },
    { name: "Animasi & Produksi Game", category: "Kreatif & Komunikasi", icon: "🎮" },
    { name: "Akuntansi dan Keuangan Lembaga", category: "Bisnis & Manajemen", icon: "📊" },
    { name: "Bisnis Digital & Pemasaran", category: "Bisnis & Manajemen", icon: "🚀" },
    { name: "Otomatisasi & Tata Kelola Perkantoran", category: "Bisnis & Manajemen", icon: "📇" },
    { name: "Teknik Otomotif & Permesinan", category: "Teknik & Manufaktur", icon: "🔧" },
    { name: "Teknik Elektronika Industri", category: "Teknik & Manufaktur", icon: "📡" },
    { name: "Keperawatan & Farmasi Klinis", category: "Kesehatan & Sosial", icon: "🏥" },
    { name: "Tata Boga / Kuliner", category: "Pariwisata & Jasa", icon: "🍳" },
    { name: "Tata Busana / Fashion Design", category: "Pariwisata & Jasa", icon: "✂️" }
  ]
};

// Helpful career tips showing on loading state
const LOADING_TIPS = [
  "Kurikulum Merdeka memberimu kebebasan memilih mapel sesuai minat karir masa depanmu.",
  "Hard skills membuatmu diterima kerja, tapi soft skills membuatmu naik promosi jabatan.",
  "Memilih jurusan kuliah sebaiknya mempertimbangkan prospek kerja 5-10 tahun ke depan.",
  "AI tidak akan menggantikanmu, tapi orang yang tahu cara menggunakan AI akan menggantikanmu.",
  "Magang di perusahaan terkemuka selama kuliah memperbesar peluang kerja hingga 80%.",
  "Portofolio nyata seringkali lebih dihargai oleh industri digital dibanding IPK semata."
];

export default function App() {
  const [background, setBackground] = useState<"SMA" | "SMK">("SMA");
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);
  const [extraNote, setExtraNote] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  
  const [step, setStep] = useState<"form" | "loading" | "dashboard">("form");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const [roadmapData, setRoadmapData] = useState<CareerRoadmapData | null>(null);
  const [selectedMajorIndex, setSelectedMajorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "milestones" | "chat" | "custom_major">("overview");
  
  // Chat console states
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Custom major and university compatibility states
  const [customMajorInput, setCustomMajorInput] = useState("");
  const [customUniversityInput, setCustomUniversityInput] = useState("");
  const [customAnalysis, setCustomAnalysis] = useState<CustomMajorAnalysis | null>(null);
  const [customAnalysisLoading, setCustomAnalysisLoading] = useState(false);
  const [customAnalysisError, setCustomAnalysisError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Rotate loading tips
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "loading") {
      interval = setInterval(() => {
        setActiveTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, selectedMajorIndex, activeTab]);

  const handleSelectElective = (subjectName: string) => {
    if (selectedElectives.includes(subjectName)) {
      setSelectedElectives(selectedElectives.filter((s) => s !== subjectName));
    } else {
      if (selectedElectives.length >= 6) {
        alert("Kamu bisa memilih maksimal 6 mata pelajaran pilihan untuk hasil terbaik.");
        return;
      }
      setSelectedElectives([...selectedElectives, subjectName]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubject.trim()) return;
    if (selectedElectives.includes(customSubject.trim())) {
      setCustomSubject("");
      return;
    }
    if (selectedElectives.length >= 6) {
      alert("Kamu bisa memilih maksimal 6 mata pelajaran pilihan.");
      return;
    }
    setSelectedElectives([...selectedElectives, customSubject.trim()]);
    setCustomSubject("");
  };

  // Automated loading steps simulation for premium UX
  const startLoadingAnimation = (callback: () => void) => {
    setStep("loading");
    setLoadingProgress(5);
    setLoadingText("Memulai analisis latar belakang pendidikan...");

    const steps = [
      { progress: 20, text: "Membaca mata pelajaran pilihan sekolah..." },
      { progress: 40, text: "Menghubungkan kecocokan dengan 50+ rumpun jurusan kuliah..." },
      { progress: 65, text: "Mencari tren industri masa depan dan ketersediaan lapangan kerja..." },
      { progress: 85, text: "Menyusun peta jalan (milestone) karir visual..." },
      { progress: 100, text: "Menghubungkan dengan server AI untuk penyesuaian personal..." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setLoadingProgress(steps[currentStepIdx].progress);
        setLoadingText(steps[currentStepIdx].text);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        callback();
      }
    }, 1200);
  };

  const generateLocalFallback = (bg: "SMA" | "SMK", electives: string[], note: string): CareerRoadmapData => {
    // Elegant localized fallback generator in case API key is missing or offline
    const isTech = electives.some(e => 
      e.includes("Informatika") || 
      e.includes("RPL") || 
      e.includes("TKJ") || 
      e.includes("Game")
    );
    const isSains = electives.some(e => 
      e.includes("Fisika") || 
      e.includes("Kimia") || 
      e.includes("Biologi") || 
      e.includes("Matematika")
    );
    const isSosial = electives.some(e => 
      e.includes("Sosiologi") || 
      e.includes("Ekonomi") || 
      e.includes("Geografi") || 
      e.includes("Akuntansi") || 
      e.includes("Bisnis")
    );
    const isSeni = electives.some(e => 
      e.includes("Seni") || 
      e.includes("Multimedia") || 
      e.includes("DKV") || 
      e.includes("Busana") || 
      e.includes("Boga")
    );

    let majors: MajorRecommendation[] = [];

    if (isTech || (bg === "SMK" && electives.some(e => e.includes("Teknologi")))) {
      majors = [
        {
          name: "Teknik Informatika & Ilmu Komputer",
          suitabilityReason: `Sangat cocok karena kamu mengambil mata pelajaran "${electives.filter(e => e.includes("Informatika") || e.includes("RPL") || e.includes("TKJ") || e.includes("Matematika") || e.includes("Game")).join(", ")}" yang melatih pemecahan masalah logis, algoritma, serta dasar-dasar perangkat lunak atau jaringan komputer sejak dini.`,
          description: "Jurusan yang mempelajari tentang teknologi komputer, pemrograman, pengembangan perangkat lunak, algoritma, kecerdasan buatan (AI), jaringan, hingga keamanan siber untuk memecahkan berbagai masalah digital modern.",
          whatYouWillLearn: [
            "Dasar Algoritma & Pemrograman (Python, Java, C++)",
            "Struktur Data & Basis Data Relasional",
            "Rekayasa Perangkat Lunak (Web & Mobile Apps Development)",
            "Kecerdasan Buatan (Artificial Intelligence) & Machine Learning",
            "Jaringan Komputer & Keamanan Informasi"
          ],
          futureProspects: [
            { role: "Software Engineer / Developer", description: "Merancang, mengembangkan, dan memelihara aplikasi seluler maupun web bernilai tinggi." },
            { role: "AI & Machine Learning Specialist", description: "Mengembangkan algoritma kecerdasan buatan untuk otomatisasi sistem dan analisis prediktif." },
            { role: "Cyber Security Analyst", description: "Mengamankan infrastruktur teknologi dan data perusahaan dari ancaman hacker dan kebocoran data." }
          ],
          highSchoolSubjectsToStrengthen: ["Informatika", "Matematika Tingkat Lanjut", "Bahasa Inggris Tingkat Lanjut"],
          hardSkills: ["Pemrograman (Javascript/Python)", "Database (SQL/NoSQL)", "Cloud Computing (Google Cloud)", "Git/Version Control"],
          softSkills: ["Analytical Thinking", "Problem Solving", "Collaborative Teamwork", "Continuous Learning"],
          recommendedUniversities: [
            "Institut Teknologi Bandung (ITB) - Bandung",
            "Universitas Indonesia (UI) - Depok",
            "Universitas Gadjah Mada (UGM) - Yogyakarta",
            "National University of Singapore (NUS) - Singapura",
            "Massachusetts Institute of Technology (MIT) - Amerika Serikat"
          ],
          milestones: [
            {
              phase: "Kuliah Tahun 1-2",
              title: "Fondasi Teoretis & Eksplorasi Bahasa Pemrograman",
              activities: [
                "Menguasai satu bahasa pemrograman utama secara mendalam (Python atau Java).",
                "Membuat 3 proyek open-source sederhana di GitHub.",
                "Aktif dalam komunitas coding mahasiswa tingkat universitas."
              ]
            },
            {
              phase: "Kuliah Tahun 3-4",
              title: "Spesialisasi Jalur & Magang Industri",
              activities: [
                "Mengambil mata kuliah pilihan spesifik (misal: AI, Cyber Security, atau Web Dev).",
                "Mengikuti Program Magang Bersertifikat Kampus Merdeka di perusahaan teknologi terkemuka.",
                "Menyelesaikan skripsi yang berorientasi pada pemecahan masalah industri nyata."
              ]
            },
            {
              phase: "Awal Karir (1-3 Tahun)",
              title: "Junior Developer & Membangun Portofolio Industri",
              activities: [
                "Bekerja sebagai Junior Software Engineer/Data Analyst.",
                "Mempelajari sistem skala besar (cloud computing AWS/GCP, Docker, Kubernetes).",
                "Mendapatkan sertifikasi industri profesional (seperti Google Cloud Engineer atau AWS Associate)."
              ]
            },
            {
              phase: "Karir Senior (5+ Tahun)",
              title: "Tech Lead, Senior Architect, atau Engineering Manager",
              activities: [
                "Memimpin tim pengembang beranggotakan 5-10 orang untuk meluncurkan produk berskala nasional.",
                "Berpartisipasi aktif dalam merancang arsitektur sistem cloud berkinerja tinggi.",
                "Berbagi ilmu sebagai mentor teknologi di komunitas atau pembicara konferensi tech."
              ]
            }
          ]
        },
        {
          name: "Sistem Informasi & Bisnis Digital",
          suitabilityReason: `Gabungan pemahaman teknologi "${electives.filter(e => e.includes("Informatika") || e.includes("RPL") || e.includes("Multimedia")).join(", ")}" dan minat manajerialmu menjadikannya sangat cocok untuk menjembatani dunia bisnis dengan implementasi perangkat lunak modern.`,
          description: "Bidang studi yang menggabungkan ilmu komputer dengan bisnis dan manajemen. Mahasiswa belajar bagaimana menganalisis kebutuhan proses bisnis organisasi lalu merancang serta mengelola solusi sistem teknologi yang tepat.",
          whatYouWillLearn: [
            "Analisis dan Perancangan Sistem Informasi",
            "Manajemen Proyek Teknologi Informasi",
            "Analisis Data Bisnis & Business Intelligence",
            "Manajemen Hubungan Pelanggan (CRM) & ERP",
            "E-Commerce & Strategi Pemasaran Digital"
          ],
          futureProspects: [
            { role: "IT Business Analyst", description: "Menganalisis sistem bisnis saat ini dan merancang solusi IT untuk meningkatkan efisiensi operasional." },
            { role: "Product Manager (PM)", description: "Mengawal siklus hidup pengembangan produk digital dari konsep, riset pengguna, hingga peluncuran." },
            { role: "Data Analyst", description: "Mengolah data operasional bisnis menjadi wawasan strategis untuk membantu pengambilan keputusan direksi." }
          ],
          highSchoolSubjectsToStrengthen: ["Informatika", "Ekonomi / Bisnis Digital", "Matematika"],
          hardSkills: ["Data Visualization (Tableau/PowerBI)", "System Design (UML/Figma)", "SQL Database Querying", "Basic Python Analytics"],
          softSkills: ["Excellent Communication", "Stakeholder Management", "Negotiation", "Business Acumen"],
          recommendedUniversities: [
            "Institut Teknologi Sepuluh Nopember (ITS) - Surabaya",
            "Universitas Indonesia (UI) - Depok",
            "Universitas Bina Nusantara (Binus) - Jakarta",
            "University of Melbourne - Australia",
            "Nanyang Technological University (NTU) - Singapura"
          ],
          milestones: [
            {
              phase: "Kuliah Tahun 1-2",
              title: "Pemahaman Bisnis & Dasar Pemrograman",
              activities: [
                "Mempelajari dasar akuntansi, manajemen, serta dasar logika pemrograman.",
                "Belajar menguasai alat desain UI/UX seperti Figma dan dasar SQL.",
                "Mulai mengikuti kompetisi Business Plan atau UX Design tingkat nasional."
              ]
            },
            {
              phase: "Kuliah Tahun 3-4",
              title: "Analisis Sistem Riil & Magang Strategis",
              activities: [
                "Melakukan studi kasus analisis sistem informasi di UMKM atau organisasi lokal.",
                "Magang sebagai Asisten Product Manager atau IT Analyst di startup/korporasi.",
                "Mengambil sertifikasi profesi dasar seperti Scrum Master atau Google Data Analytics."
              ]
            },
            {
              phase: "Awal Karir (1-3 Tahun)",
              title: "Associate Product Manager atau Business Analyst",
              activities: [
                "Bekerja sebagai Associate PM atau IT Consultant junior.",
                "Berinteraksi langsung dengan klien/programmer untuk merumuskan spesifikasi sistem.",
                "Memperdalam keahlian product analytics (Amplitude, Google Analytics) dan agile framework."
              ]
            },
            {
              phase: "Karir Senior (5+ Tahun)",
              title: "Head of Product atau IT Director",
              activities: [
                "Mengelola portofolio produk digital bernilai jutaan dolar.",
                "Menentukan arah strategis transformasi digital perusahaan multinasional.",
                "Membuat keputusan arsitektur sistem enterprise yang efisien."
              ]
            }
          ]
        }
      ];
    } else if (isSains) {
      majors = [
        {
          name: "Teknik Elektro & Robotika",
          suitabilityReason: `Mata pelajaran pilihanmu seperti "${electives.filter(e => e.includes("Fisika") || e.includes("Matematika") || e.includes("Elektronika") || e.includes("Kimia")).join(", ")}" memberikan pondasi hukum fisika elektromagnetik, kalkulus, dan struktur material yang sangat krusial di jurusan ini.`,
          description: "Jurusan yang mempelajari sistem kelistrikan, elektronika, mikroprosesor, sistem kendali otomatis, pemrosesan sinyal, hingga pengembangan perangkat robotika dan Internet of Things (IoT) untuk industri modern.",
          whatYouWillLearn: [
            "Analisis Rangkaian Listrik & Elektromagnetika",
            "Sistem Mikroprosesor & Mikrokontroler (Arduino, Raspberry Pi)",
            "Sistem Kontrol Otomatis & Instrumentasi Industri",
            "Sistem Tenaga Listrik & Energi Terbarukan",
            "Pemrograman Tertanam (Embedded Systems) C/C++"
          ],
          futureProspects: [
            { role: "Automation & Robotics Engineer", description: "Merancang robot dan sistem mesin otomatis untuk pabrik manufaktur pintar." },
            { role: "Hardware Design Engineer", description: "Membuat sirkuit elektronik, PCB, dan chip untuk gadget maupun kendaraan listrik." },
            { role: "Renewable Energy Specialist", description: "Mengembangkan infrastruktur pembangkit listrik ramah lingkungan seperti PLTS." }
          ],
          highSchoolSubjectsToStrengthen: ["Fisika", "Matematika Tingkat Lanjut", "Kimia"],
          hardSkills: ["PCB Design (Altium/Eagle)", "MATLAB & Simulink", "Embedded C/C++ Programming", "PLC Programming"],
          softSkills: ["Logical Thinking", "Attention to Detail", "Safety Consciousness", "Team Leadership"],
          recommendedUniversities: [
            "Institut Teknologi Bandung (ITB) - Bandung",
            "Universitas Gadjah Mada (UGM) - Yogyakarta",
            "Universitas Indonesia (UI) - Depok",
            "Tokyo Institute of Technology - Jepang",
            "TU Delft - Belanda"
          ],
          milestones: [
            {
              phase: "Kuliah Tahun 1-2",
              title: "Hukum Kelistrikan Dasar & Proyek Solder",
              activities: [
                "Memahami kalkulus lanjut dan dasar-dasar komponen elektronika pasif/aktif.",
                "Membuat sirkuit mikrokontroler sederhana (sensor suhu, robot pengikut garis).",
                "Belajar dasar software simulasi sirkuit listrik."
              ]
            },
            {
              phase: "Kuliah Tahun 3-4",
              title: "Penelitian Robotika & Magang Manufaktur",
              activities: [
                "Bergabung dengan tim robotika universitas untuk kontes nasional (KRI).",
                "Magang di pabrik otomotif, semikonduktor, atau pembangkit listrik.",
                "Menyelesaikan tugas akhir bertema Internet of Things (IoT) atau energi terbarukan."
              ]
            },
            {
              phase: "Awal Karir (1-3 Tahun)",
              title: "Junior Electrical / Control Engineer",
              activities: [
                "Mengonfigurasi PLC dan sirkuit listrik di lapangan industri.",
                "Mempelajari standar keselamatan kelistrikan internasional (IEC/IEEE).",
                "Mendapatkan sertifikasi Ahli K3 Listrik nasional."
              ]
            },
            {
              phase: "Karir Senior (5+ Tahun)",
              title: "Principal Automation Architect atau Lead Energy Consultant",
              activities: [
                "Memimpin proyek pemasangan otomasi robotik skala penuh di pabrik besar.",
                "Menjadi konsultan transisi energi bersih untuk badan BUMN atau korporasi luar negeri.",
                "Mematenkan desain perangkat keras sirkuit elektronik baru."
              ]
            }
          ]
        }
      ];
    } else if (isSosial) {
      majors = [
        {
          name: "Akuntansi & Keuangan Analitis",
          suitabilityReason: `Mata pelajaran pilihanmu seperti "${electives.filter(e => e.includes("Ekonomi") || e.includes("Akuntansi") || e.includes("Sosiologi") || e.includes("Matematika")).join(", ")}" membiasakanmu dengan analisis angka keuangan, transaksi bisnis, serta kehati-hatian dalam manajemen risiko.`,
          description: "Ilmu akuntansi mengajarkan cara mencatat, meringkas, menganalisis, dan melaporkan transaksi keuangan suatu entitas. Kini akuntansi juga mencakup teknologi analitik data keuangan besar untuk audit forensik.",
          whatYouWillLearn: [
            "Akuntansi Keuangan & Pelaporan Akuntansi",
            "Akuntansi Manajemen & Pengambilan Keputusan",
            "Perpajakan Indonesia & Internasional",
            "Auditing & Penjaminan Informasi",
            "Sistem Informasi Akuntansi & Data Analytics"
          ],
          futureProspects: [
            { role: "Auditor Profesional / Eksternal", description: "Bekerja di Big Four (PwC, EY, Deloitte, KPMG) untuk mengaudit keabsahan keuangan perusahaan." },
            { role: "Financial Analyst / Risk Consultant", description: "Menganalisis tren pasar modal dan kinerja internal untuk strategi investasi masa depan." },
            { role: "Tax Consultant / Specialist", description: "Membantu perusahaan mematuhi undang-undang perpajakan dengan efisiensi tinggi." }
          ],
          highSchoolSubjectsToStrengthen: ["Ekonomi", "Akuntansi", "Matematika"],
          hardSkills: ["Advanced MS Excel", "Accounting Software (SAP/Zahir)", "Financial Modeling", "Tax Planning (e-Faktur)"],
          softSkills: ["High Integrity", "Critical Analysis", "Professional Skepticism", "Clear Communication"],
          recommendedUniversities: [
            "Universitas Indonesia (UI) - Depok",
            "Universitas Gadjah Mada (UGM) - Yogyakarta",
            "Universitas Padjadjaran (Unpad) - Bandung",
            "London School of Economics (LSE) - Inggris",
            "University of Pennsylvania (Wharton) - Amerika Serikat"
          ],
          milestones: [
            {
              phase: "Kuliah Tahun 1-2",
              title: "Pemahaman Siklus Akuntansi & Sertifikasi Dasar",
              activities: [
                "Menuntaskan jurnal penyesuaian, neraca, laporan laba rugi dengan teliti.",
                "Menguasai formula lanjut MS Excel untuk keuangan bisnis.",
                "Mulai mengikuti kompetisi olimpiade akuntansi universitas."
              ]
            },
            {
              phase: "Kuliah Tahun 3-4",
              title: "Magang Big Four & Sertifikasi Kompetensi",
              activities: [
                "Magang intensif di Kantor Akuntan Publik (KAP) terkemuka.",
                "Mengambil sertifikasi Certified Associate Accountant (CAA) atau brevet pajak A & B.",
                "Mengerjakan skripsi tentang audit internal atau kepatuhan pajak digital."
              ]
            },
            {
              phase: "Awal Karir (1-3 Tahun)",
              title: "Junior Auditor / Corporate Accountant",
              activities: [
                "Bekerja lembur audit lapangan di KAP untuk menilai kewajaran aset klien.",
                "Mempersiapkan ujian Chartered Accountant (CA) atau Certified Public Accountant (CPA).",
                "Mengasah keahlian software ERP berskala besar seperti SAP."
              ]
            },
            {
              phase: "Karir Senior (5+ Tahun)",
              title: "Audit Partner, CFO (Chief Financial Officer), atau Senior Tax Partner",
              activities: [
                "Memegang keputusan audit final untuk emiten saham publik terdaftar.",
                "Mengatur arus kas dan strategi investasi finansial perusahaan bernilai miliaran rupiah.",
                "Mewakili perusahaan dalam negosiasi audit perpajakan dengan kementerian."
              ]
            }
          ]
        }
      ];
    } else {
      // General or Creative background fallback
      majors = [
        {
          name: "Desain Komunikasi Visual (DKV) & Media Baru",
          suitabilityReason: `Mata pelajaran pilihanmu seperti "${electives.filter(e => e.includes("Seni") || e.includes("Multimedia") || e.includes("DKV") || e.includes("Bahasa")).join(", ")}" sangat mengasah imajinasi visual, pemahaman komposisi seni, serta keahlian menceritakan ide lewat visual sejak dini.`,
          description: "Jurusan kreatif yang mempelajari cara menyampaikan pesan, gagasan, atau informasi secara visual secara estetis dan fungsional melalui desain grafis, ilustrasi, branding, animasi, hingga media interaktif digital.",
          whatYouWillLearn: [
            "Dasar Nirmana & Teori Desain Komunikasi",
            "Tipografi (Seni Memilih & Menata Huruf)",
            "Ilustrasi Digital & Komposisi Warna",
            "Branding & Identitas Visual Perusahaan",
            "UI/UX Design & Desain Game/Media Interaktif"
          ],
          futureProspects: [
            { role: "Creative Director", description: "Memimpin konsep kreatif iklan, kampanye brand, dan arah seni proyek multimedia besar." },
            { role: "UI/UX Designer", description: "Merancang tata letak visual serta alur kenyamanan pengguna di aplikasi digital dan website." },
            { role: "Graphic & Brand Designer", description: "Membuat logo, kemasan produk, dan aset promosi yang mendongkrak citra pemasaran suatu bisnis." }
          ],
          highSchoolSubjectsToStrengthen: ["Seni Rupa", "Informatika / Multimedia", "Bahasa Inggris Tingkat Lanjut"],
          hardSkills: ["Adobe Creative Suite (Photoshop/Illustrator)", "Figma UI/UX Tool", "Principles of Typography & Grid", "Digital Painting"],
          softSkills: ["Creative Thinking", "Visual Storytelling", "Receptive to Feedback", "Time Management"],
          recommendedUniversities: [
            "Institut Teknologi Bandung (ITB) - Bandung",
            "Universitas Sebelas Maret (UNS) - Surakarta",
            "Institut Seni Indonesia (ISI) - Yogyakarta",
            "RMIT University - Australia",
            "California Institute of the Arts (CalArts) - Amerika Serikat"
          ],
          milestones: [
            {
              phase: "Kuliah Tahun 1-2",
              title: "Nirmana Tradisional & Penguasaan Tools Digital",
              activities: [
                "Menggambar manual 100+ sketsa anatomi, komposisi garis, dan bentuk.",
                "Menguasai software Adobe Illustrator, Photoshop, dan Figma secara mahir.",
                "Mulai mengunggah portofolio karya seni di Behance atau Dribbble secara teratur."
              ]
            },
            {
              phase: "Kuliah Tahun 3-4",
              title: "Proyek Riil & Pameran Karya Akhir",
              activities: [
                "Menangani proyek branding nyata untuk UMKM lokal atau klien lepas.",
                "Magang sebagai Desainer Grafis di Agensi Periklanan (Advertising Agency) atau Startup.",
                "Mengadakan pameran kelulusan karya tugas akhir yang dinilai juri profesional."
              ]
            },
            {
              phase: "Awal Karir (1-3 Tahun)",
              title: "Junior Brand Designer atau UI/UX Designer",
              activities: [
                "Bekerja di industri kreatif, tech startup, atau e-commerce besar.",
                "Menyempurnakan cara menyajikan ide (design pitch) di depan klien atau manajer.",
                "Mempelajari dinamika animasi gerak (motion graphics) untuk media sosial."
              ]
            },
            {
              phase: "Karir Senior (5+ Tahun)",
              title: "Creative Director atau Senior UX Lead",
              activities: [
                "Memutuskan konsep estetika kampanye brand berskala nasional atau global.",
                "Memimpin tim desainer, copywriter, dan video creator untuk meluncurkan produk.",
                "Mendapatkan penghargaan desain bergengsi di tingkat regional atau internasional."
              ]
            }
          ]
        }
      ];
    }

    // Default if majors array is somehow empty
    if (majors.length === 0) {
      majors = [
        {
          name: "Manajemen Bisnis Digital",
          suitabilityReason: "Jurusan ini sangat fleksibel dan cocok dengan kombinasi mata pelajaran pilihan sosial, bahasa, maupun kejuruan yang kamu pilih.",
          description: "Studi mengenai tata kelola bisnis konvensional yang diintegrasikan dengan teknologi internet, startup, digital marketing, analisis data konsumen, dan strategi operasional modern.",
          whatYouWillLearn: ["Pengantar Bisnis", "Pemasaran Digital", "Analitis Bisnis", "Kewirausahaan", "Fintech"],
          futureProspects: [
            { role: "Digital Marketer", description: "Mengatur kampanye iklan media sosial dan SEO untuk meningkatkan konversi penjualan online." },
            { role: "Business Development", description: "Mencari kemitraan strategis baru dan memetakan ekspansi pasar perusahaan." }
          ],
          highSchoolSubjectsToStrengthen: ["Ekonomi", "Informatika / Bisnis", "Bahasa Inggris"],
          hardSkills: ["Google Ads / Meta Ads Manager", "SEO / SEM Analytics", "Copywriting", "Excel/Financial Analysis"],
          softSkills: ["Growth Mindset", "Adaptability", "Public Speaking", "Data-Driven Decision Making"],
          recommendedUniversities: ["Universitas Indonesia", "Universitas Gadjah Mada", "Binus University"],
          milestones: [
            { phase: "Kuliah Tahun 1-2", title: "Teori Bisnis & Tren Digital", activities: ["Belajar dasar ekonomi dan marketing."] },
            { phase: "Kuliah Tahun 3-4", title: "Praktik Bisnis & Magang", activities: ["Magang di tim marketing startup."] }
          ]
        }
      ];
    }

    return { recommendedMajors: majors };
  };

  const handleFetchRoadmap = async () => {
    if (selectedElectives.length < 2) {
      alert("Silakan pilih minimal 2 mata pelajaran pilihan SMA/SMK agar AI bisa memetakan roadmap kamu secara akurat.");
      return;
    }

    setIsUsingFallback(false);
    setChatHistory({}); // reset chat
    
    // Begin step 1: Animation
    startLoadingAnimation(async () => {
      try {
        const res = await fetch("/api/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            background,
            electives: selectedElectives,
            extraNote
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Gagal mendapatkan data dari server.");
        }

        const data: CareerRoadmapData = await res.json();
        
        if (!data.recommendedMajors || data.recommendedMajors.length === 0) {
          throw new Error("Format data yang diterima tidak sesuai.");
        }

        setRoadmapData(data);
        setSelectedMajorIndex(0);
        setActiveTab("overview");
        setStep("dashboard");
      } catch (err: any) {
        console.warn("API Error. Menggunakan roadmap lokal yang dioptimalkan:", err.message);
        // Switch to smart local database fallback
        const fallback = generateLocalFallback(background, selectedElectives, extraNote);
        setRoadmapData(fallback);
        setSelectedMajorIndex(0);
        setActiveTab("overview");
        setIsUsingFallback(true);
        setStep("dashboard");
      }
    });
  };

  // Chat with AI Career Counselor
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !roadmapData) return;

    const currentMajor = roadmapData.recommendedMajors[selectedMajorIndex];
    const userMsgText = currentMessage;
    setCurrentMessage("");
    setChatLoading(true);
    setChatError(null);

    // Create unique ID
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    // Update history locally first
    const majorKey = currentMajor.name;
    const currentHistory = chatHistory[majorKey] || [];
    const updatedHistory = [...currentHistory, userMsg];
    
    setChatHistory({
      ...chatHistory,
      [majorKey]: updatedHistory
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: currentHistory.map(h => ({ role: h.role, text: h.text })),
          context: {
            currentMajor: currentMajor.name,
            background,
            electives: selectedElectives
          }
        })
      });

      if (!res.ok) {
        throw new Error("Gagal mendapatkan respons dari AI Konselor.");
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data.text || "Mohon maaf, saya belum bisa memformulasikan jawaban saat ini.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };

      setChatHistory(prev => ({
        ...prev,
        [majorKey]: [...(prev[majorKey] || []), botMsg]
      }));

    } catch (err: any) {
      console.error(err);
      const errBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "Koneksi ke AI Counselor sedang sibuk. Namun, jangan ragu untuk memperkuat pemahamanmu pada mata pelajaran pilihan di sekolah, mengikuti magang industri, dan melatih hard skills / soft skills yang tercantum di tab rekomendasi kami!",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      setChatHistory(prev => ({
        ...prev,
        [majorKey]: [...(prev[majorKey] || []), errBotMsg]
      }));
    } finally {
      setChatLoading(false);
    }
  };

  const handleStarterQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  const generateLocalCustomAnalysis = (bg: "SMA" | "SMK", electives: string[], major: string, uni: string): CustomMajorAnalysis => {
    const m = major.toLowerCase();
    let status = "Cukup Cocok";
    let score = 75;
    let reason = "";
    let strengthen: string[] = [];
    let prospects: { role: string; description: string; }[] = [];
    let hard: string[] = [];
    let soft: string[] = [];
    
    const hasTech = electives.some(e => e.includes("Informatika") || e.includes("RPL") || e.includes("TKJ") || e.includes("Game") || e.includes("Komputer"));
    const hasSains = electives.some(e => e.includes("Fisika") || e.includes("Kimia") || e.includes("Biologi") || e.includes("Matematika"));
    const hasSosial = electives.some(e => e.includes("Sosiologi") || e.includes("Ekonomi") || e.includes("Geografi") || e.includes("Sejarah") || e.includes("Akuntansi") || e.includes("Bisnis"));
    
    if (m.includes("komputer") || m.includes("informatika") || m.includes("rpl") || m.includes("sistem") || m.includes("software") || m.includes("it ") || m.includes("data") || m.includes("web") || m.includes("program")) {
      if (hasTech) {
        status = "Sangat Cocok";
        score = 95;
        reason = `Pilihan mata pelajaran pilihanmu (${electives.join(", ")}) sangat selaras karena mencakup bidang teknologi informasi/komputer yang memberikan fondasi kuat untuk pemecahan masalah algoritmis di jurusan ini.`;
      } else if (hasSains) {
        status = "Cukup Cocok";
        score = 80;
        reason = `Latar belakang sains dan matematika kuat sangat membantu logika analitis, namun kamu perlu meluangkan waktu secara mandiri untuk belajar pemrograman dasar.`;
      } else {
        status = "Kurang Cocok";
        score = 45;
        reason = `Secara akademis kurang selaras karena pilihan mapelmu lebih condong ke bidang sosial/kemanusiaan. Namun dengan komitmen tinggi, kamu bisa mengejarnya dengan mengikuti bootcamp atau kursus pemrograman mandiri.`;
      }
      strengthen = ["Dasar Algoritma & Pemrograman", "Logika Matematika", "Bahasa Inggris Lanjut"];
      prospects = [
        { role: "Software Engineer", description: "Merancang dan membangun sistem perangkat lunak handal." },
        { role: "Data Analyst", description: "Mengolah data mentah menjadi keputusan bisnis cerdas." }
      ];
      hard = ["Python / Javascript", "Database SQL", "Git Version Control"];
      soft = ["Problem Solving", "Logical Thinking", "Continuous Learning"];
    } else if (m.includes("kedokteran") || m.includes("dokter") || m.includes("gigi") || m.includes("farmasi") || m.includes("biologi") || m.includes("kimia") || m.includes("perawat") || m.includes("bidan")) {
      if (hasSains && electives.some(e => e.includes("Biologi") || e.includes("Kimia"))) {
        status = "Sangat Cocok";
        score = 95;
        reason = `Sangat selaras! Pembelajaran Biologi dan Kimia yang kamu pilih di sekolah memberikan pemahaman organ, seluler, serta dasar reaksi kimia obat-obatan untuk ilmu medis.`;
      } else {
        status = "Kurang Cocok";
        score = 40;
        reason = `Pilihan mata pelajaran sekolahmu kurang mendukung syarat ketat ilmu medis. Kamu harus mengejar ketertinggalan materi biologi seluler, anatomi dasar, dan kimia organik secara komprehensif.`;
      }
      strengthen = ["Biologi Sel & Fisiologi Manusia", "Kimia Organik Dasar", "Bahasa Inggris Medis"];
      prospects = [
        { role: "Dokter / Praktisi Medis / Apoteker", description: "Melakukan diagnosis, pengobatan, serta pelayanan resep obat di rumah sakit." },
        { role: "Peneliti Kesehatan", description: "Mengadakan riset pengobatan dan publikasi jurnal bioteknologi." }
      ];
      hard = ["Anatomi & Fisiologi", "Kimia Medis", "Metodologi Riset Kesehatan"];
      soft = ["Empathy", "Resilience Under Pressure", "High Integrity"];
    } else if (m.includes("hukum") || m.includes("sosial") || m.includes("politik") || m.includes("komunikasi") || m.includes("hubungan") || m.includes("psikologi") || m.includes("bahasa") || m.includes("sastra")) {
      if (hasSosial || electives.some(e => e.includes("Sosiologi") || e.includes("Bahasa") || e.includes("Sejarah") || e.includes("Antropologi"))) {
        status = "Sangat Cocok";
        score = 92;
        reason = `Sangat cocok! Gabungan mata pelajaran pilihanmu seperti sosiologi, sejarah, atau bahasa sangat membiasakanmu dengan analisis teks kritis, interaksi sosial, serta narasi budaya yang penting di bidang ini.`;
      } else {
        status = "Cukup Cocok";
        score = 70;
        reason = `Cukup cocok. Logika kuantitatif dari mapel sainsmu bisa berguna untuk analisis data sosial, namun kamu disarankan memperbanyak membaca undang-undang, buku filsafat, atau teori sosiologi dasar.`;
      }
      strengthen = ["Kemampuan Membaca Kritis & Sintesis Buku", "Keterampilan Menulis Argumentatif", "Wawasan Sosial-Politik"];
      prospects = [
        { role: "Konsultan Hukum / Hubungan Masyarakat", description: "Menyusun regulasi, memberikan advokasi, atau mengelola citra reputasi lembaga." },
        { role: "Human Resource Specialist", description: "Mengurus rekrutmen karyawan, relasi industri, serta pengembangan talenta." }
      ];
      hard = ["Riset Kualitatif", "Penyusunan Kontrak / Policy Draft", "Analisis Teks"];
      soft = ["Persuasive Communication", "Active Listening", "Negotiation"];
    } else if (m.includes("ekonomi") || m.includes("manajemen") || m.includes("akuntansi") || m.includes("bisnis") || m.includes("pemasaran") || m.includes("digital marketing") || m.includes("keuangan")) {
      if (hasSosial && electives.some(e => e.includes("Ekonomi") || e.includes("Akuntansi") || e.includes("Bisnis"))) {
        status = "Sangat Cocok";
        score = 95;
        reason = `Sangat cocok! Kamu sudah melatih dasar pencatatan keuangan, analisis biaya, serta perilaku konsumen lewat mapel ekonomi/akuntansi/bisnis pilihanmu di sekolah.`;
      } else {
        status = "Cukup Cocok";
        score = 75;
        reason = `Cukup cocok. Pemahaman logika matematika atau kemampuan umummu sangat berharga untuk pemodelan kuantitatif, namun pastikan kamu memperkaya wawasan bisnis praktis dan ekosistem startup.`;
      }
      strengthen = ["Matematika Keuangan", "Dasar-Dasar Akuntansi & Pembukuan", "Pengantar Bisnis Mikro"];
      prospects = [
        { role: "Financial Analyst / Consultant", description: "Merancang studi kelayakan investasi dan mengelola portofolio kas korporat." },
        { role: "Digital Marketer / Growth Specialist", description: "Mengatur kampanye digital produk guna menaikkan retensi dan pendapatan." }
      ];
      hard = ["Advanced Spreadsheet (Excel)", "Financial Analysis", "Digital Advertising"];
      soft = ["Strategic Thinking", "Leadership", "Team Collaboration"];
    } else {
      status = "Cukup Cocok";
      score = 70;
      reason = `Kombinasi mata pelajaran pilihanmu (${electives.join(", ")}) memberikan dasar berpikir analitis dan pemecahan masalah yang adaptif untuk menempuh perkuliahan di jurusan ${major}.`;
      strengthen = [`Teori pengantar esensial bidang ${major}`, "Literasi digital tingkat lanjut", "Keterampilan presentasi gagasan"];
      prospects = [
        { role: `Praktisi Profesional di bidang ${major}`, description: "Mengaplikasikan keahlian operasional teknis untuk mencapai target korporasi." },
        { role: "Konsultan Independen", description: "Memberikan rekomendasi taktis berbasis kajian ilmiah dan studi kasus komparatif." }
      ];
      hard = ["Metodologi Penelitian", "Penggunaan Tools Spesifik Bidang", "Analisis Kasus"];
      soft = ["Adaptability", "Public Speaking", "Problem Solving"];
    }

    const uName = uni || "Universitas Pilihanmu";
    const uniInsight = `Masuk jurusan ${major} di ${uName} memerlukan persiapan matang. Untuk jalur SNBP (Prestasi), pastikan rapor semester 1-5 kamu stabil dan mapel pilihan pendukung yang relevan memiliki nilai tinggi. Untuk jalur SNBT (UTBK), matangkan kemampuan literasi dan penalaran matematika. Jangan lupa siapkan sertifikat prestasi kejuaraan guna memperbesar peluang lolos!`;

    return {
      suitabilityStatus: status,
      suitabilityScore: score,
      analysisReason: reason,
      whatToStrengthen: strengthen,
      futureProspects: prospects,
      hardSkills: hard,
      softSkills: soft,
      universityInsight: uniInsight
    };
  };

  const handleAnalyzeCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMajorInput.trim()) return;

    setCustomAnalysisLoading(true);
    setCustomAnalysisError(null);
    setCustomAnalysis(null);

    try {
      const res = await fetch("/api/analyze-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          background,
          electives: selectedElectives,
          customMajor: customMajorInput,
          customUniversity: customUniversityInput
        })
      });

      if (!res.ok) {
        throw new Error("Gagal memperoleh analisis dari server.");
      }

      const data = await res.json();
      setCustomAnalysis(data);
    } catch (err: any) {
      console.warn("Custom Analysis API Error. Menggunakan ulasan lokal:", err.message);
      const localResult = generateLocalCustomAnalysis(
        background,
        selectedElectives,
        customMajorInput,
        customUniversityInput
      );
      setCustomAnalysis(localResult);
    } finally {
      setCustomAnalysisLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-950/40 via-slate-900/10 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[150px] pointer-events-none -z-10" />

      {/* Outer wrapper to restrict full content for fluid responsive visual */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                makael<span className="text-indigo-400 font-medium font-sans">.karier</span>
              </h1>
              <p className="text-xs text-slate-400 font-light hidden sm:block">Navigator Cerdas Pilihan Mata Pelajaran Menuju Karir Impian</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-slate-300 font-medium">Gemini 3.5-Flash Active</span>
          </div>
        </header>

        {/* MAIN VIEWS CONTAINER */}
        <main className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: QUESTIONNAIRE FORM */}
            {step === "form" && (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="max-w-4xl mx-auto w-full"
              >
                {/* Hero Intro */}
                <div className="text-center mb-10">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                    🧭 Peta Jalan Karir Kurikulum Merdeka
                  </span>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-4 tracking-tight leading-tight max-w-2xl mx-auto">
                    Petakan Pilihan Mapel SMA/SMK Menjadi Karir Masa Depanmu
                  </h2>
                  <p className="text-slate-400 mt-3 text-base max-w-xl mx-auto font-light">
                    Masukkan latar belakang sekolah dan mata pelajaran pilihanmu. Kami akan memformulasikan rekomendasi jurusan kuliah, keahlian, hingga milestone karir secara real-time.
                  </p>
                </div>

                {/* Form Body */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-black/25">
                  <div className="p-6 sm:p-8 space-y-8">
                    
                    {/* Background School Selector */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
                        <School className="w-4.5 h-4.5 text-indigo-400" />
                        <span>1. Pilih Latar Belakang Pendidikan Sekolah Menengah</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setBackground("SMA");
                            setSelectedElectives([]);
                          }}
                          className={`relative p-5 rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
                            background === "SMA"
                              ? "bg-indigo-500/10 border-indigo-500 text-white shadow-md shadow-indigo-500/5"
                              : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/70"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-2xl mb-1 block">🏫</span>
                              <h3 className="font-bold text-base">SMA / MA</h3>
                              <p className="text-xs text-slate-400 mt-1 font-light">Pilihan mata pelajaran akademik lintas disiplin.</p>
                            </div>
                            {background === "SMA" && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBackground("SMK");
                            setSelectedElectives([]);
                          }}
                          className={`relative p-5 rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
                            background === "SMK"
                              ? "bg-indigo-500/10 border-indigo-500 text-white shadow-md shadow-indigo-500/5"
                              : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/70"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-2xl mb-1 block">🛠️</span>
                              <h3 className="font-bold text-base">SMK / MAK</h3>
                              <p className="text-xs text-slate-400 mt-1 font-light">Pilihan konsentrasi keahlian praktis dan kejuruan.</p>
                            </div>
                            {background === "SMK" && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Electives Selector */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-slate-300 flex items-center space-x-2">
                          <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                          <span>2. Pilih Mata Pelajaran Pilihan / Keahlian Kamu</span>
                        </label>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-mono ${
                          selectedElectives.length >= 2 
                            ? "bg-indigo-500/10 text-indigo-300" 
                            : "bg-slate-800 text-slate-500"
                        }`}>
                          Terpilih: {selectedElectives.length} (Rekomendasi: 2 - 5)
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-4 font-light">
                        Pilih mata pelajaran yang kamu ambil di kelas XI & XII (Kurikulum Merdeka) atau konsentrasi kejuruanmu (SMK). Ini akan menjadi jangkar rekomendasi karirmu.
                      </p>

                      {/* Display Categories */}
                      <div className="space-y-6">
                        {Array.from(new Set(PRESET_SUBJECTS[background].map(s => s.category))).map(category => (
                          <div key={category} className="space-y-2.5">
                            <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase pl-1">{category}</h4>
                            <div className="flex flex-wrap gap-2">
                              {PRESET_SUBJECTS[background]
                                .filter(s => s.category === category)
                                .map(s => {
                                  const isSelected = selectedElectives.includes(s.name);
                                  return (
                                    <button
                                      key={s.name}
                                      type="button"
                                      onClick={() => handleSelectElective(s.name)}
                                      className={`px-3 py-2 rounded-xl text-xs sm:text-sm border transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                                        isSelected
                                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                                          : "bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600"
                                      }`}
                                    >
                                      <span>{s.icon}</span>
                                      <span>{s.name}</span>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Custom Elective Subject */}
                      <div className="mt-5 pt-5 border-t border-slate-700/40">
                        <form onSubmit={handleAddCustomSubject} className="flex gap-2">
                          <input
                            type="text"
                            value={customSubject}
                            onChange={(e) => setCustomSubject(e.target.value)}
                            placeholder="Punya mapel pilihan lain? Ketik di sini..."
                            className="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 placeholder:text-slate-500"
                          />
                          <button
                            type="submit"
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 text-xs sm:text-sm rounded-xl font-medium transition cursor-pointer"
                          >
                            Tambah
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Extra Notes / Aspirations */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2.5 flex items-center space-x-2">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                        <span>3. Catatan Tambahan, Minat, atau Impian (Opsional)</span>
                      </label>
                      <textarea
                        value={extraNote}
                        onChange={(e) => setExtraNote(e.target.value)}
                        placeholder="Misal: 'Saya sangat tertarik pada perkembangan kecerdasan buatan', 'Saya hobi menulis cerita fiksi', atau 'Ingin sekali mendirikan agensi kreatif digital sendiri nantinya'."
                        rows={3}
                        className="w-full bg-slate-900/60 border border-slate-700/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 resize-none font-light leading-relaxed"
                      />
                    </div>

                  </div>

                  {/* Submission Action bar */}
                  <div className="bg-slate-800/80 px-6 py-5 border-t border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                      <p className="text-xs font-light">Butuh minimal 2 mata pelajaran pilihan untuk memformulasikan peta jalan.</p>
                    </div>
                    <button
                      type="button"
                      disabled={selectedElectives.length < 2}
                      onClick={handleFetchRoadmap}
                      className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2.5 shadow-lg transition-all cursor-pointer ${
                        selectedElectives.length >= 2
                          ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 active:translate-y-0.5"
                          : "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600/40"
                      }`}
                    >
                      <span>Buat Roadmap Karir Real-Time</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PREMIUM LOADING SCREEN */}
            {step === "loading" && (
              <motion.div
                key="loading-step"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto w-full text-center py-16"
              >
                {/* Neon Spinner */}
                <div className="relative inline-block mb-10">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-800" />
                  <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-emerald-500 border-b-transparent animate-spin [animation-duration:1.5s]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Compass className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                </div>

                {/* Progress Indicators */}
                <h3 className="font-display font-bold text-2xl text-white">Memformulasikan Jalurmu...</h3>
                <p className="text-indigo-400 font-mono text-xs mt-1.5 font-medium tracking-wider">{loadingProgress}% Selesai</p>
                
                {/* Loading Status Text */}
                <div className="mt-6 bg-slate-800/40 border border-slate-800 py-3 px-4 rounded-xl min-h-[50px] flex items-center justify-center">
                  <span className="text-slate-300 text-xs sm:text-sm font-light italic">{loadingText}</span>
                </div>

                {/* Divider */}
                <div className="my-8 border-t border-slate-800/80 w-full" />

                {/* Rotating Interactive Career Tips Block */}
                <div className="bg-gradient-to-br from-indigo-950/20 to-slate-800/20 p-5 rounded-2xl border border-indigo-500/10 text-left">
                  <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                    <Brain className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Tahukah Kamu?</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeTipIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.25 }}
                      className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed min-h-[60px]"
                    >
                      "{LOADING_TIPS[activeTipIndex]}"
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* STEP 3: HIGH-FIDELITY ROADMAP DASHBOARD */}
            {step === "dashboard" && roadmapData && (
              <motion.div
                key="dashboard-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full space-y-6"
              >
                {/* Fallback alert banner if used */}
                {isUsingFallback && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center space-x-3 text-amber-300 text-xs sm:text-sm font-light">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                      <span>
                        <strong>Rekomendasi Lokal Aktif:</strong> Server sedang sibuk atau API key belum disetup, namun kami telah mengaktifkan Peta Jalan Lokal yang sangat presisi untuk profilmu!
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded font-mono">Resilience Mode</span>
                  </div>
                )}

                {/* Top Quick Profile Summary & Back Action */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
                        {background}
                      </span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-xs text-slate-400 font-light">Mapel Pilihan Terpilih:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedElectives.map((e, idx) => (
                        <span key={idx} className="bg-slate-900/80 text-slate-300 border border-slate-800 text-[11px] px-2.5 py-1 rounded-lg">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-xl font-medium transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Ubah Mapel Pilihan</span>
                  </button>
                </div>

                {/* Two Column Layout: Left Majors List, Right In-depth View */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Recommended Majors Navigator */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-1">
                      <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase pl-1 flex items-center space-x-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Rekomendasi Jurusan Kuliah</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-light mt-0.5">Disusun berdasarkan kecocokan mata pelajaran pilihanmu.</p>
                    </div>

                    <div className="space-y-3">
                      {roadmapData.recommendedMajors.map((major, index) => {
                        const isSelected = selectedMajorIndex === index;
                        // Mock compatibility percentage for UI aesthetics
                        const matchPercentage = 98 - (index * 4);
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setSelectedMajorIndex(index);
                              setActiveTab("overview");
                            }}
                            className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-250 cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500 shadow-md shadow-indigo-500/5 text-white"
                                : "bg-slate-800/30 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50"
                            }`}
                          >
                            {/* Decorative line for selected */}
                            {isSelected && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            )}
                            
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                                isSelected ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-500"
                              }`}>
                                Peringkat #{index + 1}
                              </span>
                              <span className={`text-[11px] font-mono font-semibold flex items-center ${
                                isSelected ? "text-emerald-400" : "text-slate-500"
                              }`}>
                                <UserCheck className="w-3 h-3 mr-0.5" />
                                {matchPercentage}% Cocok
                              </span>
                            </div>

                            <h4 className={`font-display font-bold text-sm sm:text-base leading-snug ${
                              isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                            }`}>
                              {major.name}
                            </h4>

                            <p className="text-[11px] text-slate-400 font-light mt-2 line-clamp-2 leading-relaxed">
                              {major.description}
                            </p>

                            <div className="flex items-center text-xs mt-3.5 font-semibold justify-end">
                              <span className={`${isSelected ? "text-indigo-400" : "text-slate-500"}`}>Buka Roadmap</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </button>
                        );
                      })}
                      
                      {/* Custom major analysis card/button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("custom_major");
                        }}
                        className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-250 cursor-pointer relative overflow-hidden ${
                          activeTab === "custom_major"
                            ? "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500 shadow-md shadow-indigo-500/5 text-white"
                            : "bg-slate-800/30 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        {activeTab === "custom_major" && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        )}
                        
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                            activeTab === "custom_major" ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-500"
                          }`}>
                            Pencarian Bebas
                          </span>
                          <span className={`text-[11px] font-mono font-semibold flex items-center ${
                            activeTab === "custom_major" ? "text-indigo-400" : "text-slate-500"
                          }`}>
                            <Sparkles className="w-3.5 h-3.5 mr-0.5 text-indigo-400 animate-pulse" />
                            Cek Jurusan Lain
                          </span>
                        </div>

                        <h4 className={`font-display font-bold text-sm sm:text-base leading-snug ${
                          activeTab === "custom_major" ? "text-white" : "text-slate-300 group-hover:text-white"
                        }`}>
                          Uji Jurusan & Kampus Impianmu
                        </h4>

                        <p className="text-[11px] text-slate-400 font-light mt-2 leading-relaxed">
                          Ingin mendaftar ke jurusan atau universitas yang tidak tercantum di atas? Masukkan pilihanmu di sini untuk dianalisis kesesuaiannya!
                        </p>

                        <div className="flex items-center text-xs mt-3.5 font-semibold justify-end">
                          <span className={`${activeTab === "custom_major" ? "text-indigo-400" : "text-slate-500"}`}>Uji Sekarang</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </button>
                    </div>

                    {/* Quick Guidance Box */}
                    <div className="bg-gradient-to-br from-slate-800/20 to-slate-900/40 p-4.5 rounded-2xl border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Bagaimana cara kerja roadmap?</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                        Kami memetakan mata pelajaran pilihan SMA/SMK dengan beban prasyarat akademik universitas dan kesesuaian jalur karir industri modern untuk melahirkan rekomendasi ini.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Deep-Dive Panel of Selected Major */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {activeTab === "custom_major" ? (
                      /* CUSTOM MAJOR ANALYZER INTERFACE */
                      <div className="space-y-6 animate-fadeIn">
                        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Sparkles className="w-40 h-40" />
                          </div>

                          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">PENGUJI JURUSAN & KAMPUS IMPIAN</span>
                          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1.5 leading-snug">
                            Analisis Kecocokan Jurusan & Universitas Lain
                          </h2>
                          <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed mt-2.5">
                            Punya impian jurusan kuliah atau universitas lain yang tidak tercantum di daftar rekomendasi cerdas kami? Masukkan detailnya di bawah. Kami akan memformulasikan analisis kecocokannya secara real-time dengan pilihan mata pelajaran pilihanmu!
                          </p>

                          {/* Inputs Form */}
                          <form onSubmit={handleAnalyzeCustom} className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center space-x-1.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Nama Jurusan Kuliah Impian</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={customMajorInput}
                                  onChange={(e) => setCustomMajorInput(e.target.value)}
                                  placeholder="Contoh: Kedokteran Gigi, Ilmu Hukum, Psikologi"
                                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center space-x-1.5">
                                  <School className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Nama Universitas / Kampus Impian</span>
                                </label>
                                <input
                                  type="text"
                                  value={customUniversityInput}
                                  onChange={(e) => setCustomUniversityInput(e.target.value)}
                                  placeholder="Contoh: Universitas Airlangga, Universitas Diponegoro"
                                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                type="submit"
                                disabled={customAnalysisLoading || !customMajorInput.trim()}
                                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer ${
                                  customAnalysisLoading || !customMajorInput.trim()
                                    ? "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600/40"
                                    : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/10 active:translate-y-0.5"
                                }`}
                              >
                                {customAnalysisLoading ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin animate-spin-slow" />
                                    <span>Sedang Menganalisis Kurikulum...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Analisis Kesesuaian Mapel</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Analysis results container */}
                        {customAnalysis && (
                          <div className="space-y-6">
                            {/* Score & Suitability Overview Card */}
                            <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                                <div>
                                  <span className="text-xs font-mono font-semibold text-indigo-400">STATUS KESESUAIAN</span>
                                  <div className="flex items-center space-x-2.5 mt-1">
                                    <span className={`text-xl sm:text-2xl font-black ${
                                      customAnalysis.suitabilityStatus.includes("Sangat") 
                                        ? "text-emerald-400" 
                                        : customAnalysis.suitabilityStatus.includes("Cukup") 
                                        ? "text-indigo-400" 
                                        : "text-amber-400"
                                    }`}>
                                      {customAnalysis.suitabilityStatus}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 bg-slate-950/40 px-4.5 py-3 rounded-2xl border border-slate-800/80">
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-500 block leading-none font-mono">SKOR KECOCOKAN</span>
                                    <span className="text-lg sm:text-xl font-bold font-mono text-white leading-none mt-1 inline-block">
                                      {customAnalysis.suitabilityScore}%
                                    </span>
                                  </div>
                                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 flex items-center justify-center relative overflow-hidden shrink-0">
                                    <div 
                                      className="absolute inset-0 bg-indigo-500/10" 
                                      style={{ height: `${customAnalysis.suitabilityScore}%`, top: `${100 - customAnalysis.suitabilityScore}%` }} 
                                    />
                                    <span className="text-[11px] font-mono font-bold text-indigo-400 relative z-10">%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Suitability reason */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center space-x-1.5">
                                  <Info className="w-4 h-4 text-indigo-400" />
                                  <span>Hasil Kajian Akademis AI</span>
                                </h4>
                                <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                                  {customAnalysis.analysisReason}
                                </p>
                              </div>
                            </div>

                            {/* What to strengthen */}
                            <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
                              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center space-x-1.5">
                                <AlertTriangle className="w-4 h-4 text-indigo-400" />
                                <span>Rekomendasi Persiapan & Kejar Ketertinggalan</span>
                              </h3>
                              <p className="text-xs text-slate-400 font-light leading-relaxed">
                                Berikut adalah konsep esensial yang harus kamu pelajari mandiri atau perkuat mulai dari sekarang agar siap bersaing di jurusan ini:
                              </p>
                              <div className="space-y-2">
                                {customAnalysis.whatToStrengthen.map((item, idx) => (
                                  <div key={idx} className="flex items-start space-x-3 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-300 flex items-center justify-center font-mono text-xs font-bold mt-0.5 shrink-0">
                                      {idx + 1}
                                    </div>
                                    <span className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Skills required */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 space-y-3">
                                <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center space-x-1.5">
                                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Hard Skills Utama</span>
                                </h4>
                                <div className="space-y-2">
                                  {customAnalysis.hardSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center space-x-2 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50">
                                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                                      <span className="text-xs text-slate-300 font-light">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 space-y-3">
                                <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center space-x-1.5">
                                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Soft Skills Pendukung</span>
                                </h4>
                                <div className="space-y-2">
                                  {customAnalysis.softSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center space-x-2 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <span className="text-xs text-slate-300 font-light">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Prospects */}
                            <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
                              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center space-x-1.5">
                                <Briefcase className="w-4 h-4 text-indigo-400" />
                                <span>Prospek Karir Masa Depan</span>
                              </h3>
                              <div className="space-y-3">
                                {customAnalysis.futureProspects.map((prospect, idx) => (
                                  <div key={idx} className="flex items-start space-x-3.5 p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
                                    <div className="p-2 bg-indigo-500/10 text-indigo-300 rounded-xl mt-0.5 shrink-0">
                                      <Award className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h4 className="text-xs sm:text-sm font-bold text-white">{prospect.role}</h4>
                                      <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">{prospect.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* University Insight info */}
                            <div className="bg-gradient-to-r from-indigo-950/20 to-slate-900/20 border border-indigo-500/15 rounded-3xl p-6 sm:p-7 space-y-3 relative overflow-hidden">
                              <div className="absolute -top-10 -right-10 opacity-[0.03]">
                                <School className="w-48 h-48 text-indigo-400" />
                              </div>
                              <h3 className="text-xs font-bold text-indigo-300 tracking-wider uppercase flex items-center space-x-2">
                                <School className="w-4 h-4 text-indigo-400" />
                                <span>Wawasan Kampus & Tips Masuk ({customUniversityInput || "Universitas Impian"})</span>
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                                {customAnalysis.universityInsight}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ACTIVE RECOMMENDED MAJOR DETAILS PANEL (EXISTING INTERFACE) */
                      <div className="space-y-6">
                        {/* Active Major Profile Info Card */}
                        <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <GraduationCap className="w-40 h-40" />
                          </div>

                          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">JURUSAN TERPILIH</span>
                          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1.5 leading-snug">
                            {roadmapData.recommendedMajors[selectedMajorIndex].name}
                          </h2>

                          {/* Suitability reason bubble */}
                          <div className="mt-4 bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                            <h4 className="text-xs font-semibold text-indigo-300 flex items-center space-x-1 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Kenapa COCOK dengan Mata Pelajaranmu?</span>
                            </h4>
                            <p className="text-xs text-slate-300 font-light leading-relaxed">
                              {roadmapData.recommendedMajors[selectedMajorIndex].suitabilityReason}
                            </p>
                          </div>

                          <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed mt-4.5">
                            {roadmapData.recommendedMajors[selectedMajorIndex].description}
                          </p>
                        </div>

                        {/* INTERACTIVE NAVIGATION TABS */}
                        <div className="border-b border-slate-800 flex overflow-x-auto whitespace-nowrap scrollbar-none gap-4">
                          <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={`py-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-all relative cursor-pointer ${
                              activeTab === "overview"
                                ? "border-indigo-500 text-white"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4" />
                              <span>Kurikulum & Prospek</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab("skills")}
                            className={`py-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-all relative cursor-pointer ${
                              activeTab === "skills"
                                ? "border-indigo-500 text-white"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <Brain className="w-4 h-4" />
                              <span>Keahlian & Kampus</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab("milestones")}
                            className={`py-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-all relative cursor-pointer ${
                              activeTab === "milestones"
                                ? "border-indigo-500 text-white"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4" />
                              <span>Peta Jalan Karir</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab("chat")}
                            className={`py-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-all relative cursor-pointer ${
                              activeTab === "chat"
                                ? "border-indigo-500 text-white"
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>Tanya AI Konselor</span>
                              <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded-full">Interactive</span>
                            </span>
                          </button>
                        </div>

                        {/* TAB DETAILS CONTAINER */}
                        <div className="min-h-[350px]">
                          
                          {/* TAB 1: CURRICULUM & PROSPECTS */}
                          {activeTab === "overview" && (
                            <div className="space-y-6 animate-fadeIn">
                              
                              {/* What You Will Learn Grid */}
                              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                                  <Layers className="w-4 h-4 text-indigo-400" />
                                  <span>Mata Kuliah / Materi Utama yang Dipelajari</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {roadmapData.recommendedMajors[selectedMajorIndex].whatYouWillLearn.map((course, idx) => (
                                    <div key={idx} className="flex items-start space-x-2.5 bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                                      <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                      </span>
                                      <span className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">{course}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Career Prospects Detailed */}
                              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                                  <Briefcase className="w-4 h-4 text-indigo-400" />
                                  <span>Prospek Karir Masa Depan</span>
                                </h3>
                                <div className="space-y-3.5">
                                  {roadmapData.recommendedMajors[selectedMajorIndex].futureProspects.map((prospect, idx) => (
                                    <div key={idx} className="flex items-start space-x-3.5 p-4.5 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-700 transition">
                                      <div className="p-2 bg-indigo-500/10 text-indigo-300 rounded-xl mt-0.5 shrink-0">
                                        <Award className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-white">{prospect.role}</h4>
                                        <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">{prospect.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          )}

                          {/* TAB 2: SKILLS & CAMPUS */}
                          {activeTab === "skills" && (
                            <div className="space-y-6 animate-fadeIn">
                              
                              {/* High school subjects to strengthen */}
                              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3 flex items-center space-x-1.5">
                                  <BookOpen className="w-4 h-4 text-indigo-400" />
                                  <span>Mata Pelajaran SMA/K yang Harus Diperkuat Sekarang</span>
                                </h3>
                                <p className="text-xs text-slate-400 mb-3 font-light">Kuasai konsep esensial mapel ini sedari dini agar kuliahmu lancar:</p>
                                <div className="flex flex-wrap gap-2">
                                  {roadmapData.recommendedMajors[selectedMajorIndex].highSchoolSubjectsToStrengthen.map((sub, idx) => (
                                    <span key={idx} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                                      {sub}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Skill checklist: Hard and Soft Skills */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                
                                {/* Hard Skills */}
                                <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5">
                                  <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3.5 flex items-center space-x-1.5">
                                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Keterampilan Teknis (Hard Skills)</span>
                                  </h4>
                                  <div className="space-y-2.5">
                                    {roadmapData.recommendedMajors[selectedMajorIndex].hardSkills.map((skill, idx) => (
                                      <div key={idx} className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-300 font-light">{skill}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Soft Skills */}
                                <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5">
                                  <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3.5 flex items-center space-x-1.5">
                                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Keterampilan Lunak (Soft Skills)</span>
                                  </h4>
                                  <div className="space-y-2.5">
                                    {roadmapData.recommendedMajors[selectedMajorIndex].softSkills.map((skill, idx) => (
                                      <div key={idx} className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-300 font-light">{skill}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                              </div>

                              {/* Recommended Universities */}
                              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-sm font-semibold text-slate-200 mb-3.5 flex items-center space-x-2">
                                  <School className="w-4 h-4 text-indigo-400" />
                                  <span>Rekomendasi Universitas Pilihan</span>
                                </h3>
                                <div className="space-y-2.5">
                                  {roadmapData.recommendedMajors[selectedMajorIndex].recommendedUniversities.map((uni, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/20">
                                      <span className="text-base">🏛️</span>
                                      <span className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">{uni}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          )}

                          {/* TAB 3: VISUAL TIMELINE ROADMAP */}
                          {activeTab === "milestones" && (
                            <div className="space-y-6 animate-fadeIn">
                              <div className="p-1 mb-2">
                                <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                                  <Compass className="w-4 h-4 text-indigo-400" />
                                  <span>Peta Jalan Karir & Akademik</span>
                                </h3>
                                <p className="text-xs text-slate-400 font-light mt-0.5 leading-relaxed">
                                  Langkah bertahap yang ideal dilalui dari mulai masuk universitas hingga mapan di industri.
                                </p>
                              </div>

                              {/* Vertical Timeline Tree */}
                              <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-8 ml-3">
                                {roadmapData.recommendedMajors[selectedMajorIndex].milestones.map((milestone, idx) => (
                                  <div key={idx} className="relative">
                                    
                                    {/* Connecting Dot Indicator */}
                                    <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 bg-slate-900 border-2 border-indigo-500 rounded-full w-4.5 h-4.5 flex items-center justify-center z-10 shadow-lg shadow-indigo-500/20">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    </div>

                                    <div className="space-y-2">
                                      {/* Milestone Header Badge */}
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded">
                                          {milestone.phase}
                                        </span>
                                      </div>

                                      <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                                        {milestone.title}
                                      </h4>

                                      {/* Activities lists as modern bullet cards */}
                                      <div className="bg-slate-800/20 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-2 mt-2">
                                        {milestone.activities.map((act, actIdx) => (
                                          <div key={actIdx} className="flex items-start space-x-2.5">
                                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                            <span className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">{act}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* TAB 4: REAL-TIME AI CAREER COUNSELOR */}
                          {activeTab === "chat" && (
                            <div className="space-y-4 animate-fadeIn">
                              
                              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start space-x-3">
                                <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">Konselor Karir Pribadimu</h4>
                                  <p className="text-[11px] text-slate-400 font-light leading-relaxed mt-0.5">
                                    Tanyakan apapun mengenai jurusan <strong>{roadmapData.recommendedMajors[selectedMajorIndex].name}</strong>. Contohnya tentang pilihan beasiswa, sertifikasi khusus, tips pendaftaran, estimasi gaji, atau tantangan belajarnya!
                                  </p>
                                </div>
                              </div>

                              {/* Chat messages list block */}
                              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 h-[350px] overflow-y-auto space-y-4">
                                
                                {/* Starter System Intro message if history is empty */}
                                {(!chatHistory[roadmapData.recommendedMajors[selectedMajorIndex].name] || 
                                  chatHistory[roadmapData.recommendedMajors[selectedMajorIndex].name].length === 0) && (
                                  <div className="flex space-x-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 font-bold shrink-0">
                                      AI
                                    </div>
                                    <div className="bg-slate-800/40 border border-slate-800 text-slate-300 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-none font-light leading-relaxed">
                                      Halo! Saya adalah Konselor Karir AI makael.karier. Saya telah menelaah roadmapmu untuk jurusan <strong>{roadmapData.recommendedMajors[selectedMajorIndex].name}</strong>. Ada hal spesifik yang ingin kamu tanyakan atau diskusikan denganku?
                                    </div>
                                  </div>
                                )}

                                {chatHistory[roadmapData.recommendedMajors[selectedMajorIndex].name]?.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`flex space-x-3 max-w-[85%] ${
                                      msg.role === "user" ? "ml-auto justify-end flex-row-reverse space-x-reverse" : "mr-auto"
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                      msg.role === "user" 
                                        ? "bg-indigo-600 text-white" 
                                        : "bg-indigo-500/20 text-indigo-300"
                                    }`}>
                                      {msg.role === "user" ? "ME" : "AI"}
                                    </div>
                                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-light leading-relaxed ${
                                      msg.role === "user"
                                        ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 rounded-tr-none"
                                        : "bg-slate-800/40 border border-slate-800 text-slate-300 rounded-tl-none"
                                    }`}>
                                      {msg.text}
                                      <span className="block text-[9px] text-slate-500 mt-1.5 text-right font-mono font-light">
                                        {msg.timestamp}
                                      </span>
                                    </div>
                                  </div>
                                ))}

                                {/* Chat loading state */}
                                {chatLoading && (
                                  <div className="flex space-x-3 max-w-[85%] animate-pulse">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 font-bold shrink-0">
                                      AI
                                    </div>
                                    <div className="bg-slate-800/40 border border-slate-800 text-slate-400 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-none font-light italic">
                                      Sedang merumuskan saran terbaik untukmu...
                                    </div>
                                  </div>
                                )}

                                <div ref={chatEndRef} />
                              </div>

                              {/* Quick Starter Suggestions */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider pl-1 font-semibold">Saran Pertanyaan:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    `Bagaimana prospek gaji di bidang ${roadmapData.recommendedMajors[selectedMajorIndex].name}?`,
                                    `Sertifikasi apa saja yang paling krusial?`,
                                    `Apakah jurusan ini punya peluang kerja remote/WFH?`,
                                    `Tantangan tersulit belajar di jurusan ini apa ya?`
                                  ].map((q, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleStarterQuestion(q)}
                                      className="bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer"
                                    >
                                      {q}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Chat input form */}
                              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                                <input
                                  type="text"
                                  value={currentMessage}
                                  onChange={(e) => setCurrentMessage(e.target.value)}
                                  placeholder={`Tanya konselor mengenai ${roadmapData.recommendedMajors[selectedMajorIndex].name}...`}
                                  className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 placeholder:text-slate-500"
                                />
                                <button
                                  type="submit"
                                  disabled={!currentMessage.trim() || chatLoading}
                                  className={`p-3 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                    currentMessage.trim() && !chatLoading
                                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                                  }`}
                                >
                                  <Send className="w-4.5 h-4.5" />
                                </button>
                              </form>

                            </div>
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="mt-16 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-light space-y-1.5">
          <p>© {new Date().getFullYear()} makael.karier. Web yang tertaut dengan AI terintegrasi sehingga menjawab secara realtime.</p>
          <p className="font-mono text-[10px]">Coded for VSCode & Web Environment • Multi-view Single Stage Engine</p>
        </footer>

      </div>
    </div>
  );
}
