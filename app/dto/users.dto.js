export default class UsersDto {
  static getUser({ name, surname, email }) {
    return { name, surname, email };
  }
}
