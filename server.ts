import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Google Gen AI client with User-Agent set for AI Studio build telemetry
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY tidak ditemukan di environment variables. Silakan atur di Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Generate Career Roadmap based on high school electives
app.post("/api/roadmap", async (req, res) => {
  try {
    const { background, electives, extraNote } = req.body;

    if (!background || !electives || !Array.isArray(electives)) {
      return res.status(400).json({
        error: "Data masukan tidak lengkap. Diperlukan latar belakang (SMA/SMK) dan daftar mata pelajaran pilihan."
      });
    }

    const ai = getAiClient();
    
    const prompt = `
      Saya adalah siswa/siswi sekolah menengah dengan latar belakang: ${background}.
      Mata pelajaran pilihan atau keahlian utama yang saya ambil adalah: ${electives.join(", ")}.
      ${extraNote ? `Catatan tambahan tentang minat atau hobi saya: "${extraNote}"` : ""}

      Tolong berikan rekomendasi jurusan kuliah terbaik yang sangat sesuai dengan profil mata pelajaran pilihan saya tersebut.
      Berikan minimal 3 dan maksimal 4 rekomendasi jurusan kuliah. Untuk setiap jurusan kuliah, sertakan penjelasan mendalam yang personal, mengapa cocok dengan mata pelajaran pilihan saya, apa yang dipelajari, prospek karir masa depan, keterampilan (hard & soft) yang dikembangkan, mata pelajaran pilihan SMA yang harus diperkuat, rekomendasi universitas Indonesia & internasional, serta visual milestones karir dari awal kuliah hingga profesional senior.

      Berikan jawaban dalam bahasa Indonesia yang sangat ramah, inspiratif, profesional, dan informatif.
    `;

    const systemInstruction = `
      Anda adalah Konselor Karir Profesional Indonesia yang cerdas dan suportif.
      Tugas Anda adalah memetakan masa depan akademis dan karir siswa SMA/SMK berdasarkan mata pelajaran pilihan yang mereka ambil.
      Berikan jawaban yang akurat, realistis namun memotivasi, dan berorientasi pada masa depan (tren industri saat ini seperti AI, Green Energy, Bisnis Digital, Kedokteran Modern, dll.).
      Jawaban harus terstruktur dengan sempurna sesuai dengan format skema JSON yang diminta.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedMajors: {
              type: Type.ARRAY,
              description: "Daftar jurusan kuliah yang direkomendasikan",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { 
                    type: Type.STRING, 
                    description: "Nama jurusan kuliah resmi dalam Bahasa Indonesia atau istilah global populer" 
                  },
                  suitabilityReason: { 
                    type: Type.STRING, 
                    description: "Penjelasan mengapa jurusan ini sangat cocok dengan gabungan mata pelajaran pilihan yang diambil siswa" 
                  },
                  description: { 
                    type: Type.STRING, 
                    description: "Penjelasan mendalam mengenai apa itu jurusan tersebut secara filosofis dan aplikatif" 
                  },
                  whatYouWillLearn: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar mata kuliah utama atau topik utama yang akan dipelajari di bangku kuliah"
                  },
                  futureProspects: {
                    type: Type.ARRAY,
                    description: "Prospek kerja konkret di masa depan dengan deskripsi perannya",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        role: { type: Type.STRING, description: "Nama peran karir / profesi, misal: AI Engineer, Data Analyst" },
                        description: { type: Type.STRING, description: "Penjelasan singkat mengenai pekerjaan dan prospeknya" }
                      },
                      required: ["role", "description"]
                    }
                  },
                  highSchoolSubjectsToStrengthen: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Mata pelajaran pilihan sekolah yang harus benar-benar diperkuat konsepnya"
                  },
                  hardSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3-5 keterampilan teknis (hard skills) utama yang akan dikuasai"
                  },
                  softSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3-5 keterampilan interpersonal (soft skills) utama yang sangat krusial"
                  },
                  recommendedUniversities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar universitas terbaik, bedakan antara Universitas Dalam Negeri terkemuka (misal: UI, ITB, UGM) dan Luar Negeri (misal: NUS, MIT, Oxford)"
                  },
                  milestones: {
                    type: Type.ARRAY,
                    description: "Langkah-langkah konkrit peta jalan (roadmap) karir dari masa kuliah hingga mencapai level ahli/senior",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        phase: { type: Type.STRING, description: "Fase waktu, misalnya: 'Kuliah Tahun 1-2', 'Kuliah Tahun 3-4', 'Awal Karir (1-3 Tahun)', 'Karir Senior / Ahli (5+ Tahun)'" },
                        title: { type: Type.STRING, description: "Judul milestone / fokus utama pada fase tersebut" },
                        activities: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "Daftar aksi, proyek, magang, atau sertifikasi yang wajib dilakukan di fase ini"
                        }
                      },
                      required: ["phase", "title", "activities"]
                    }
                  }
                },
                required: [
                  "name", "suitabilityReason", "description", "whatYouWillLearn", "futureProspects",
                  "highSchoolSubjectsToStrengthen", "hardSkills", "softSkills", "recommendedUniversities", "milestones"
                ]
              }
            }
          },
          required: ["recommendedMajors"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Model Gemini tidak mengembalikan teks respon.");
    }

    const data = JSON.parse(text.trim());
    return res.json(data);

  } catch (error: any) {
    console.error("Error generating roadmap:", error);
    return res.status(500).json({
      error: error.message || "Gagal menghasilkan roadmap karir real-time. Pastikan GEMINI_API_KEY valid."
    });
  }
});

// 2. API: Follow-up Chat with Career AI Counselor
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    const ai = getAiClient();

    // Prepare system instructions incorporating the user's roadmap context
    const contextString = context ? `Siswa saat ini sedang melihat roadmap karir untuk jurusan: "${context.currentMajor}". Detail profil siswa: latar belakang ${context.background}, mapel pilihan: ${context.electives.join(", ")}.` : "";

    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `
          Anda adalah Konselor Karir Profesional Indonesia yang cerdas, ramah, dan solutif.
          Bantulah siswa ini menjawab pertanyaan lanjutan mengenai masa depan mereka, rincian jurusan, tips belajar, universitas impian, persiapan mental, sertifikasi, magang, atau tips wawancara kerja.
          Gunakan bahasa Indonesia yang hangat, sopan, memotivasi, dan mudah dipahami oleh siswa SMA/SMK.
          Jangan berikan jawaban template yang kaku. Berikan saran-saran praktis yang aplikatif.
          ${contextString}
        `,
      }
    });

    // If history is provided, we can populate history or pass single context
    // The @google/genai SDK chats.create allows loading messages if needed,
    // or we can generateContent with conversation context. Let's send a single consolidated prompt with history if present to keep it highly robust
    let fullPrompt = "";
    if (history && Array.isArray(history) && history.length > 0) {
      fullPrompt += "Berikut adalah riwayat percakapan sebelumnya untuk konteks:\n";
      history.forEach((h: any) => {
        const sender = h.role === "user" ? "Siswa" : "Konselor";
        fullPrompt += `${sender}: ${h.text}\n`;
      });
      fullPrompt += "\n";
    }
    fullPrompt += `Siswa bertanya: "${message}"\nKonselor, tolong jawab pertanyaan ini secara detail dan suportif:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
    });

    return res.json({ text: response.text });

  } catch (error: any) {
    console.error("Error in career counselor chat:", error);
    return res.status(500).json({
      error: error.message || "Terjadi kesalahan pada chatbot konselor karir."
    });
  }
});

