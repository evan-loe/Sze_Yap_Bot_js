/**
 * Sample select statement for condition
 */
// db.select({
//   where: "id",
//   condition: "equal",
//   satisfies: "45678924"
// })

class Conditions {

  static evaluations = {
    "equals": this.equals,
  }

  static evaluate(l, r, condition) {
    return this.evaluations[condition](l, r)
  }

  static equals(l, r) {
    return l == r
  }

}



module.exports = {
  Conditions
}