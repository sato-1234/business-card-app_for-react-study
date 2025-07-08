// Skillの定義
// type Skill = {
//   skill_id: number;
//   name: string;
// };

// type の場合
// export type Card = {
//   card_id: string;
//   name: string;
//   description: string;
//   github_id: string | null;
//   qiita_id: string | null;
//   x_id: string | null;
//   skills: Skill[];
// };

export class Skill {
  skill_id: number;
  name: string;

  constructor(skill_id: number, name: string) {
    (this.skill_id = skill_id), (this.name = name);
  }
}

export class Card {
  public card_id: string;
  public name: string;
  public description: string;
  public github_id: string | null;
  public qiita_id: string | null;
  public x_id: string | null;
  public skills: Skill[];

  constructor(
    card_id: string,
    name: string,
    description: string,
    github_id: string | null,
    qiita_id: string | null,
    x_id: string | null,
    skills: Skill[]
  ) {
    this.card_id = card_id;
    this.name = name;
    this.description = description;
    this.github_id = github_id;
    this.qiita_id = qiita_id;
    this.x_id = x_id;
    this.skills = skills;
  }
}
