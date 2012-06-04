<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Welcome to notebook</title>
    <style>
        body {
            padding-top: 80px;
            height: 100%;
        }
    </style>
    <link href="static/css/bootstrap.css" rel="stylesheet">
    <link href="static/css/styles.css" rel="stylesheet">
    <link href="static/css/sticky_footer.css" rel="stylesheet">
    <link rel="shortcut icon" href="static/favicon.ico">
</head>

<body>
    <div class="header">
    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <a class="brand" href="/">Notebook</a>
        </div>
      </div>
    </div>    
  </div>
  <div class="container">
      <div class="row">
          <div id="description" class="offset2 span3 well">
            <h1>Notebook</h1>
            <h6>сервис для работы с заметками, consectetur adipiscing elit. Curabitur sem ante, cursus eu hendrerit eget, auctor nec urna. Etiam aliquam quam id mauris tristique suscipit lobortis sem molestie. Sed cursus imperdiet diam, sit amet elementum mi interdum eu.
            </h6>
          </div>
          <div id="content" class="span4 well">
            <div class="tabbable">
              <ul class="nav nav-tabs">
                <li class="active"><a href="#tab_signin" data-toggle="tab">Вход</a></li>
                <li><a href="#tab_signup" data-toggle="tab">Регистрация</a></li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane active" id="tab_signin">
                  <div id="alert_signin" class="alert">
                    <div class="alert_text">Message</div>
                  </div>
                  <div>
                    <div class="controls">
                      <input type="text" class="span3" name="username" placeholder="Имя пользователя или e-mail">
                    </div>
                    <div class="controls">
                      <input type="password" class="span3" name="password" placeholder="Пароль">
                    </div>
                    <div class="controls">
                      <button id="btn-signin" class="btn">Войти</button>
                    </div>
                  </div>                
                </div>
                <div class="tab-pane" id="tab_signup">
                  <div id="alert_signup" class="alert">
                    <div class="alert_text">Message</div>
                  </div>
                  <div>
                    <div class="controls">
                      <input type="text" class="span3" name="username" placeholder="Имя пользователя">
                    </div>
                    <div class="controls">
                      <input type="text" class="span3" name="email" placeholder="E-mail">
                    </div>  
                    <div class="controls">
                      <input type="password" class="span3" name="password" placeholder="Пароль">
                    </div>
                    <div class="controls">
                      <button id="btn-signup" class="btn">Зарегистрироваться</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
  </div>
  <script src="static/lib/jquery.js"></script>
  <script src="static/lib/bootstrap.js"></script>
  <script src="static/js/main_noauth.js"></script>
</body>
</html>