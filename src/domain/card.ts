// Skillの定義（classでも良いがコンストラクタと初期値の記載がいる）
type Skill = {
  skill_id: number;
  name: string;
};

// Userの型定義を class から type に変更
export type Card = {
  card_id: string;
  name: string;
  description: string;
  github_id: string | null;
  qiita_id: string | null;
  x_id: string | null;
  skills: Skill[];
};

// export class Card {
//   public card_id: string;
//   public name: string;
//   public description: string;
//   public github_id: string;
//   public qiita_id: string;
//   public x_id: string;
//   public skills: Skill[];

//   constructor(
//     card_id: string,
//     name: string,
//     description: string,
//     github_id: string,
//     qiita_id: string,
//     x_id: string,
//     skills: Skill[]
//   ) {
//     this.card_id = card_id;
//     this.name = name;
//     this.description = description;
//     this.github_id = github_id;
//     this.qiita_id = qiita_id;
//     this.x_id = x_id;
//     this.skills = [];
//   }
// }
