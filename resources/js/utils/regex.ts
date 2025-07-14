const Regex = {
  email: /.+\@.+\..+/, // Any email
  password: /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/, //  6 characters, 1 uppercase letter, 1 lowercase letter, and 1 number with no spaces.
  singleNumber: /[0-9]/,
  singleCapitalLetter: /[A-Z]/,
  singleSpecialCharacter: /[!@#$%^&*]/,
}

export default Regex
