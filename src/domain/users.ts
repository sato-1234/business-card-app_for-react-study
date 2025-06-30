export class Users {
  public user_id: string;
  public name: string;
  public description: string;
  public github_id: string;
  public qiita_id: string;
  public x_id: string;

  constructor(
    user_id: string,
    name: string,
    description: string,
    github_id: string,
    qiita_id: string,
    x_id: string
  ) {
    this.user_id = user_id;
    this.name = name;
    this.description = description;
    this.github_id = github_id;
    this.qiita_id = qiita_id;
    this.x_id = x_id;
  }
}
