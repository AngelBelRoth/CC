module.exports = {
  getIndex: (req, res) => {
    if (req.user) {
    return res.redirect("/profile");
  }
    res.render("index.ejs");
  },
};
