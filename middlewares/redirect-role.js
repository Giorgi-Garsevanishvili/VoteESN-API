const redirectByRole = (req, res) => {

  if (req.user.role === "admin") {
    console.log("admin");
  } else {
    console.log("voter");
  }
};

module.exports = redirectByRole;