// 3. API: Analyze compatibility of a custom major & custom university entered by the user
app.post("/api/analyze-custom", async (req, res) => {
  try {
    const { background, electives, customMajor, customUniversity } = req.body;

    if (!background || !electives || !Array.isArray(electives) || !customMajor) {
      return res.status(400).json({
        error: "Data masukan tidak lengkap. Diperlukan latar belakang (SMA/SMK), daftar mata pelajaran pilihan, dan nama jurusan impian."
      });
    }

    const ai = getAiClient();

    const prompt = `
      Saya adalah siswa/siswi dengan latar belakang: ${background}.
      Mata pelajaran pilihan atau keahlian utama yang saya ambil di sekolah: ${electives.join(", ")}.
      
      Saya ingin sekali berkuliah di jurusan: "${customMajor}" di universitas: "${customUniversity || "Universitas pilihan saya"}".
      
      Tolong analisis kecocokan (kesesuaian) antara latar belakang serta mata pelajaran pilihan yang saya ambil dengan jurusan kuliah yang saya inginkan tersebut.
      
      Tentukan dengan bijaksana status kecocokan:
      - 'Sangat Cocok' (jika mata pelajaran pilihan sangat mendukung mata kuliah inti jurusan ini, misal Informatika/Matematika dengan Teknik Informatika)
      - 'Cukup Cocok' (jika masih memiliki irisan pendukung atau keterampilan dasar yang berharga)
      - 'Kurang Cocok' (jika hampir tidak ada keselarasan akademis langsung, sehingga butuh perjuangan ekstra dari siswa)
      
      Kembalikan ulasan yang sangat mendalam, ramah, jujur namun memotivasi, dan berorientasi masa depan dalam skema JSON yang diminta.
    `;

    const systemInstruction = `
      Anda adalah Konselor Karir Profesional Indonesia yang cerdas dan suportif.
      Berikan analisis kecocokan akademis secara jujur tapi tetap memberi dorongan semangat kepada siswa.
      Jika siswa memilih jurusan yang kurang cocok dengan mata pelajaran pilihannya, jelaskan tantangannya secara realistis dan berikan tips konkret/solutif untuk mengejar ketertinggalan tersebut (misal belajar mandiri, mengambil kursus tambahan, dll.).
      Jawaban harus terstruktur dengan sempurna sesuai dengan format skema JSON yang diminta.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suitabilityStatus: { 
              type: Type.STRING, 
              description: "Status kecocokan: 'Sangat Cocok', 'Cukup Cocok', atau 'Kurang Cocok'" 
            },
            suitabilityScore: { 
              type: Type.INTEGER, 
              description: "Persentase skor kecocokan dari 0 hingga 100 berdasarkan relevansi mapel pilihan" 
            },
            analysisReason: { 
              type: Type.STRING, 
              description: "Penjelasan mendalam mengapa pilihan tersebut dinilai demikian dikaitkan dengan mata pelajaran pilihan siswa" 
            },
            whatToStrengthen: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Langkah konkrit atau topik pembelajaran yang harus segera diperkuat atau dipelajari mandiri oleh siswa untuk menunjang jurusan ini"
            },
            futureProspects: {
              type: Type.ARRAY,
              description: "Prospek karir utama dari jurusan pilihan ini di masa depan",
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING, description: "Nama peran profesi" },
                  description: { type: Type.STRING, description: "Penjelasan singkat peran tersebut" }
                },
                required: ["role", "description"]
              }
            },
            hardSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar hard skills utama yang sangat mendasar di jurusan ini"
            },
            softSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar soft skills utama yang sangat menunjang keberhasilan di jurusan ini"
            },
            universityInsight: {
              type: Type.STRING,
              description: "Tips masuk, ulasan prestise, jalur masuk, atau saran khusus terkait universitas yang dimasukkan oleh siswa"
            }
          },
          required: [
            "suitabilityStatus", "suitabilityScore", "analysisReason", "whatToStrengthen", 
            "futureProspects", "hardSkills", "softSkills", "universityInsight"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Model Gemini tidak mengembalikan analisis.");
    }

    const data = JSON.parse(text.trim());
    return res.json(data);

  } catch (error: any) {
    console.error("Error analyzing custom major:", error);
    return res.status(500).json({
      error: error.message || "Gagal melakukan analisis jurusan impian secara real-time."
    });
  }
});

// Serve Vite frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[makael.karier Server] Berjalan pada http://localhost:${PORT}`);
  });
}

// Hanya jalankan server lokal jika tidak berada di lingkungan Vercel Serverless
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
