// Website Title
const websiteTitle = process.env.WEBSITE_TITLE;

// Is Offline?
const isOffline = process.env.ISOFFLINE;

// App Credentials
const appUser = process.env.APP_USER;
const appPassword = process.env.APP_PASSWORD;

module.exports = function(app){
  
  /*
    Welcome!
  */
  app.get("/", function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    res.render('home', { title: websiteTitle, nav: 'home', server: req.protocol + 's://' + req.get('host'), user: appUser, password: appPassword });
  });

  /*
    Login page for testing
  */
  app.get("/login", function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    res.render('login', { title: websiteTitle, nav: 'login' });
  });

  /*
    JWT Token verification page for testing
  */
  app.get("/verify", function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    res.render('verify', { title: websiteTitle, nav: 'verify' });
  });

  /*
    Contact lookup page for testing
  */
  app.get("/contact/lookup", function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    res.render('contact', { title: websiteTitle, nav: 'contact' });
  });
}