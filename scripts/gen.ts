import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const questions = [
  {
    id: "q1",
    answer: "我是一个想要创造人类推动力的人， 亦或者是为了人类底层那些有价值的土壤奋斗的人... 后面AI的出现， 让我觉得有可能能通过AI技术的发展， 把同样一个高质量的服务扩散到更多人的手里， 我想用AI和人的这种推动力结合去创造更多的价值来"
  },
  {
    id: "q2",
    answer: "最近在研究的事情， 一个是和AI产品有关，觉得龙虾的出现， 所以说可能逻辑逐渐从vibe coding这种转变到vibe egineering vibe system这种更系统化的事情上， 在寻找有没有把AI产品能系统结合到心理学理论的可能性。 还有一个为在打篮球班赛之前 的一个5V5阵容决策系统，涉及防守策略 球权分配 进攻策略等"
  },
  {
    id: "q3",
    answer: "我有一个从小到大喜欢的偶像， 从三年级一直喜欢到现在， 是一位科学家叫特斯拉， 发明了交流电， 亲手撕了专利， 不然特斯拉已经是世界首富了， 晚年穷困潦倒奔波于不同酒店后去世。对于金钱我觉得满足日常生活正常需要就行，剩下就是专注于创造价值，我也想要钱， 但是不追求钱"
  },
  {
    id: "q4",
    answer: "个人来说的话就是我最惧怕我的passion被消耗掉或者慢慢变形... 我最惧怕的就是无数的人能够构建起一个极其庞大的注意力获取系统（算法） 从中千千万万的人都成为构建算法构建系统的一部分， 随着系统越来越完善， 也会吸引更多的人把自己的注意力资源贡献出来， 牺牲给系统， 届时甚至将会破坏人类作为群体的完整体及其它的。"
  },
  {
    id: "q5",
    answer: "我看到的是一个乌托邦. 人机共存，更多与众不同，独立， 有自己核心的AI通过硬件的方式， 完全摆脱苹果和安卓生态， 产生更多元 更多人格的机械态形式和人类结合... 塑造未来的还是以人为本以及人和人之间的这种爱 还有AI科技的发展以及技术平权的思想"
  },
  {
    id: "q6",
    answer: "一小步是和AI创业有关，这也是我想要发展的方向， 另外一个是课程里面写到的人类文明拼图， 所以说我觉得是有带有理想主义以及想要改变世界的成分在的... 我想让更多人觉得创业是改变世界的一种非常好的方式"
  },
  {
    id: "q7",
    answer: "我希望未来能在人机结合上作出影响， 具体来说就是可能是从一个具体的生活需求入手借助AI去解决这个需求， 也可能是通过建立一个全新的社交平台去改变人和人之间的这种协作方式， 又或者是从人的心理需求入手去构建一个平台或者有意义的产品，能更好地促进提升人的一些特质"
  }
];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateImage(prompt: string, filepath: string) {
  try {
    // Try nanabanana2 (gemini-3.1-flash-image-preview) first
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: prompt,
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });
    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64) {
      fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));
      console.log(`Generated (3.1): ${filepath}`);
      return true;
    }
  } catch (e: any) {
    console.log(`3.1 failed for ${filepath} (${e.message}), trying 2.5...`);
    try {
      // Fallback to nanabanana (gemini-2.5-flash-image)
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });
      const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));
        console.log(`Generated (2.5): ${filepath}`);
        return true;
      }
    } catch (err: any) {
      console.error(`Failed completely for ${filepath}:`, err.message);
    }
  }
  return false;
}

async function main() {
  const dir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Generate 3 images for each question
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const prompt = `Create a highly artistic, futuristic, tech-vibe, abstract illustration based on this text: "${q.answer}". The color palette MUST be strictly black and glowing red. High contrast, cinematic lighting, cyberpunk or abstract tech aesthetic. No text in the image.`;
    
    // Run 3 generations in parallel for this question to save time
    const promises = [];
    for (let j = 0; j < 3; j++) {
      const filepath = path.join(dir, `${q.id}_${j + 1}.jpg`);
      if (!fs.existsSync(filepath)) {
        promises.push(generateImage(prompt, filepath));
      }
    }
    await Promise.all(promises);
  }
}

main();
